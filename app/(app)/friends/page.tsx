"use client";

import { useMemo, useState } from "react";
import { Copy, Trash } from "@phosphor-icons/react";
import { useWebApiOptions } from "../../_components/useWebApiOptions";
import { useFriendsQuery, useInvitesQuery } from "../../../shared/query/hooks/useQueries";
import { useRevokeInviteMutation, useUnfriendMutation } from "../../../shared/query/hooks/useMutations";
import { Button } from "../../_components/Button";
import { SectionCard } from "../../_components/SectionCard";
import { ConfirmDialog } from "../../_components/ConfirmDialog";
import { ScreenLayout } from "../../_components/ScreenLayout";

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
  const revokeIsPending =
    (revokeInviteMutation as { isPending?: boolean }).isPending ??
    (revokeInviteMutation as { isLoading?: boolean }).isLoading ??
    false;
  const unfriendIsPending =
    (unfriendMutation as { isPending?: boolean }).isPending ??
    (unfriendMutation as { isLoading?: boolean }).isLoading ??
    false;

  const inviteUrl = (code: string) => {
    if (typeof window === "undefined") {
      return code;
    }
    return `${window.location.origin}/auth/invite/${code}`;
  };

  return (
    <ScreenLayout title="Koledzy">
      {error ? <p className="muted">{error}</p> : null}
      {loading ? <p className="muted">Ładowanie...</p> : null}

      <div className="panel-grid">
        <SectionCard title="Twoja sieć" style={{ display: "grid", gap: 12 }}>
          {friends.length === 0 ? (
            <p className="muted">Musisz dodać jakiś kolegów, żeby to miejsce miało sens...</p>
          ) : (
            friends.map((friend) => (
              <div key={friend.friendshipId} className="friend-row">
                <div className="friend-meta">
                  <strong>{friend.displayName ?? "Znajomy"}</strong>
                  <div className="muted">@{friend.handle ?? "bez_handle"}</div>
                </div>
                <Button
                  className="friend-remove"
                  title="Usuń znajomego"
                  aria-label="Usuń znajomego"
                  onClick={() => setRemoveId(friend.friendId)}
                >
                  ×
                </Button>
              </div>
            ))
          )}
        </SectionCard>

        <SectionCard
          title="Dodaj znajomego"
          subtitle="Udostępnij swój link zaproszenia."
          style={{ display: "grid", gap: 16 }}
        >
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
                    <Button
                      className="invite-copy"
                      title="Kopiuj link"
                      icon={<Copy size={18} weight="bold" />}
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
                      {copiedId === invite.id ? "Skopiowano" : "Kopiuj link"}
                    </Button>
                    <Button
                      className="invite-copy invite-icon-only"
                      title="Wycofaj link"
                      aria-label="Wycofaj link"
                      icon={<Trash size={18} weight="bold" />}
                      onClick={() => setRevokeId(invite.id)}
                    />
                  </div>
                </div>
              ))
          )}
          <div className="invite-hint muted">
            Link jest tworzony automatycznie po rejestracji.
          </div>
        </SectionCard>
      </div>
      <ConfirmDialog
        isOpen={Boolean(revokeId)}
        title="Wycofać link?"
        description="Link przestanie działać natychmiast."
        confirmLabel="Wycofaj"
        confirmLoading={revokeIsPending}
        confirmLoadingLabel="Wycofywanie..."
        onCancel={() => setRevokeId(null)}
        onConfirm={async () => {
          if (!revokeId) {
            return;
          }
          await revokeInviteMutation.mutateAsync(revokeId);
          setRevokeId(null);
        }}
      />
      <ConfirmDialog
        isOpen={Boolean(removeId)}
        title="Usunąć znajomego?"
        description="Stracicie dostęp do swoich miejsc."
        confirmLabel="Usuń"
        confirmLoading={unfriendIsPending}
        confirmLoadingLabel="Usuwanie..."
        onCancel={() => setRemoveId(null)}
        onConfirm={async () => {
          if (!removeId) {
            return;
          }
          await unfriendMutation.mutateAsync(removeId);
          setRemoveId(null);
        }}
      />
    </ScreenLayout>
  );
}
