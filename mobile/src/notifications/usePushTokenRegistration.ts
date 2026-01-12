import { useCallback, useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { apiPost } from "../api/client";
import { useSession } from "../auth/useSession";
import { clearPushToken, loadPushToken, storePushToken } from "./pushTokenStore";

type RegisterOptions = {
  shouldRequestPermissions?: boolean;
};

const isPermissionEnabled = (permissions: Notifications.NotificationPermissionsStatus) =>
  Boolean(
    permissions.granted ||
      permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );

const resolveProjectId = () => {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? null;
};

export function usePushTokenRegistration() {
  const { session } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncingRef = useRef(false);
  const lastSyncedTokenRef = useRef<string | null>(null);

  const syncTokenWithBackend = useCallback(
    async (nextToken: string) => {
      if (!session?.token) {
        return false;
      }
      try {
        await apiPost("/api/push/register", session.token, { token: nextToken });
        return true;
      } catch {
        return false;
      }
    },
    [session?.token]
  );

  useEffect(() => {
    loadPushToken()
      .then((stored) => setToken(stored))
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!session?.token || !token || token === lastSyncedTokenRef.current || syncingRef.current) {
      return;
    }
    syncingRef.current = true;
    syncTokenWithBackend(token)
      .then((ok) => {
        if (ok) {
          lastSyncedTokenRef.current = token;
        }
      })
      .finally(() => {
        syncingRef.current = false;
      });
  }, [session?.token, syncTokenWithBackend, token]);

  const register = useCallback(
    async ({ shouldRequestPermissions = false }: RegisterOptions = {}) => {
      setLoading(true);
      setError(null);
      try {
        if (!Device.isDevice) {
          setError("not_device");
          return null;
        }

        let permissions = await Notifications.getPermissionsAsync();
        if (!isPermissionEnabled(permissions) && shouldRequestPermissions) {
          permissions = await Notifications.requestPermissionsAsync();
        }

        if (!isPermissionEnabled(permissions)) {
          setError("permission_denied");
          return null;
        }

        const projectId = resolveProjectId();
        const response = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );
        const nextToken = response.data;
        await storePushToken(nextToken);
        setToken(nextToken);
        if (session?.token) {
          const ok = await syncTokenWithBackend(nextToken);
          if (ok) {
            lastSyncedTokenRef.current = nextToken;
          }
        }
        return nextToken;
      } catch {
        setError("unknown");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session?.token, syncTokenWithBackend]
  );

  const ensureRegistered = useCallback(async () => {
    if (token) {
      await syncTokenWithBackend(token);
      return token;
    }
    return register({ shouldRequestPermissions: false });
  }, [register, syncTokenWithBackend, token]);

  const unregister = useCallback(async () => {
    if (!token) {
      return false;
    }
    try {
      if (session?.token) {
        await apiPost("/api/push/unregister", session.token, { token });
      }
      await clearPushToken();
      setToken(null);
      lastSyncedTokenRef.current = null;
      return true;
    } catch {
      return false;
    }
  }, [session?.token, token]);

  return {
    token,
    loading,
    error,
    register,
    ensureRegistered,
    unregister
  };
}
