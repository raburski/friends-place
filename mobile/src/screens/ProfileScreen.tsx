import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { useSession } from "../auth/useSession";
import { apiGet, apiPost } from "../api/client";

export function ProfileScreen() {
  const { session, revoke } = useSession();
  const [profile, setProfile] = useState<{ displayName?: string; handle?: string } | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [friends, setFriends] = useState<
    Array<{ friendshipId: string; friendId: string; handle?: string; displayName?: string }>
  >([]);
  const [requests, setRequests] = useState<Array<{ friendshipId: string; handle?: string; displayName?: string }>>(
    []
  );
  const [invites, setInvites] = useState<
    Array<{ id: string; code: string; type: string; revokedAt?: string | null }>
  >([]);
  const [handleQuery, setHandleQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }
    Promise.all([
      apiGet<{ ok: boolean; data: { displayName?: string; handle?: string } }>(
        "/api/me",
        session.token
      ),
      apiGet<{ ok: boolean; data: Array<{ friendshipId: string; friendId: string; handle?: string; displayName?: string }> }>(
        "/api/friends",
        session.token
      ),
      apiGet<{ ok: boolean; data: Array<{ friendshipId: string; handle?: string; displayName?: string }> }>(
        "/api/friends/requests",
        session.token
      ),
      apiGet<{ ok: boolean; data: Array<{ id: string; code: string; type: string; revokedAt?: string | null }> }>(
        "/api/invites",
        session.token
      )
    ])
      .then(([me, friendsPayload, pending, invitesPayload]) => {
        setProfile(me.data ?? null);
        setFriends(friendsPayload.data ?? []);
        setFriendsCount(friendsPayload.data?.length ?? 0);
        setRequests(pending.data ?? []);
        setInvites(invitesPayload.data ?? []);
      })
      .catch(() => setError("Nie udało się pobrać profilu."));
  }, [session]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {profile ? (
        <>
          <Text style={styles.subtitle}>{profile.displayName ?? "Brak nazwy"}</Text>
          <Text style={styles.subtle}>@{profile.handle ?? "bez_handle"}</Text>
        </>
      ) : null}
      <Text style={styles.subtle}>Znajomi: {friendsCount}</Text>
      <Text style={styles.sectionTitle}>Zaproszenia</Text>
      {requests.length === 0 ? (
        <Text style={styles.subtle}>Brak nowych zaproszeń.</Text>
      ) : (
        requests.map((request) => (
          <View key={request.friendshipId} style={styles.card}>
            <Text style={styles.cardTitle}>
              {request.displayName ?? "Nowy znajomy"}
            </Text>
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
                <Text style={[styles.smallButtonText, styles.secondaryButtonText]}>
                  Odrzuć
                </Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
      <Text style={styles.sectionTitle}>Znajomi</Text>
      {friends.length === 0 ? (
        <Text style={styles.subtle}>Brak znajomych.</Text>
      ) : (
        friends.map((friend) => (
          <View key={friend.friendshipId} style={styles.card}>
            <Text style={styles.cardTitle}>
              {friend.displayName ?? "Znajomy"}
            </Text>
            <Text style={styles.cardText}>@{friend.handle ?? "bez_handle"}</Text>
            <Pressable
              style={[styles.smallButton, styles.secondaryButton]}
              onPress={async () => {
                if (!session) return;
                await apiPost("/api/friends/unfriend", session.token, {
                  friendId: friend.friendId
                });
                setFriends((current) =>
                  current.filter((item) => item.friendshipId !== friend.friendshipId)
                );
              }}
            >
              <Text style={[styles.smallButtonText, styles.secondaryButtonText]}>Usuń</Text>
            </Pressable>
          </View>
        ))
      )}
      <Text style={styles.sectionTitle}>Dodaj znajomego</Text>
      <TextInput
        style={styles.input}
        placeholder="Handle (np. kasia_krk)"
        value={handleQuery}
        onChangeText={setHandleQuery}
        autoCapitalize="none"
      />
      <Pressable
        style={styles.button}
        onPress={async () => {
          if (!session) return;
          try {
            await apiPost("/api/friends/request", session.token, {
              handle: handleQuery
            });
            setHandleQuery("");
          } catch {
            setError("Nie udało się wysłać zaproszenia.");
          }
        }}
      >
        <Text style={styles.buttonText}>Wyślij zaproszenie</Text>
      </Pressable>
      <Text style={styles.sectionTitle}>Twoje linki zaproszeń</Text>
      {invites.length === 0 ? (
        <Text style={styles.subtle}>Brak linków.</Text>
      ) : (
        invites.map((invite) => (
          <View key={invite.id} style={styles.card}>
            <Text style={styles.cardTitle}>{invite.type === "single" ? "Jednorazowy" : "Wielorazowy"}</Text>
            <Text style={styles.cardText}>Kod: {invite.code}</Text>
            <Text style={styles.cardText}>
              Status: {invite.revokedAt ? "Wycofany" : "Aktywny"}
            </Text>
            {!invite.revokedAt ? (
              <Pressable
                style={[styles.smallButton, styles.secondaryButton]}
                onPress={async () => {
                  if (!session) return;
                  await apiPost(`/api/invites/${invite.id}/revoke`, session.token);
                  setInvites((current) =>
                    current.map((item) =>
                      item.id === invite.id ? { ...item, revokedAt: new Date().toISOString() } : item
                    )
                  );
                }}
              >
                <Text style={[styles.smallButtonText, styles.secondaryButtonText]}>Wycofaj</Text>
              </Pressable>
            ) : null}
          </View>
        ))
      )}
      <Pressable
        style={styles.button}
        onPress={async () => {
          if (!session) return;
          try {
            const payload = await apiPost<{ ok: boolean; data: { id: string; code: string; type: string } }>(
              "/api/invites",
              session.token,
              { type: "multi" }
            );
            setInvites((current) => [payload.data, ...current]);
          } catch {
            setError("Nie udało się utworzyć linku.");
          }
        }}
      >
        <Text style={styles.buttonText}>Utwórz link zaproszenia</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={revoke}>
        <Text style={styles.buttonText}>Wyloguj</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f7f4ee"
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 4
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8
  },
  subtle: {
    fontSize: 14,
    color: "#4b4b4b",
    marginBottom: 8
  },
  card: {
    width: "100%",
    maxWidth: 360,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600"
  },
  cardText: {
    fontSize: 12,
    color: "#4b4b4b"
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#2c7a7b"
  },
  smallButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12
  },
  secondaryButton: {
    backgroundColor: "#f3e9d2"
  },
  secondaryButtonText: {
    color: "#7c5a00"
  },
  input: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12
  },
  button: {
    backgroundColor: "#2c7a7b",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600"
  },
  error: {
    color: "#b91c1c",
    marginBottom: 8
  }
});
