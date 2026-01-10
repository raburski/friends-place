"use client";

import { useMemo } from "react";
import { useWebApiOptions } from "../_components/useWebApiOptions";
import { useBookingsQuery } from "../../shared/query/hooks/useQueries";
import { useApproveBookingMutation, useDeclineBookingMutation } from "../../shared/query/hooks/useMutations";

type Booking = {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  placeId: string;
};

type BookingsPayload = {
  myStays: Booking[];
  atMyPlaces: Booking[];
};

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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <h1 className="page-title">Rezerwacje</h1>
        <button className="secondary-button" type="button">
          Nowa prośba
        </button>
      </div>
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
                <div key={booking.id} className="kanban-card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong>{booking.startDate} → {booking.endDate}</strong>
                    <span className="pill">
                      {booking.source === "host" ? "U mnie" : "Mój pobyt"}
                    </span>
                  </div>
                  <div className="muted">Miejsce: {booking.placeId}</div>
                  <div className="muted">Status: {booking.status}</div>
                  {booking.source === "host" && booking.status === "requested" ? (
                    <div className="action-bar">
                      <button
                        onClick={() => approveMutation.mutate(booking.id)}
                        disabled={approveMutation.isLoading}
                      >
                        Akceptuj
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => declineMutation.mutate(booking.id)}
                        disabled={declineMutation.isLoading}
                      >
                        Odrzuć
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
