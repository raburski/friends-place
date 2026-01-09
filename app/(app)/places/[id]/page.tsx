"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../_components/api";

const GUIDE_LABELS = [
  { key: "access", label: "Jak się dostać" },
  { key: "sleep", label: "Jak się wyspać" },
  { key: "wash", label: "Jak się umyć" },
  { key: "eat_drink", label: "Jak się najeść/napić" },
  { key: "operate", label: "Jak obsługiwać" }
];

type Place = {
  id: string;
  name: string;
  address: string;
  rules?: string | null;
};

type Availability = { id: string; startDate: string; endDate: string };

type GuideEntry = { categoryKey: string; text: string };

export default function PlaceDetailPage({ params }: { params: { id: string } }) {
  const placeId = params.id;
  const [place, setPlace] = useState<Place | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [guides, setGuides] = useState<Record<string, string>>({});
  const [rules, setRules] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<{ ok: boolean; data: Place }>(`/api/places/${placeId}`),
      apiFetch<{ ok: boolean; data: { ranges: Availability[]; isOwner: boolean } }>(
        `/api/availability/place/${placeId}`
      ),
      apiFetch<{ ok: boolean; data: GuideEntry[] }>(`/api/guides/${placeId}`)
    ])
      .then(([placePayload, availabilityPayload, guidesPayload]) => {
        setPlace(placePayload.data);
        setRules(placePayload.data?.rules ?? "");
        setAvailability(availabilityPayload.data?.ranges ?? []);
        setIsOwner(Boolean(availabilityPayload.data?.isOwner));
        const guideMap: Record<string, string> = {};
        guidesPayload.data?.forEach((entry) => {
          guideMap[entry.categoryKey] = entry.text;
        });
        setGuides(guideMap);
      })
      .catch(() => setMessage("Nie udało się pobrać danych miejsca."));
  }, [placeId]);

  return (
    <div>
      <h1 className="section-title">{place?.name ?? "Miejsce"}</h1>
      {place?.address ? <p className="muted">{place.address}</p> : null}
      {message ? <p className="muted">{message}</p> : null}

      <div className="card">
        <h2 className="section-title">Prośba o pobyt</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
          <button
            onClick={async () => {
              try {
                await apiFetch("/api/bookings", {
                  method: "POST",
                  body: JSON.stringify({ placeId, startDate, endDate })
                });
                setMessage("Prośba wysłana.");
              } catch {
                setMessage("Nie udało się wysłać prośby.");
              }
            }}
          >
            Wyślij
          </button>
        </div>
      </div>

      {isOwner ? (
        <div className="card">
          <h2 className="section-title">Dodaj dostępność</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
            <button
              onClick={async () => {
                try {
                  await apiFetch("/api/availability", {
                    method: "POST",
                    body: JSON.stringify({
                      placeId,
                      ranges: [{ startDate, endDate }]
                    })
                  });
                  setMessage("Dostępność dodana.");
                  const refreshed = await apiFetch<{
                    ok: boolean;
                    data: { ranges: Availability[]; isOwner: boolean };
                  }>(`/api/availability/place/${placeId}`);
                  setAvailability(refreshed.data?.ranges ?? []);
                } catch {
                  setMessage("Nie udało się dodać dostępności.");
                }
              }}
            >
              Zapisz
            </button>
          </div>
        </div>
      ) : null}

      <div className="card">
        <h2 className="section-title">Dostępność</h2>
        {availability.length === 0 ? (
          <p className="muted">Brak terminów.</p>
        ) : (
          availability.map((range) => (
            <div key={range.id} className="muted">
              {range.startDate} → {range.endDate}
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Zasady domu</h2>
        {isOwner ? (
          <div style={{ display: "grid", gap: 12 }}>
            <textarea value={rules} onChange={(event) => setRules(event.target.value)} rows={4} />
            <button
              onClick={async () => {
                try {
                  await apiFetch(`/api/places/${placeId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ rules })
                  });
                  setMessage("Zasady zapisane.");
                } catch {
                  setMessage("Nie udało się zapisać zasad.");
                }
              }}
            >
              Zapisz zasady
            </button>
          </div>
        ) : (
          <p className="muted">{rules || "Brak zasad."}</p>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Przewodnik</h2>
        {GUIDE_LABELS.map((item) => (
          <div key={item.key} style={{ marginBottom: 12 }}>
            <strong>{item.label}</strong>
            {isOwner ? (
              <textarea
                rows={3}
                value={guides[item.key] ?? ""}
                onChange={(event) =>
                  setGuides((current) => ({
                    ...current,
                    [item.key]: event.target.value
                  }))
                }
              />
            ) : (
              <p className="muted">{guides[item.key] ?? "Brak informacji."}</p>
            )}
          </div>
        ))}
        {isOwner ? (
          <button
            onClick={async () => {
              try {
                const entries = GUIDE_LABELS.map((item) => ({
                  categoryKey: item.key,
                  text: guides[item.key] ?? ""
                }));
                await apiFetch(`/api/guides/${placeId}`, {
                  method: "PUT",
                  body: JSON.stringify({ entries })
                });
                setMessage("Przewodnik zapisany.");
              } catch {
                setMessage("Nie udało się zapisać przewodnika.");
              }
            }}
          >
            Zapisz przewodnik
          </button>
        ) : null}
      </div>
    </div>
  );
}
