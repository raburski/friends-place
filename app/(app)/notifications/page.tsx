"use client";

import { useMemo } from "react";
import { useWebApiOptions } from "../../_components/useWebApiOptions";
import { useNotificationsQuery } from "../../../shared/query/hooks/useQueries";
import { useMarkNotificationsReadMutation } from "../../../shared/query/hooks/useMutations";
import { Button } from "../../_components/Button";
import { SectionCard } from "../../_components/SectionCard";
import { ScreenLayout } from "../../_components/ScreenLayout";

const labels: Record<string, string> = {
  friend_accepted: "Zaproszenie przyjęte",
  booking_requested: "Nowa prośba o pobyt",
  booking_approved: "Pobyt zaakceptowany",
  booking_declined: "Pobyt odrzucony",
  booking_canceled: "Pobyt anulowany",
  place_deactivated: "Miejsce wyłączone",
  availability_conflict: "Konflikt dostępności",
  invite_signup: "Znajomy dołączył"
};

type NotificationItem = {
  id: string;
  type: string;
  readAt?: string | null;
  createdAt: string;
  payload: Record<string, unknown>;
};

export default function NotificationsPage() {
  const apiOptions = useWebApiOptions();
  const notificationsQuery = useNotificationsQuery(50, apiOptions);
  const notifications = useMemo(
    () => notificationsQuery.data?.data ?? [],
    [notificationsQuery.data]
  );
  const error = notificationsQuery.isError ? "Nie udało się pobrać powiadomień." : null;

  const markReadMutation = useMarkNotificationsReadMutation(apiOptions);
  const markReadIsPending =
    (markReadMutation as { isPending?: boolean }).isPending ??
    (markReadMutation as { isLoading?: boolean }).isLoading ??
    false;

  const unreadIds = notifications.filter((item) => !item.readAt).map((item) => item.id);

  return (
    <ScreenLayout title="Powiadomienia">
      {error ? <p className="muted">{error}</p> : null}
      {unreadIds.length > 0 ? (
        <Button
          loading={markReadIsPending}
          loadingLabel="Oznaczanie..."
          onClick={() => markReadMutation.mutate(unreadIds)}
        >
          Oznacz jako przeczytane
        </Button>
      ) : null}
      <SectionCard>
        {notifications.length === 0 ? (
          <p className="muted">Brak powiadomień.</p>
        ) : (
          notifications.map((item) => (
            <div key={item.id} style={{ marginBottom: 8, opacity: item.readAt ? 0.6 : 1 }}>
              <strong>{labels[item.type] ?? item.type}</strong>
              <div className="muted">{subtitle(item.payload)}</div>
            </div>
          ))
        )}
      </SectionCard>
    </ScreenLayout>
  );
}

function subtitle(payload: Record<string, unknown>) {
  const placeName = typeof payload.placeName === "string" ? payload.placeName : null;
  const start = typeof payload.startDate === "string" ? payload.startDate : null;
  const end = typeof payload.endDate === "string" ? payload.endDate : null;

  if (placeName && start && end) {
    return `${placeName} · ${start} → ${end}`;
  }
  if (placeName) {
    return placeName;
  }
  if (start && end) {
    return `${start} → ${end}`;
  }
  return "";
}
