"use client";

import { useEffect, useState } from "react";
import { ApiError } from "../_components/api";
import { useWebApiOptions } from "../../_components/useWebApiOptions";
import { Modal } from "../../_components/Modal";
import { useMeQuery } from "../../../shared/query/hooks/useQueries";
import { useUpdateProfileMutation } from "../../../shared/query/hooks/useMutations";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ displayName?: string; handle?: string } | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const apiOptions = useWebApiOptions();
  const meQuery = useMeQuery(apiOptions);
  const updateProfileMutation = useUpdateProfileMutation(apiOptions);

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
    setEditDisplayName(me.displayName ?? "");
    const incomplete = !(me.displayName && me.handle);
    setNeedsProfile(incomplete);
  }, [meQuery.data, meQuery.isError, meQuery.error]);

  const trimmedEditName = editDisplayName.trim();
  const canSaveEditName =
    !editSaving &&
    Boolean(profile?.handle) &&
    trimmedEditName.length > 0 &&
    trimmedEditName !== (profile?.displayName ?? "");

  return (
    <div>
      <h1 className="page-title">Profil</h1>
      {error ? <p className="muted">{error}</p> : null}
      <div className="card">
        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <strong>{profile?.displayName ?? "Brak nazwy"}</strong>
            <div className="muted">@{profile?.handle ?? "bez_handle"}</div>
          </div>
          <div className="action-bar">
            <button
              type="button"
              className="secondary-button"
              disabled={!profile?.handle}
              onClick={() => {
                setEditDisplayName(profile?.displayName ?? "");
                setEditError(null);
                setEditNameOpen(true);
              }}
            >
              Zmień nazwę
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={editNameOpen}
        onClose={() => {
          setEditNameOpen(false);
          setEditDisplayName(profile?.displayName ?? "");
          setEditError(null);
        }}
        title="Zmień nazwę"
        size="sm"
      >
        <p className="muted">Ta nazwa będzie widoczna dla znajomych.</p>
        <input
          value={editDisplayName}
          onChange={(event) => setEditDisplayName(event.target.value)}
          placeholder="Imię / nazwa"
          disabled={editSaving}
          autoFocus
        />
        {editError ? <p className="muted">{editError}</p> : null}
        <div className="action-bar">
          <button
            type="button"
            disabled={!canSaveEditName}
            onClick={async () => {
              if (!trimmedEditName) {
                setEditError("Podaj nazwę.");
                return;
              }
              if (!profile?.handle) {
                setEditError("Brakuje handle.");
                return;
              }
              setEditSaving(true);
              setEditError(null);
              try {
                await updateProfileMutation.mutateAsync({
                  displayName: trimmedEditName,
                  handle: profile.handle,
                  locale: "pl"
                });
                setProfile((current) => (current ? { ...current, displayName: trimmedEditName } : current));
                setDisplayName(trimmedEditName);
                setEditNameOpen(false);
                await meQuery.refetch();
              } catch (err) {
                if (err instanceof ApiError && err.code === "invalid_request") {
                  setEditError("Podaj poprawną nazwę.");
                } else {
                  setEditError("Nie udało się zapisać nazwy.");
                }
              } finally {
                setEditSaving(false);
              }
            }}
          >
            {editSaving ? "Zapisywanie..." : "Zapisz nazwę"}
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={editSaving}
            onClick={() => {
              setEditNameOpen(false);
              setEditDisplayName(profile?.displayName ?? "");
              setEditError(null);
            }}
          >
            Anuluj
          </button>
        </div>
      </Modal>

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
                    await updateProfileMutation.mutateAsync({ displayName, handle, locale: "pl" });
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
