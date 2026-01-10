import { createContext, useCallback, useContext } from "react";
import { useMobileApiOptions, useMobileApiQueryOptions } from "../api/useMobileApiOptions";
import { useNotificationsQuery } from "../../../shared/query/hooks/useQueries";
import { useMarkNotificationsReadMutation } from "../../../shared/query/hooks/useMutations";

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
  const apiOptions = useMobileApiOptions();
  const apiQueryOptions = useMobileApiQueryOptions();
  const notificationsQuery = useNotificationsQuery(50, apiQueryOptions);
  const markReadMutation = useMarkNotificationsReadMutation(apiOptions);

  const notifications = notificationsQuery.data?.data ?? [];

  const refresh = useCallback(async () => {
    await notificationsQuery.refetch();
  }, [notificationsQuery]);

  const markAllRead = useCallback(async () => {
    const unreadIds = notifications.filter((item) => !item.readAt).map((item) => item.id);
    if (unreadIds.length === 0) {
      return;
    }
    await markReadMutation.mutateAsync(unreadIds);
    await refresh();
  }, [markReadMutation, notifications, refresh]);

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
