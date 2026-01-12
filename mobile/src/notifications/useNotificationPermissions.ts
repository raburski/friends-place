import { AppState, Linking } from "react-native";
import { useCallback, useEffect, useState } from "react";
import * as Notifications from "expo-notifications";

export function useNotificationPermissions() {
  const [permissions, setPermissions] =
    useState<Notifications.NotificationPermissionsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await Notifications.getPermissionsAsync();
      setPermissions(next);
      return next;
    } catch {
      setPermissions(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setRequesting(true);
    try {
      const next = await Notifications.requestPermissionsAsync();
      setPermissions(next);
      return next;
    } finally {
      setRequesting(false);
    }
  }, []);

  const openSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refresh();
      }
    });

    return () => subscription.remove();
  }, [refresh]);

  const provisional =
    permissions?.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  const enabled = Boolean(permissions?.granted || provisional);
  const canAskAgain = permissions?.canAskAgain ?? true;
  const status = permissions?.status ?? null;

  return {
    permissions,
    loading,
    requesting,
    refresh,
    requestPermission,
    openSettings,
    enabled,
    provisional,
    canAskAgain,
    status
  };
}
