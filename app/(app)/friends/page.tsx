"use client";

import { useMemo, useState } from "react";
import { Copy, Trash } from "@phosphor-icons/react";
import { useWebApiOptions } from "../../_components/useWebApiOptions";
import { useFriendsQuery, useInvitesQuery } from "../../../shared/query/hooks/useQueries";
import { useRevokeInviteMutation, useUnfriendMutation } from "../../../shared/query/hooks/useMutations";

type Friend = { friendshipId: string; friendId: string; handle?: string; displayName?: string };

type Invite = { id: string; code: string; type: string; revokedAt?: string | null };

export default function FriendsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const apiOptions = useWebApiOptions();
  const friendsQuery = useFriendsQuery(apiOptions);
  const invitesQuery = useInvitesQuery(apiOptions);

  const { friends, invites } = useMemo(() => {
    return {
      friends: friendsQuery.data?.data ?? [],
      invites: invitesQuery.data?.data ?? []
    };
  }, [friendsQuery.data, invitesQuery.data]);

  const loading = friendsQuery.isLoading || invitesQuery.isLoading;
  const error = friendsQuery.isError || invitesQuery.isError
    ? "Nie udało się pobrać znajomych."
    : null;

  const revokeInviteMutation = useRevokeInviteMutation(apiOptions);
  const unfriendMutation = useUnfriendMutation(apiOptions);

  const inviteUrl = (code: string) => {
    if (typeof window === "undefined") {
      return code;
    }
    return `${window.location.origin}/auth/invite/${code}`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <h1 className="page-title">Koledzy</h1>
      </div>
      {error ? <p className="muted">{error}</p> : null}
      {loading ? <p className="muted">Ładowanie...</p> : null}

      <div className="panel-grid">
        <div className="card" style={{ display: "grid", gap: 12 }}>
          <div>
            <h2 className="section-title">Twoja sieć</h2>
          </div>
          {friends.length === 0 ? (
            <p className="muted">Musisz dodać jakiś kolegów, żeby to miejsce miało sens...</p>
          ) : (
            friends.map((friend) => (
              <div key={friend.friendshipId} className="friend-row">
                <div className="friend-meta">
                  <strong>{friend.displayName ?? "Znajomy"}</strong>
                  <div className="muted">@{friend.handle ?? "bez_handle"}</div>
                </div>
                <button
                  className="friend-remove"
                  title="Usuń znajomego"
                  onClick={() => setRemoveId(friend.friendId)}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <div className="card" style={{ display: "grid", gap: 16 }}>
          <div>
            <h2 className="section-title">Dodaj znajomego</h2>
            <p className="muted">Udostępnij swój link zaproszenia.</p>
          </div>
          {invites.filter((invite) => !invite.revokedAt).length === 0 ? (
            <p className="muted">Brak aktywnego linku.</p>
          ) : (
            invites
              .filter((invite) => !invite.revokedAt)
              .map((invite) => (
                <div key={invite.id} className="invite-row">
                  <div className="invite-meta">
                    <strong>{invite.type === "single" ? "Jednorazowy" : "Wielorazowy"}</strong>
                    <input className="invite-input" readOnly value={inviteUrl(invite.code)} />
                  </div>
                  <div className="invite-actions invite-actions--stacked">
                    <button
                      type="button"
                      className="invite-copy"
                      title="Kopiuj link"
                      onClick={async () => {
                        const url = inviteUrl(invite.code);
                        try {
                          await navigator.clipboard.writeText(url);
                          setCopiedId(invite.id);
                          window.setTimeout(() => setCopiedId(null), 1500);
                        } catch {
                          setCopiedId(null);
                        }
                      }}
                    >
                      <Copy size={18} weight="bold" />
                      <span>{copiedId === invite.id ? "Skopiowano" : "Kopiuj link"}</span>
                    </button>
                    <button
                      className="invite-copy invite-icon-only"
                      title="Wycofaj link"
                      onClick={() => setRevokeId(invite.id)}
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              ))
          )}
          <div className="invite-hint muted">
            Link jest tworzony automatycznie po rejestracji.
          </div>
        </div>
      </div>
      {revokeId ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2 className="section-title">Wycofać link?</h2>
            <p className="muted">Link przestanie działać natychmiast.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="secondary-button" onClick={() => setRevokeId(null)}>
                Anuluj
              </button>
              <button
                onClick={async () => {
                  if (!revokeId) {
                    return;
                  }
                  await revokeInviteMutation.mutateAsync(revokeId);
                  setRevokeId(null);
                }}
              >
                Wycofaj
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {removeId ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2 className="section-title">Usunąć znajomego?</h2>
            <p className="muted">Stracicie dostęp do swoich miejsc.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="secondary-button" onClick={() => setRemoveId(null)}>
                Anuluj
              </button>
              <button
                onClick={async () => {
                  if (!removeId) {
                    return;
                  }
                  await unfriendMutation.mutateAsync(removeId);
                  setRemoveId(null);
                }}
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
