import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSession } from "../auth/useSession";
import { apiGet } from "../api/client";

export function PlacesScreen() {
  const { session } = useSession();
  const [places, setPlaces] = useState<Array<{ id: string; name: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }
    apiGet<{ ok: boolean; data: Array<{ id: string; name: string }> }>(
      "/api/places",
      session.token
    )
      .then((payload) => setPlaces(payload.data ?? []))
      .catch(() => setError("Nie udało się pobrać miejsc."));
  }, [session]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Miejsca</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {places.length === 0 ? (
        <Text style={styles.subtitle}>Brak miejsc do wyświetlenia.</Text>
      ) : (
        places.map((place) => (
          <View key={place.id} style={styles.card}>
            <Text style={styles.cardTitle}>{place.name}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
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
  card: {
    width: "100%",
    maxWidth: 360,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1b1b1b"
  },
  error: {
    color: "#b91c1c"
  }
});
