"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../_components/api";

type Place = {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  owner?: {
    id: string;
    displayName?: string | null;
    name?: string | null;
    handle?: string | null;
  };
};

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch<{ ok: boolean; data: { id: string } }>("/api/me"),
      apiFetch<{ ok: boolean; data: Place[] }>("/api/places")
    ])
      .then(([mePayload, placesPayload]) => {
        setUserId(mePayload.data?.id ?? null);
        setPlaces(placesPayload.data ?? []);
      })
      .catch(() => setError("Nie udało się pobrać miejsc."))
      .finally(() => setLoading(false));
  }, []);

  const myPlaces = userId ? places.filter((place) => place.ownerId === userId) : [];
  const friendPlaces = userId ? places.filter((place) => place.ownerId !== userId) : [];
  const ownerLabel = (place: Place) =>
    place.owner?.displayName?.trim() ||
    place.owner?.name?.trim() ||
    (place.owner?.handle ? `@${place.owner.handle}` : "") ||
    "Kolega";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <h1 className="page-title">Miejsca</h1>
        <Link className="secondary-button" href="/places/new">
          Dodaj miejsce
        </Link>
      </div>
      {error ? <p className="muted">{error}</p> : null}
      <div className="panel-grid">
        <div className="card" style={{ display: "grid", gap: 12 }}>
          <div>
            <h2 className="section-title">Kolegów</h2>
          </div>
          {loading ? (
            <p className="muted">Ładowanie...</p>
          ) : friendPlaces.length === 0 ? (
            <p className="muted">Brak miejsc od kolegów.</p>
          ) : (
            friendPlaces.map((place) => (
              <Link key={place.id} className="place-card" href={`/places/${place.id}`}>
                <div className="place-card__title-row">
                  <strong>{place.name}</strong>
                  <span className="pill">{ownerLabel(place)}</span>
                </div>
                <div className="muted">{place.address}</div>
              </Link>
            ))
          )}
        </div>

        <div className="card" style={{ display: "grid", gap: 12 }}>
          <div>
            <h2 className="section-title">Moje</h2>
          </div>
          {loading ? (
            <p className="muted">Ładowanie...</p>
          ) : myPlaces.length === 0 ? (
            <>
              <p className="muted">Nie masz jeszcze żadnego miejsca.</p>
              <Link className="secondary-button" href="/places/new">
                Dodaj miejsce
              </Link>
            </>
          ) : (
            myPlaces.map((place) => (
              <Link key={place.id} className="place-card" href={`/places/${place.id}`}>
                <div className="place-card__title-row">
                  <strong>{place.name}</strong>
                  <span className="pill">Ty</span>
                </div>
                <div className="muted">{place.address}</div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
