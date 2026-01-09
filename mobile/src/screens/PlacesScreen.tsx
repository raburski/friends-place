import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { useSession } from "../auth/useSession";
import { apiGet } from "../api/client";
import type { PlacesStackParamList } from "../navigation/PlacesStack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type PlacesNav = NativeStackNavigationProp<PlacesStackParamList, "PlacesList">;

export function PlacesScreen() {
  const navigation = useNavigation<PlacesNav>();
  const { session } = useSession();
  const [places, setPlaces] = useState<Array<{ id: string; name: string; lat?: number; lng?: number }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }
    apiGet<{ ok: boolean; data: Array<{ id: string; name: string; lat?: number; lng?: number }> }>(
      "/api/places",
      session.token
    )
      .then((payload) => setPlaces(payload.data ?? []))
      .catch(() => setError("Nie udało się pobrać miejsc."));
  }, [session]);

  const mapRegion = useMemo<Region | undefined>(() => {
    const coords = places.filter((place) => typeof place.lat === "number" && typeof place.lng === "number");
    if (coords.length === 0) {
      return undefined;
    }
    const lats = coords.map((place) => place.lat ?? 0);
    const lngs = coords.map((place) => place.lng ?? 0);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.05, maxLat - minLat + 0.05),
      longitudeDelta: Math.max(0.05, maxLng - minLng + 0.05)
    };
  }, [places]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Miejsca</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.mapStub}>
        <MapView
          style={styles.map}
          region={mapRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {places.map((place) =>
            typeof place.lat === "number" && typeof place.lng === "number" ? (
              <Marker
                key={place.id}
                coordinate={{ latitude: place.lat, longitude: place.lng }}
                title={place.name}
              />
            ) : null
          )}
        </MapView>
        {!mapRegion ? (
          <View style={styles.mapOverlay}>
            <Text style={styles.mapTitle}>Brak lokalizacji do pokazania</Text>
          </View>
        ) : null}
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
    overflow: "hidden"
  },
  map: {
    width: "100%",
    height: "100%"
  },
  mapOverlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(240, 235, 224, 0.8)"
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
