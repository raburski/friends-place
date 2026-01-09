import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSession } from "../auth/useSession";
import { apiGet } from "../api/client";

export function BookingsScreen() {
  const { session } = useSession();
  const [counts, setCounts] = useState({ myStays: 0, atMyPlaces: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }
    apiGet<{ ok: boolean; data: { myStays: unknown[]; atMyPlaces: unknown[] } }>(
      "/api/bookings",
      session.token
    )
      .then((payload) => {
        setCounts({
          myStays: payload.data?.myStays?.length ?? 0,
          atMyPlaces: payload.data?.atMyPlaces?.length ?? 0
        });
      })
      .catch(() => setError("Nie udało się pobrać rezerwacji."));
  }, [session]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rezerwacje</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.subtitle}>Moje pobyty: {counts.myStays}</Text>
      <Text style={styles.subtitle}>U mnie: {counts.atMyPlaces}</Text>
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
    marginBottom: 8
  },
  subtitle: {
    color: "#4b4b4b"
  },
  error: {
    color: "#b91c1c",
    marginBottom: 8
  }
});
