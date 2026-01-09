import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSession } from "../auth/useSession";
import { apiGet } from "../api/client";
import type { PlacesStackParamList } from "../navigation/PlacesStack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type PlacesNav = NativeStackNavigationProp<PlacesStackParamList, "PlacesList">;

export function PlacesScreen() {
  const navigation = useNavigation<PlacesNav>();
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
      <View style={styles.mapStub}>
        <Text style={styles.mapTitle}>Mapa (wkrótce)</Text>
        <Text style={styles.mapText}>Apple Maps placeholder</Text>
      </View>
      {places.length === 0 ? (
        <Text style={styles.subtitle}>Brak miejsc do wyświetlenia.</Text>
      ) : (
        places.map((place) => (
          <Pressable
            key={place.id}
            style={styles.card}
            onPress={() => navigation.navigate("PlaceDetail", { placeId: place.id, name: place.name })}
          >
            <Text style={styles.cardTitle}>{place.name}</Text>
            <Text style={styles.cardSub}>Zobacz szczegóły</Text>
          </Pressable>
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
  cardSub: {
    fontSize: 12,
    color: "#4b4b4b",
    marginTop: 6
  },
  mapStub: {
    width: "100%",
    maxWidth: 360,
    height: 180,
    borderRadius: 16,
    backgroundColor: "#f0ebe0",
    borderColor: "#e5e0d5",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4
  },
  mapText: {
    fontSize: 12,
    color: "#4b4b4b"
  },
  error: {
    color: "#b91c1c"
  }
});
