"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../_components/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../shared/query/keys";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ displayName?: string; handle?: string } | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  const meQuery = useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => apiFetch<{ ok: boolean; data: { displayName?: string; handle?: string } }>("/api/me")
  });

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName, handle, locale: "pl" })
      })
  });

  useEffect(() => {
    if (meQuery.isError) {
      const err = meQuery.error;
      if (err instanceof ApiError && err.status === 401) {
        setError("Musisz się zalogować.");
        return;
      }
      if (err instanceof ApiError && err.code === "profile_incomplete") {
        setNeedsProfile(true);
        return;
      }
      if (err instanceof ApiError) {
        setError(`Nie udało się pobrać profilu. (${err.code ?? err.status})`);
        return;
      }
      setError("Nie udało się pobrać profilu.");
      return;
    }
    if (!meQuery.data?.data) {
      return;
    }
    const me = meQuery.data.data;
    setProfile(me ?? null);
    setDisplayName(me.displayName ?? "");
    setHandle(me.handle ?? "");
    const incomplete = !(me.displayName && me.handle);
    setNeedsProfile(incomplete);
  }, [meQuery.data, meQuery.isError, meQuery.error]);

  return (
    <div>
      <h1 className="page-title">Profil</h1>
      {error ? <p className="muted">{error}</p> : null}
      <div className="card">
        <strong>{profile?.displayName ?? "Brak nazwy"}</strong>
        <div className="muted">@{profile?.handle ?? "bez_handle"}</div>
      </div>

      {needsProfile ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2 className="section-title">Uzupełnij profil</h2>
            <p className="muted">Uzupełnij profil, aby korzystać z aplikacji.</p>
            <div style={{ display: "grid", gap: 8, maxWidth: 320 }}>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Imię / nazwa"
              />
              <input
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
                placeholder="Handle"
              />
              <button
                onClick={async () => {
                  try {
                    await updateProfileMutation.mutateAsync();
                    setNeedsProfile(false);
                    await meQuery.refetch();
                  } catch {
                    setError("Nie udało się zapisać profilu.");
                  }
                }}
              >
                Zapisz profil
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
