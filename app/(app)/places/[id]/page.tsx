"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "../../_components/api";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/keys";

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

export default function PlaceDetailPage() {
  const params = useParams<{ id?: string }>();
  const placeId = typeof params?.id === "string" ? params.id : "";
  const [guides, setGuides] = useState<Record<string, string>>({});
  const [rules, setRules] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const queryClient = useQueryClient();

  const placeQuery = useQuery({
    queryKey: queryKeys.place(placeId),
    queryFn: () => apiFetch<{ ok: boolean; data: Place }>(`/api/places/${placeId}`),
    enabled: Boolean(placeId)
  });
  const availabilityQuery = useQuery({
    queryKey: queryKeys.availability(placeId),
    queryFn: () =>
      apiFetch<{ ok: boolean; data: { ranges: Availability[]; isOwner: boolean } }>(
        `/api/availability/place/${placeId}`
      ),
    enabled: Boolean(placeId)
  });
  const guidesQuery = useQuery({
    queryKey: queryKeys.guides(placeId),
    queryFn: () => apiFetch<{ ok: boolean; data: GuideEntry[] }>(`/api/guides/${placeId}`),
    enabled: Boolean(placeId)
  });

  const place = placeQuery.data?.data ?? null;
  const availability = availabilityQuery.data?.data?.ranges ?? [];
  const isOwner = Boolean(availabilityQuery.data?.data?.isOwner);

  useEffect(() => {
    if (placeQuery.data?.data) {
      setRules(placeQuery.data.data.rules ?? "");
    }
  }, [placeQuery.data]);

  useEffect(() => {
    if (!guidesQuery.data?.data) {
      return;
    }
    const guideMap: Record<string, string> = {};
    guidesQuery.data.data.forEach((entry) => {
      guideMap[entry.categoryKey] = entry.text;
    });
    setGuides(guideMap);
  }, [guidesQuery.data]);

  const bookingMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({ placeId, startDate, endDate })
      }),
    onSuccess: () => {
      toast.success("Prośba wysłana.");
    },
    onError: () => {
      toast.error("Nie udało się wysłać prośby.");
    }
  });

  const addAvailabilityMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/availability", {
        method: "POST",
        body: JSON.stringify({
          placeId,
          ranges: [{ startDate, endDate }]
        })
      }),
    onSuccess: async () => {
      toast.success("Dostępność dodana.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.availability(placeId) });
    },
    onError: () => {
      toast.error("Nie udało się dodać dostępności.");
    }
  });

  const rulesMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/places/${placeId}`, {
        method: "PATCH",
        body: JSON.stringify({ rules })
      }),
    onSuccess: async () => {
      toast.success("Zasady zapisane.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.place(placeId) });
    },
    onError: () => {
      toast.error("Nie udało się zapisać zasad.");
    }
  });

  const guidesMutation = useMutation({
    mutationFn: () => {
      const entries = GUIDE_LABELS.map((item) => ({
        categoryKey: item.key,
        text: guides[item.key] ?? ""
      }));
      return apiFetch(`/api/guides/${placeId}`, {
        method: "PUT",
        body: JSON.stringify({ entries })
      });
    },
    onSuccess: () => {
      toast.success("Przewodnik zapisany.");
    },
    onError: () => {
      toast.error("Nie udało się zapisać przewodnika.");
    }
  });

  useEffect(() => {
    if (placeQuery.isError || availabilityQuery.isError || guidesQuery.isError) {
      toast.error("Nie udało się pobrać danych miejsca.");
    }
  }, [placeQuery.isError, availabilityQuery.isError, guidesQuery.isError]);

  return (
    <div>
      <h1 className="page-title">{place?.name ?? "Miejsce"}</h1>
      {place?.address ? <p className="muted">{place.address}</p> : null}
      {isOwner ? null : (
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
            <button onClick={() => bookingMutation.mutate()}>
              Wyślij
            </button>
          </div>
        </div>
      )}

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
            <button onClick={() => addAvailabilityMutation.mutate()}>
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
            <button onClick={() => rulesMutation.mutate()}>
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
          <button onClick={() => guidesMutation.mutate()}>
            Zapisz przewodnik
          </button>
        ) : null}
      </div>
    </div>
  );
}
