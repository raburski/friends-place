"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../_components/api";

type Place = {
  id: string;
  name: string;
  address: string;
};

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ ok: boolean; data: Place[] }>("/api/places")
      .then((payload) => setPlaces(payload.data ?? []))
      .catch(() => setError("Nie udało się pobrać miejsc."));
  }, []);

  return (
    <div>
      <h1 className="section-title">Miejsca</h1>
      {error ? <p className="muted">{error}</p> : null}
      {places.length === 0 ? (
        <p className="muted">Brak miejsc.</p>
      ) : (
        <div className="card">
          {places.map((place) => (
            <div key={place.id} style={{ padding: "8px 0" }}>
              <Link href={`/places/${place.id}`}>{place.name}</Link>
              <div className="muted">{place.address}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
