import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSession } from "../auth/useSession";
import { apiGet, apiPost } from "../api/client";

export function ProfileScreen() {
  const { session, revoke } = useSession();
  const [profile, setProfile] = useState<{ displayName?: string; handle?: string } | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [requests, setRequests] = useState<Array<{ friendshipId: string; handle?: string; displayName?: string }>>(
    []
  );
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
      apiGet<{ ok: boolean; data: unknown[] }>("/api/friends", session.token),
      apiGet<{ ok: boolean; data: Array<{ friendshipId: string; handle?: string; displayName?: string }> }>(
        "/api/friends/requests",
        session.token
      )
    ])
      .then(([me, friends, pending]) => {
        setProfile(me.data ?? null);
        setFriendsCount(friends.data?.length ?? 0);
        setRequests(pending.data ?? []);
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
