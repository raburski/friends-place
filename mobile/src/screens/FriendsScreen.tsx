import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Share, ScrollView, Alert } from "react-native";
import { useSession } from "../auth/useSession";
import { apiGet, apiPost } from "../api/client";
import { API_BASE_URL } from "../config";
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
          <Text style={styles.sectionTitle}>Znajomi</Text>
          {friends.length === 0 ? (
            <Text style={styles.muted}>Brak znajomych.</Text>
          ) : (
            friends.map((friend) => (
              <View key={friend.friendshipId} style={styles.card}>
                <View style={styles.friendRow}>
                  <View style={styles.friendMeta}>
                    <Text style={styles.cardTitle}>{friend.displayName ?? "Znajomy"}</Text>
                    <Text style={styles.cardText}>@{friend.handle ?? "bez_handle"}</Text>
                  </View>
                  <Pressable
                    style={[styles.smallButton, styles.secondaryButton, styles.removeButton]}
                    onPress={() => {
                      Alert.alert("Usunąć znajomego?", "Stracicie dostęp do swoich miejsc.", [
                        { text: "Anuluj", style: "cancel" },
                        {
                          text: "Usuń",
                          style: "destructive",
                          onPress: async () => {
                            if (!session) return;
                            await apiPost("/api/friends/unfriend", session.token, {
                              friendId: friend.friendId
                            });
                            setFriends((current) => current.filter((item) => item.friendId !== friend.friendId));
                          }
                        }
                      ]);
                    }}
                  >
                    <Text style={[styles.smallButtonText, styles.secondaryButtonText]}>X</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Dodaj znajomego</Text>
          <Text style={styles.muted}>Udostępnij swój link zaproszenia.</Text>
          {invites.length === 0 ? (
            <Text style={styles.muted}>Brak linków.</Text>
          ) : (
            invites
              .filter((invite) => !invite.revokedAt)
              .map((invite) => (
                <Pressable
                  key={invite.id}
                  style={styles.inviteRow}
                  onPress={async () => {
                    await Share.share({
                      message: `${API_BASE_URL}/auth/invite/${invite.code}`
                    });
                  }}
                >
                  <View style={styles.inviteMeta}>
                    <Text style={styles.cardTitle}>
                      {invite.type === "single" ? "Jednorazowy" : "Wielorazowy"}
                    </Text>
                    <Text style={styles.cardText}>Kod: {invite.code}</Text>
                  </View>
                  <View style={styles.inviteActions}>
                    <Pressable
                      style={styles.smallButton}
                      onPress={async (event) => {
                        event.stopPropagation?.();
                        await Share.share({
                          message: `${API_BASE_URL}/auth/invite/${invite.code}`
                        });
                      }}
                    >
                      <Text style={styles.smallButtonText}>Udostępnij</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.smallButton, styles.secondaryButton]}
                      onPress={(event) => {
                        event.stopPropagation?.();
                        Alert.alert("Wycofać link?", "Link przestanie działać natychmiast.", [
                          { text: "Anuluj", style: "cancel" },
                          {
                            text: "Wycofaj",
                            style: "destructive",
                            onPress: async () => {
                              if (!session) return;
                              await apiPost(`/api/invites/${invite.id}/revoke`, session.token);
                              setInvites((current) =>
                                current.map((item) =>
                                  item.id === invite.id ? { ...item, revokedAt: new Date().toISOString() } : item
                                )
                              );
                            }
                          }
                        ]);
                      }}
                    >
                      <Text style={[styles.smallButtonText, styles.secondaryButtonText]}>🗑</Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))
          )}
          <Text style={styles.muted}>Link jest tworzony automatycznie.</Text>
        </View>
      </ScrollView>
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
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  friendMeta: {
    flex: 1
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
  removeButton: {
    alignSelf: "flex-end",
    width: 28,
    height: 28,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: "center",
    justifyContent: "center"
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
  error: {
    color: theme.colors.error
  }
});
