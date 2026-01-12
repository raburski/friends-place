import { useEffect, useRef } from "react";
import { useNotificationPermissions } from "./useNotificationPermissions";
import { usePushTokenRegistration } from "./usePushTokenRegistration";

export function PushTokenRegistrar() {
  const { enabled } = useNotificationPermissions();
  const { ensureRegistered, unregister } = usePushTokenRegistration();
  const lastEnabled = useRef<boolean | null>(null);

  useEffect(() => {
    if (enabled) {
      void ensureRegistered();
    }
  }, [enabled, ensureRegistered]);

  useEffect(() => {
    if (lastEnabled.current === null) {
      lastEnabled.current = enabled;
      return;
    }
    if (lastEnabled.current && !enabled) {
      void unregister();
    }
    lastEnabled.current = enabled;
  }, [enabled, unregister]);

  return null;
}
