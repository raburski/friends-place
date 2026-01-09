import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import { useSession } from "../auth/useSession";

export type NotificationItem = {
  id: string;
  type: string;
  readAt?: string | null;
  createdAt: string;
  payload: Record<string, unknown>;
};

type NotificationsContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const refresh = useCallback(async () => {
    if (!session) {
      setNotifications([]);
      return;
    }
    const payload = await apiGet<{ ok: boolean; data: NotificationItem[] }>(
      "/api/notifications?limit=50",
      session.token
    );
    setNotifications(payload.data ?? []);
  }, [session]);

  const markAllRead = useCallback(async () => {
    if (!session) {
      return;
    }
    const unreadIds = notifications.filter((item) => !item.readAt).map((item) => item.id);
    if (unreadIds.length === 0) {
      return;
    }
    await apiPost("/api/notifications/read", session.token, { ids: unreadIds });
    await refresh();
  }, [notifications, refresh, session]);

  useEffect(() => {
    refresh().catch(() => {
      setNotifications([]);
    });
  }, [refresh]);

  const unreadCount = notifications.filter((item) => !item.readAt).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, refresh, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
}
