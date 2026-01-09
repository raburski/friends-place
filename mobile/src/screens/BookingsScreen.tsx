import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSession } from "../auth/useSession";
import { apiGet, apiPost } from "../api/client";

type Booking = {
  id: string;
  placeId: string;
  startDate: string;
  endDate: string;
  status: string;
};

export function BookingsScreen() {
  const { session } = useSession();
  const [myStays, setMyStays] = useState<Booking[]>([]);
  const [atMyPlaces, setAtMyPlaces] = useState<Booking[]>([]);
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
        setMyStays((payload.data?.myStays as Booking[]) ?? []);
        setAtMyPlaces((payload.data?.atMyPlaces as Booking[]) ?? []);
      })
      .catch(() => setError("Nie udało się pobrać rezerwacji."));
  }, [session]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Rezerwacje</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.sectionTitle}>Moje pobyty</Text>
      {myStays.length === 0 ? (
        <Text style={styles.subtitle}>Brak pobytów.</Text>
      ) : (
        myStays.map((booking) => (
          <View key={booking.id} style={styles.card}>
            <Text style={styles.cardTitle}>Pobyt</Text>
            <Text style={styles.cardText}>
              {booking.startDate} → {booking.endDate}
            </Text>
            <Text style={styles.cardText}>Status: {booking.status}</Text>
          </View>
        ))
      )}
      <Text style={styles.sectionTitle}>U mnie</Text>
      {atMyPlaces.length === 0 ? (
        <Text style={styles.subtitle}>Brak rezerwacji.</Text>
      ) : (
        atMyPlaces.map((booking) => (
          <View key={booking.id} style={styles.card}>
            <Text style={styles.cardTitle}>Rezerwacja</Text>
            <Text style={styles.cardText}>
              {booking.startDate} → {booking.endDate}
            </Text>
            <Text style={styles.cardText}>Status: {booking.status}</Text>
            {booking.status === "requested" ? (
              <View style={styles.buttonRow}>
                <Pressable
                  style={styles.smallButton}
                  onPress={async () => {
                    if (!session) return;
                    await apiPost(`/api/bookings/${booking.id}/approve`, session.token);
                    setAtMyPlaces((current) =>
                      current.map((item) =>
                        item.id === booking.id ? { ...item, status: "approved" } : item
                      )
                    );
                  }}
                >
                  <Text style={styles.smallButtonText}>Akceptuj</Text>
                </Pressable>
                <Pressable
                  style={[styles.smallButton, styles.secondaryButton]}
                  onPress={async () => {
                    if (!session) return;
                    await apiPost(`/api/bookings/${booking.id}/decline`, session.token);
                    setAtMyPlaces((current) =>
                      current.map((item) =>
                        item.id === booking.id ? { ...item, status: "declined" } : item
                      )
                    );
                  }}
                >
                  <Text style={[styles.smallButtonText, styles.secondaryButtonText]}>
                    Odrzuć
                  </Text>
                </Pressable>
              </View>
            ) : null}
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
    justifyContent: "flex-start",
    padding: 24,
    backgroundColor: "#f7f4ee"
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    alignSelf: "flex-start"
  },
  error: {
    color: "#b91c1c",
    marginBottom: 8
  },
  subtitle: {
    color: "#4b4b4b",
    alignSelf: "flex-start"
  },
  card: {
    width: "100%",
    maxWidth: 360,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6
  },
  cardText: {
    fontSize: 13,
    color: "#4b4b4b"
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10
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
  }
});
