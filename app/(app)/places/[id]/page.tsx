"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useWebApiOptions } from "../../_components/useWebApiOptions";
import {
  useAvailabilityQuery,
  useGuidesQuery,
  usePlaceQuery
} from "../../../shared/query/hooks/useQueries";
import {
  useAddAvailabilityMutation,
  useRequestBookingMutation,
  useUpdateGuidesMutation,
  useUpdateRulesMutation
} from "../../../shared/query/hooks/useMutations";

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

export default function PlaceDetailPage() {
  const params = useParams<{ id?: string }>();
  const placeId = typeof params?.id === "string" ? params.id : "";
  const [guides, setGuides] = useState<Record<string, string>>({});
  const [rules, setRules] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const apiOptions = useWebApiOptions();
  const placeQuery = usePlaceQuery(placeId, apiOptions);
  const availabilityQuery = useAvailabilityQuery(placeId, apiOptions);
  const guidesQuery = useGuidesQuery(placeId, apiOptions);

  const place = placeQuery.data?.data ?? null;
  const availability = availabilityQuery.data?.data?.ranges ?? [];
  const isOwner = Boolean(availabilityQuery.data?.data?.isOwner);

  useEffect(() => {
    if (placeQuery.data?.data) {
      setRules(placeQuery.data.data.rules ?? "");
    }
  }, [placeQuery.data]);

  useEffect(() => {
    setGuides(guidesQuery.guidesMap);
  }, [guidesQuery.guidesMap]);

  const bookingMutation = useRequestBookingMutation(apiOptions);
  const addAvailabilityMutation = useAddAvailabilityMutation(apiOptions);
  const rulesMutation = useUpdateRulesMutation(apiOptions);
  const guidesMutation = useUpdateGuidesMutation(apiOptions);

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
            <button
              onClick={() =>
                bookingMutation.mutate(
                  { placeId, startDate, endDate },
                  {
                    onSuccess: () => toast.success("Prośba wysłana."),
                    onError: () => toast.error("Nie udało się wysłać prośby.")
                  }
                )
              }
            >
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
            <button
              onClick={() =>
                addAvailabilityMutation.mutate(
                  { placeId, startDate, endDate },
                  {
                    onSuccess: () => toast.success("Dostępność dodana."),
                    onError: () => toast.error("Nie udało się dodać dostępności.")
                  }
                )
              }
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
              onClick={() =>
                rulesMutation.mutate(
                  { placeId, rules },
                  {
                    onSuccess: () => toast.success("Zasady zapisane."),
                    onError: () => toast.error("Nie udało się zapisać zasad.")
                  }
                )
              }
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
            onClick={() =>
              guidesMutation.mutate(
                {
                  placeId,
                  entries: GUIDE_LABELS.map((item) => ({
                    categoryKey: item.key,
                    text: guides[item.key] ?? ""
                  }))
                },
                {
                  onSuccess: () => toast.success("Przewodnik zapisany."),
                  onError: () => toast.error("Nie udało się zapisać przewodnika.")
                }
              )
            }
          >
            Zapisz przewodnik
          </button>
        ) : null}
      </div>
    </div>
  );
}
