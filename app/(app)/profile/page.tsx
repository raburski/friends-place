"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiPost } from "../_components/api";

type Friend = { friendshipId: string; friendId: string; handle?: string; displayName?: string };

type Invite = { id: string; code: string; type: string; revokedAt?: string | null };

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ displayName?: string; handle?: string } | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Array<{ friendshipId: string; handle?: string; displayName?: string }>>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [handleQuery, setHandleQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    Promise.all([
      apiFetch<{ ok: boolean; data: { displayName?: string; handle?: string } }>("/api/me"),
      apiFetch<{ ok: boolean; data: Friend[] }>("/api/friends"),
      apiFetch<{ ok: boolean; data: Array<{ friendshipId: string; handle?: string; displayName?: string }> }>(
        "/api/friends/requests"
      ),
      apiFetch<{ ok: boolean; data: Invite[] }>("/api/invites")
    ])
      .then(([me, friendsPayload, requestsPayload, invitesPayload]) => {
        setProfile(me.data ?? null);
        setFriends(friendsPayload.data ?? []);
        setRequests(requestsPayload.data ?? []);
        setInvites(invitesPayload.data ?? []);
      })
      .catch(() => setError("Nie udało się pobrać profilu."));
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <h1 className="section-title">Profil</h1>
      {error ? <p className="muted">{error}</p> : null}
      <div className="card">
        <strong>{profile?.displayName ?? "Brak nazwy"}</strong>
        <div className="muted">@{profile?.handle ?? "bez_handle"}</div>
      </div>

      <div className="card">
        <h2 className="section-title">Zaproszenia</h2>
        {requests.length === 0 ? (
          <p className="muted">Brak nowych zaproszeń.</p>
        ) : (
          requests.map((request) => (
            <div key={request.friendshipId} style={{ marginBottom: 8 }}>
              <strong>{request.displayName ?? "Nowy znajomy"}</strong>
              <div className="muted">@{request.handle ?? "bez_handle"}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button
                  onClick={async () => {
                    await apiPost("/api/friends/respond", {
                      friendshipId: request.friendshipId,
                      accept: true
                    });
                    refresh();
                  }}
                >
                  Akceptuj
                </button>
                <button
                  onClick={async () => {
                    await apiPost("/api/friends/respond", {
                      friendshipId: request.friendshipId,
                      accept: false
                    });
                    refresh();
                  }}
                >
                  Odrzuć
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Znajomi</h2>
        {friends.length === 0 ? (
          <p className="muted">Brak znajomych.</p>
        ) : (
          friends.map((friend) => (
            <div key={friend.friendshipId} style={{ marginBottom: 8 }}>
              <strong>{friend.displayName ?? "Znajomy"}</strong>
              <div className="muted">@{friend.handle ?? "bez_handle"}</div>
              <button
                onClick={async () => {
                  await apiPost("/api/friends/unfriend", { friendId: friend.friendId });
                  refresh();
                }}
              >
                Usuń
              </button>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Dodaj znajomego</h2>
        <input
          value={handleQuery}
          onChange={(event) => setHandleQuery(event.target.value)}
          placeholder="Handle"
        />
        <button
          onClick={async () => {
            await apiPost("/api/friends/request", { handle: handleQuery });
            setHandleQuery("");
          }}
        >
          Wyślij zaproszenie
        </button>
      </div>

      <div className="card">
        <h2 className="section-title">Twoje linki zaproszeń</h2>
        {invites.length === 0 ? (
          <p className="muted">Brak linków.</p>
        ) : (
          invites.map((invite) => (
            <div key={invite.id} style={{ marginBottom: 8 }}>
              <strong>{invite.type === "single" ? "Jednorazowy" : "Wielorazowy"}</strong>
              <div className="muted">Kod: {invite.code}</div>
              <div className="muted">Status: {invite.revokedAt ? "Wycofany" : "Aktywny"}</div>
              {!invite.revokedAt ? (
                <button
                  onClick={async () => {
                    await apiPost(`/api/invites/${invite.id}/revoke`);
                    refresh();
                  }}
                >
                  Wycofaj
                </button>
              ) : null}
            </div>
          ))
        )}
        <button
          onClick={async () => {
            const payload = await apiPost<{ ok: boolean; data: Invite }>("/api/invites", { type: "multi" });
            setInvites((current) => [payload.data, ...current]);
          }}
        >
          Utwórz link
        </button>
      </div>
    </div>
  );
}
