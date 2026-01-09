import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Share, Modal, ScrollView } from "react-native";
import { useSession } from "../auth/useSession";
import { apiGet, apiPost } from "../api/client";
import { theme } from "../theme";

export function FriendsScreen() {
  const { session } = useSession();
  const [friends, setFriends] = useState<
    Array<{ friendshipId: string; friendId: string; handle?: string; displayName?: string }>
  >([]);
  const [requests, setRequests] = useState<Array<{ friendshipId: string; handle?: string; displayName?: string }>>(
    []
  );
  const [invites, setInvites] = useState<
    Array<{ id: string; code: string; type: string; revokedAt?: string | null }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [revokeInviteId, setRevokeInviteId] = useState<string | null>(null);
  const [removeFriendId, setRemoveFriendId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }
    Promise.all([
      apiGet<{
        ok: boolean;
        data: Array<{ friendshipId: string; friendId: string; handle?: string; displayName?: string }>;
      }>("/api/friends", session.token),
      apiGet<{ ok: boolean; data: Array<{ friendshipId: string; handle?: string; displayName?: string }> }>(
        "/api/friends/requests",
        session.token
      ),
      apiGet<{ ok: boolean; data: Array<{ id: string; code: string; type: string; revokedAt?: string | null }> }>(
        "/api/invites",
        session.token
      )
    ])
      .then(([friendsPayload, pending, invitesPayload]) => {
        setFriends(friendsPayload.data ?? []);
        setRequests(pending.data ?? []);
        setInvites(invitesPayload.data ?? []);
      })
      .catch(() => setError("Nie udało się pobrać danych."));
  }, [session]);

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Zaproszenia</Text>
          {requests.length === 0 ? (
            <Text style={styles.muted}>Brak nowych zaproszeń.</Text>
          ) : (
            requests.map((request) => (
              <View key={request.friendshipId} style={styles.card}>
                <Text style={styles.cardTitle}>{request.displayName ?? "Nowy znajomy"}</Text>
                <Text style={styles.cardText}>@{request.handle ?? "bez_handle"}</Text>
                <View style={styles.buttonRow}>
                  <Pressable
                    style={styles.smallButton}
                    onPress={async () => {
                      if (!session) return;
                      await apiPost("/api/friends/respond", session.token, {
                        friendshipId: request.friendshipId,
                        accept: true
                      });
                      setRequests((current) =>
                        current.filter((item) => item.friendshipId !== request.friendshipId)
                      );
                    }}
                  >
                    <Text style={styles.smallButtonText}>Akceptuj</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.smallButton, styles.secondaryButton]}
                    onPress={async () => {
                      if (!session) return;
                      await apiPost("/api/friends/respond", session.token, {
                        friendshipId: request.friendshipId,
                        accept: false
                      });
                      setRequests((current) =>
                        current.filter((item) => item.friendshipId !== request.friendshipId)
                      );
                    }}
                  >
                    <Text style={[styles.smallButtonText, styles.secondaryButtonText]}>Odrzuć</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Znajomi</Text>
          {friends.length === 0 ? (
            <Text style={styles.muted}>Brak znajomych.</Text>
          ) : (
            friends.map((friend) => (
              <View key={friend.friendshipId} style={styles.card}>
                <Text style={styles.cardTitle}>{friend.displayName ?? "Znajomy"}</Text>
                <Text style={styles.cardText}>@{friend.handle ?? "bez_handle"}</Text>
                <Pressable
                  style={[styles.smallButton, styles.secondaryButton]}
                  onPress={() => setRemoveFriendId(friend.friendId)}
                >
                  <Text style={[styles.smallButtonText, styles.secondaryButtonText]}>Usuń</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Dodaj znajomego</Text>
          <Text style={styles.muted}>Udostępnij swój link zaproszenia.</Text>
          <Text style={styles.sectionSubtitle}>Twój link zaproszenia</Text>
          {invites.length === 0 ? (
            <Text style={styles.muted}>Brak linków.</Text>
          ) : (
            invites
              .filter((invite) => !invite.revokedAt)
              .map((invite) => (
                <View key={invite.id} style={styles.inviteRow}>
                  <View style={styles.inviteMeta}>
                    <Text style={styles.cardTitle}>
                      {invite.type === "single" ? "Jednorazowy" : "Wielorazowy"}
                    </Text>
                    <Text style={styles.cardText}>Kod: {invite.code}</Text>
                  </View>
                  <View style={styles.inviteActions}>
                    <Pressable
                      style={styles.smallButton}
                      onPress={async () => {
                        await Share.share({
                          message: `${process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000"}/auth/invite/${invite.code}`
                        });
                      }}
                    >
                      <Text style={styles.smallButtonText}>Udostępnij</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.smallButton, styles.secondaryButton]}
                      onPress={() => setRevokeInviteId(invite.id)}
                    >
                      <Text style={[styles.smallButtonText, styles.secondaryButtonText]}>Wycofaj</Text>
                    </Pressable>
                  </View>
                </View>
              ))
          )}
          <Text style={styles.muted}>Link jest tworzony automatycznie.</Text>
        </View>
      </ScrollView>
      <Modal transparent visible={Boolean(revokeInviteId)} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.cardTitle}>Wycofać link?</Text>
            <Text style={styles.muted}>Link przestanie działać natychmiast.</Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.smallButton, styles.secondaryButton]}
                onPress={() => setRevokeInviteId(null)}
              >
                <Text style={[styles.smallButtonText, styles.secondaryButtonText]}>Anuluj</Text>
              </Pressable>
              <Pressable
                style={styles.smallButton}
                onPress={async () => {
                  if (!session || !revokeInviteId) return;
                  await apiPost(`/api/invites/${revokeInviteId}/revoke`, session.token);
                  setRevokeInviteId(null);
                  setInvites((current) =>
                    current.map((item) =>
                      item.id === revokeInviteId ? { ...item, revokedAt: new Date().toISOString() } : item
                    )
                  );
                }}
              >
                <Text style={styles.smallButtonText}>Wycofaj</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal transparent visible={Boolean(removeFriendId)} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.cardTitle}>Usunąć znajomego?</Text>
            <Text style={styles.muted}>Stracicie dostęp do swoich miejsc.</Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.smallButton, styles.secondaryButton]}
                onPress={() => setRemoveFriendId(null)}
              >
                <Text style={[styles.smallButtonText, styles.secondaryButtonText]}>Anuluj</Text>
              </Pressable>
              <Pressable
                style={styles.smallButton}
                onPress={async () => {
                  if (!session || !removeFriendId) return;
                  await apiPost("/api/friends/unfriend", session.token, {
                    friendId: removeFriendId
                  });
                  setFriends((current) => current.filter((item) => item.friendId !== removeFriendId));
                  setRemoveFriendId(null);
                }}
              >
                <Text style={styles.smallButtonText}>Usuń</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 16,
    backgroundColor: theme.colors.bg
  },
  sectionCard: {
    padding: 16,
    borderRadius: theme.radius.sheet,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
    ...theme.shadow.soft
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    fontFamily: "Fraunces_600SemiBold"
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text
  },
  muted: {
    fontSize: 14,
    color: theme.colors.muted
  },
  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    gap: 6
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text
  },
  cardText: {
    fontSize: 12,
    color: theme.colors.muted
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary
  },
  smallButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  secondaryButtonText: {
    color: theme.colors.accent
  },
  inviteRow: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap"
  },
  inviteMeta: {
    flex: 1
  },
  inviteActions: {
    flexDirection: "row",
    gap: 8
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  modalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sheet,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  error: {
    color: theme.colors.error
  }
});
