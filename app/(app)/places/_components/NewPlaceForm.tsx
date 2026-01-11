"use client";

import { useState } from "react";
import { useWebApiOptions } from "../../../_components/useWebApiOptions";
import { useCreatePlaceMutation } from "../../../../shared/query/hooks/useMutations";
import { Button } from "../../../_components/Button";
import { SectionCard } from "../../../_components/SectionCard";
import { ScreenLayout } from "../../../_components/ScreenLayout";

type PlacePayload = {
  id: string;
  name: string;
};

type NewPlaceFormProps = {
  onCreated: (place: PlacePayload) => void;
  onCancel: () => void;
};

export function NewPlaceForm({ onCreated, onCancel }: NewPlaceFormProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const apiOptions = useWebApiOptions();
  const createMutation = useCreatePlaceMutation(apiOptions);
  const isSubmitting =
    (createMutation as { isPending?: boolean }).isPending ??
    (createMutation as { isLoading?: boolean }).isLoading ??
    false;

  const canSubmit = name.trim().length > 0 && address.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    setError(null);
    try {
      const payload = await createMutation.mutateAsync({ name, address });
      onCreated(payload.data);
    } catch {
      setError("Nie udało się dodać miejsca.");
    }
  };

  return (
    <ScreenLayout title="Dodaj miejsce">
      {error ? <p className="muted">{error}</p> : null}
      <SectionCard style={{ display: "grid", gap: 12, maxWidth: 520 }}>
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
          <Button
            disabled={!canSubmit}
            onClick={handleSubmit}
            loading={isSubmitting}
            loadingLabel="Zapisywanie..."
          >
            Dodaj miejsce
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Anuluj
          </Button>
        </div>
      </SectionCard>
    </ScreenLayout>
  );
}
