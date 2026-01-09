"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiPost } from "../_components/api";

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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    apiFetch<{ ok: boolean; data: NotificationItem[] }>("/api/notifications?limit=50")
      .then((payload) => setNotifications(payload.data ?? []))
      .catch(() => setError("Nie udało się pobrać powiadomień."));
  };

  useEffect(() => {
    refresh();
  }, []);

  const unreadIds = notifications.filter((item) => !item.readAt).map((item) => item.id);

  return (
    <div>
      <h1 className="section-title">Powiadomienia</h1>
      {error ? <p className="muted">{error}</p> : null}
      {unreadIds.length > 0 ? (
        <button
          onClick={async () => {
            await apiPost("/api/notifications/read", { ids: unreadIds });
            refresh();
          }}
        >
          Oznacz jako przeczytane
        </button>
      ) : null}
      <div className="card">
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
      </div>
    </div>
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
