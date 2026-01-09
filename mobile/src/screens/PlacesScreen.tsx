import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSession } from "../auth/useSession";
import { apiGet } from "../api/client";
import type { PlacesStackParamList } from "../navigation/PlacesStack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";

type PlacesNav = NativeStackNavigationProp<PlacesStackParamList, "PlacesList">;

export function PlacesScreen() {
  const navigation = useNavigation<PlacesNav>();
  const { session } = useSession();
  const [places, setPlaces] = useState<
    Array<{ id: string; ownerId: string; name: string; address: string; lat?: number; lng?: number }>
  >([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      apiGet<{ ok: boolean; data: { id: string } }>("/api/me", session.token),
      apiGet<
        {
          ok: boolean;
          data: Array<{ id: string; ownerId: string; name: string; address: string; lat?: number; lng?: number }>;
        }
      >("/api/places", session.token)
    ])
      .then(([mePayload, placesPayload]) => {
        setUserId(mePayload.data?.id ?? null);
        setPlaces(placesPayload.data ?? []);
      })
      .catch(() => setError("Nie udało się pobrać miejsc."))
      .finally(() => setLoading(false));
  }, [session]);

  const myPlaces = userId ? places.filter((place) => place.ownerId === userId) : [];
  const friendPlaces = userId ? places.filter((place) => place.ownerId !== userId) : [];


  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Miejsca</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Kolegów</Text>
          {loading ? (
            <Text style={styles.muted}>Ładowanie...</Text>
          ) : friendPlaces.length === 0 ? (
            <Text style={styles.muted}>Brak miejsc od kolegów.</Text>
          ) : (
            friendPlaces.map((place) => (
              <Pressable
                key={place.id}
                style={styles.placeCard}
                onPress={() => navigation.navigate("PlaceDetail", { placeId: place.id, name: place.name })}
              >
                <Text style={styles.placeTitle}>{place.name}</Text>
                <Text style={styles.placeAddress}>{place.address}</Text>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Kolega</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Moje</Text>
            <Pressable
              style={styles.iconButton}
              onPress={() => navigation.navigate("AddPlace")}
              accessibilityLabel="Dodaj miejsce"
            >
              <Text style={styles.iconButtonText}>+</Text>
            </Pressable>
          </View>
          {loading ? (
            <Text style={styles.muted}>Ładowanie...</Text>
          ) : myPlaces.length === 0 ? (
            <>
              <Text style={styles.muted}>Nie masz jeszcze żadnego miejsca.</Text>
              <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("AddPlace")}>
                <Text style={styles.primaryButtonText}>Dodaj miejsce</Text>
              </Pressable>
            </>
          ) : (
            myPlaces.map((place) => (
              <Pressable
                key={place.id}
                style={styles.placeCard}
                onPress={() => navigation.navigate("PlaceDetail", { placeId: place.id, name: place.name })}
              >
                <Text style={styles.placeTitle}>{place.name}</Text>
                <Text style={styles.placeAddress}>{place.address}</Text>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Ty</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 0,
    gap: 16,
    backgroundColor: theme.colors.bg
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    fontFamily: "Fraunces_600SemiBold",
    color: theme.colors.text
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  iconButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt
  },
  iconButtonText: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "600",
    color: theme.colors.text
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    alignSelf: "flex-start",
    ...theme.shadow.soft
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600"
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
  placeCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    gap: 6
  },
  placeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text
  },
  placeAddress: {
    fontSize: 13,
    color: theme.colors.muted
  },
  pill: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(44, 122, 123, 0.14)"
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary
  },
  error: {
    color: theme.colors.error
  },
  muted: {
    color: theme.colors.muted
  }
});
