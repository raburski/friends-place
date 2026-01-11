"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal } from "../../_components/Modal";
import { useWebApiOptions } from "../../_components/useWebApiOptions";
import { useMeQuery, usePlacesQuery } from "../../../shared/query/hooks/useQueries";
import { NewPlaceForm } from "./_components/NewPlaceForm";

type Place = {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  headlineImageUrl?: string | null;
  owner?: {
    id: string;
    displayName?: string | null;
    name?: string | null;
    handle?: string | null;
  };
};

export default function PlacesPage() {
  const router = useRouter();
  const apiOptions = useWebApiOptions();
  const meQuery = useMeQuery(apiOptions);
  const placesQuery = usePlacesQuery(apiOptions);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { places, userId } = useMemo(() => {
    return {
      places: placesQuery.data?.data ?? [],
      userId: meQuery.data?.data?.id ?? null
    };
  }, [meQuery.data, placesQuery.data]);

  const loading = meQuery.isLoading || placesQuery.isLoading;
  const error = meQuery.isError || placesQuery.isError ? "Nie udało się pobrać miejsc." : null;

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
                <div className="place-card__media">
                  {place.headlineImageUrl ? (
                    <img
                      className="place-card__thumb"
                      src={place.headlineImageUrl}
                      alt={`Zdjęcie miejsca ${place.name}`}
                    />
                  ) : (
                    <div className="place-card__thumb place-card__thumb--empty">Brak zdjęcia</div>
                  )}
                  <div className="place-card__body">
                    <div className="place-card__title-row">
                      <strong>{place.name}</strong>
                      <span className="pill">{ownerLabel(place)}</span>
                    </div>
                    <div className="muted">{place.address}</div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="card" style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <h2 className="section-title">Moje</h2>
            <button
              type="button"
              className="icon-button"
              aria-label="Dodaj miejsce"
              style={{ marginTop: -8 }}
              onClick={() => setCreateModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          {loading ? (
            <p className="muted">Ładowanie...</p>
          ) : myPlaces.length === 0 ? (
            <p className="muted">Nie masz jeszcze żadnego miejsca.</p>
          ) : (
            myPlaces.map((place) => (
              <Link key={place.id} className="place-card" href={`/places/${place.id}`}>
                <div className="place-card__media">
                  {place.headlineImageUrl ? (
                    <img
                      className="place-card__thumb"
                      src={place.headlineImageUrl}
                      alt={`Zdjęcie miejsca ${place.name}`}
                    />
                  ) : (
                    <div className="place-card__thumb place-card__thumb--empty">Brak zdjęcia</div>
                  )}
                  <div className="place-card__body">
                    <div className="place-card__title-row">
                      <strong>{place.name}</strong>
                      <span className="pill">Ty</span>
                    </div>
                    <div className="muted">{place.address}</div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} showCloseButton>
        <NewPlaceForm
          onCreated={() => {
            setCreateModalOpen(false);
            router.push("/places");
          }}
          onCancel={() => setCreateModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
