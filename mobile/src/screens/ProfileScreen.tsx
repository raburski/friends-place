import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSession } from "../auth/useSession";
import { apiGet } from "../api/client";

export function ProfileScreen() {
  const { session, revoke } = useSession();
  const [profile, setProfile] = useState<{ displayName?: string; handle?: string } | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);
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
      apiGet<{ ok: boolean; data: unknown[] }>("/api/friends", session.token)
    ])
      .then(([me, friends]) => {
        setProfile(me.data ?? null);
        setFriendsCount(friends.data?.length ?? 0);
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
  subtle: {
    fontSize: 14,
    color: "#4b4b4b",
    marginBottom: 8
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
