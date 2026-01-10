"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../_components/api";
import { useMutation } from "@tanstack/react-query";

type PlacePayload = {
  id: string;
  name: string;
};

export default function NewPlacePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; data: PlacePayload }>("/api/places", {
        method: "POST",
        body: JSON.stringify({ name, address })
      })
  });

  const canSubmit = name.trim().length > 0 && address.trim().length > 0 && !createMutation.isLoading;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <h1 className="page-title">Dodaj miejsce</h1>
      </div>
      {error ? <p className="muted">{error}</p> : null}
      <div className="card" style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted">Nazwa miejsca</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="np. Domek w górach"
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted">Adres</span>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Ulica, miasto"
          />
        </label>
        <div className="action-bar">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={async () => {
              if (!canSubmit) {
                return;
              }
              setError(null);
              try {
                const payload = await createMutation.mutateAsync();
                router.push(`/places/${payload.data.id}`);
              } catch {
                setError("Nie udało się dodać miejsca.");
              }
            }}
          >
            {createMutation.isLoading ? "Zapisywanie..." : "Dodaj miejsce"}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => router.push("/places")}
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
