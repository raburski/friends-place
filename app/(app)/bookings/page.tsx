"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../_components/api";

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
  const [data, setData] = useState<BookingsPayload>({ myStays: [], atMyPlaces: [] });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ ok: boolean; data: BookingsPayload }>("/api/bookings")
      .then((payload) => setData(payload.data))
      .catch(() => setError("Nie udało się pobrać rezerwacji."));
  }, []);

  return (
    <div>
      <h1 className="section-title">Rezerwacje</h1>
      {error ? <p className="muted">{error}</p> : null}
      <div className="card">
        <h2 className="section-title">Moje pobyty</h2>
        {data.myStays.length === 0 ? (
          <p className="muted">Brak pobytów.</p>
        ) : (
          data.myStays.map((booking) => (
            <div key={booking.id} className="muted">
              {booking.startDate} → {booking.endDate} · {booking.status}
            </div>
          ))
        )}
      </div>
      <div className="card">
        <h2 className="section-title">U mnie</h2>
        {data.atMyPlaces.length === 0 ? (
          <p className="muted">Brak rezerwacji.</p>
        ) : (
          data.atMyPlaces.map((booking) => (
            <div key={booking.id} className="muted">
              {booking.startDate} → {booking.endDate} · {booking.status}
              {booking.status === "requested" ? (
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <button
                    onClick={async () => {
                      await apiFetch(`/api/bookings/${booking.id}/approve`, { method: "POST" });
                      setData((current) => ({
                        ...current,
                        atMyPlaces: current.atMyPlaces.map((item) =>
                          item.id === booking.id ? { ...item, status: "approved" } : item
                        )
                      }));
                    }}
                  >
                    Akceptuj
                  </button>
                  <button
                    onClick={async () => {
                      await apiFetch(`/api/bookings/${booking.id}/decline`, { method: "POST" });
                      setData((current) => ({
                        ...current,
                        atMyPlaces: current.atMyPlaces.map((item) =>
                          item.id === booking.id ? { ...item, status: "declined" } : item
                        )
                      }));
                    }}
                  >
                    Odrzuć
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
