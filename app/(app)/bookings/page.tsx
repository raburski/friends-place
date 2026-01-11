"use client";

import { useMemo } from "react";
import { useWebApiOptions } from "../../_components/useWebApiOptions";
import { useBookingsQuery } from "../../../shared/query/hooks/useQueries";
import { useApproveBookingMutation, useDeclineBookingMutation } from "../../../shared/query/hooks/useMutations";
import { Button } from "../../_components/Button";
import { ScreenLayout } from "../../_components/ScreenLayout";

type Booking = {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  placeId: string;
  place?: {
    id: string;
    name: string;
    headlineImageUrl?: string | null;
    owner?: {
      id: string;
      displayName?: string | null;
      name?: string | null;
      handle?: string | null;
    };
  };
};

type Owner = NonNullable<NonNullable<Booking["place"]>["owner"]>;

type BookingsPayload = {
  myStays: Booking[];
  atMyPlaces: Booking[];
};

const formatDateLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatDateRange = (startDate: string, endDate: string) =>
  `${formatDateLabel(startDate)} → ${formatDateLabel(endDate)}`;

const formatOwnerLabel = (owner?: Owner) =>
  owner?.displayName?.trim() ||
  owner?.name?.trim() ||
  (owner?.handle ? `@${owner.handle}` : "") ||
  "Nieznany";

export default function BookingsPage() {
  const apiOptions = useWebApiOptions();
  const currentQuery = useBookingsQuery("current", apiOptions);
  const historyQuery = useBookingsQuery("history", apiOptions);

  const data = currentQuery.data?.data ?? { myStays: [], atMyPlaces: [] };
  const history = useMemo(() => {
    const payload = historyQuery.data?.data ?? { myStays: [], atMyPlaces: [] };
    return [...payload.myStays, ...payload.atMyPlaces].filter((booking) =>
      ["canceled", "declined", "completed"].includes(booking.status)
    );
  }, [historyQuery.data]);

  const error =
    currentQuery.isError || historyQuery.isError ? "Nie udało się pobrać rezerwacji." : null;

  const approveMutation = useApproveBookingMutation(apiOptions);
  const declineMutation = useDeclineBookingMutation(apiOptions);
  const approveIsPending =
    (approveMutation as { isPending?: boolean }).isPending ??
    (approveMutation as { isLoading?: boolean }).isLoading ??
    false;
  const declineIsPending =
    (declineMutation as { isPending?: boolean }).isPending ??
    (declineMutation as { isLoading?: boolean }).isLoading ??
    false;

  const allBookings = [
    ...data.myStays.map((booking) => ({ ...booking, source: "my" as const })),
    ...data.atMyPlaces.map((booking) => ({ ...booking, source: "host" as const })),
    ...history.map((booking) => ({ ...booking, source: "history" as const }))
  ];

  const columns = [
    {
      key: "requested",
      title: "Oczekujące",
      items: allBookings.filter((booking) => booking.status === "requested")
    },
    {
      key: "approved",
      title: "Zatwierdzone",
      items: allBookings.filter((booking) => booking.status === "approved")
    },
    {
      key: "history",
      title: "Historia",
      items: allBookings.filter((booking) =>
        ["canceled", "declined", "completed"].includes(booking.status)
      )
    }
  ];

  const sourceLabel = (source: "my" | "host" | "history") =>
    source === "host" ? "U mnie" : "Mój pobyt";

  return (
    <ScreenLayout title="Rezerwacje">
      {error ? <p className="muted">{error}</p> : null}
      <div className="kanban">
        {columns.map((column) => (
          <div key={column.key} className="kanban-column">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{column.title}</strong>
              <span className="pill">{column.items.length}</span>
            </div>
            {column.items.length === 0 ? (
              <p className="muted">Brak wpisów.</p>
            ) : (
              column.items.map((booking) => (
                <div key={booking.id} className="booking-card" data-status={booking.status}>
                  <div className="booking-card__media">
                    {booking.place?.headlineImageUrl ? (
                      <img
                        src={booking.place.headlineImageUrl}
                        alt={`Zdjęcie miejsca ${booking.place?.name ?? ""}`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="booking-card__media-placeholder">Brak zdjęcia</div>
                    )}
                  </div>
                  <div className="booking-card__content">
                    <div className="booking-card__header">
                      <div className="booking-card__header-main">
                        <strong className="booking-card__dates">
                          {formatDateRange(booking.startDate, booking.endDate)}
                        </strong>
                        <span className="booking-source">{sourceLabel(booking.source)}</span>
                      </div>
                      <span className="booking-status">{booking.status}</span>
                    </div>
                    <div className="booking-card__meta">
                      <div className="booking-card__meta-item">
                        <span className="booking-card__meta-label">Miejsce</span>
                        <span className="booking-card__meta-value">
                          {booking.place?.name ?? "Nieznane miejsce"}
                        </span>
                      </div>
                      <div className="booking-card__meta-item">
                        <span className="booking-card__meta-label">Gospodarz</span>
                        <span className="booking-card__meta-value">
                          {formatOwnerLabel(booking.place?.owner)}
                        </span>
                      </div>
                    </div>
                    {booking.source === "host" && booking.status === "requested" ? (
                      <div className="action-bar">
                        <Button
                          onClick={() => approveMutation.mutate(booking.id)}
                          loading={approveIsPending}
                        >
                          Akceptuj
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => declineMutation.mutate(booking.id)}
                          loading={declineIsPending}
                        >
                          Odrzuć
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </ScreenLayout>
  );
}
