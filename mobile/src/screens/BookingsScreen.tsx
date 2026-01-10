import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ViewStyle, TextStyle, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../auth/useSession";
import { apiGet, apiPost } from "../api/client";
import { formatDate } from "../utils/date";
import { theme } from "../theme";

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
  const [history, setHistory] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(
    async (showSpinner: boolean) => {
      if (!session) {
        return;
      }
      if (showSpinner) {
        setLoading(true);
      }
      setError(null);
      try {
        const [currentPayload, historyPayload] = await Promise.all([
          apiGet<{ ok: boolean; data: { myStays: unknown[]; atMyPlaces: unknown[] } }>(
            "/api/bookings",
            session.token
          ),
          apiGet<{ ok: boolean; data: { myStays: unknown[]; atMyPlaces: unknown[] } }>(
            "/api/bookings?history=true",
            session.token
          )
        ]);
        setMyStays((currentPayload.data?.myStays as Booking[]) ?? []);
        setAtMyPlaces((currentPayload.data?.atMyPlaces as Booking[]) ?? []);
        const past = [
          ...(historyPayload.data?.myStays as Booking[]),
          ...(historyPayload.data?.atMyPlaces as Booking[])
        ].filter((booking) => ["canceled", "declined", "completed"].includes(booking.status));
        setHistory(past);
      } catch {
        setError("Nie udało się pobrać rezerwacji.");
      } finally {
        if (showSpinner) {
          setLoading(false);
        }
      }
    },
    [session]
  );

  useEffect(() => {
    void loadData(true);
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(false);
    setRefreshing(false);
  }, [loadData]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Rezerwacje</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? <Text style={styles.muted}>Ładowanie...</Text> : null}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Moje pobyty</Text>
          {myStays.length === 0 ? (
            <Text style={styles.muted}>Brak pobytów.</Text>
          ) : (
            myStays.map((booking) => {
              const statusKey = `status_${booking.status}` as keyof typeof styles;
              const statusTextKey = `statusText_${booking.status}` as keyof typeof styles;
              const statusStyle = styles[statusKey] as ViewStyle;
              const statusTextStyle = styles[statusTextKey] as TextStyle;

              return (
                <View key={booking.id} style={styles.bookingCard}>
                  <Text style={styles.cardTitle}>Pobyt</Text>
                  <Text style={styles.cardText}>
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                  </Text>
                  <View style={[styles.statusPill, statusStyle]}>
                    <Text style={[styles.statusText, statusTextStyle]}>
                      {booking.status}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>U mnie</Text>
          {atMyPlaces.length === 0 ? (
            <Text style={styles.muted}>Brak rezerwacji.</Text>
          ) : (
            atMyPlaces.map((booking) => {
              const statusKey = `status_${booking.status}` as keyof typeof styles;
              const statusTextKey = `statusText_${booking.status}` as keyof typeof styles;
              const statusStyle = styles[statusKey] as ViewStyle;
              const statusTextStyle = styles[statusTextKey] as TextStyle;

              return (
                <View key={booking.id} style={styles.bookingCard}>
                  <Text style={styles.cardTitle}>Rezerwacja</Text>
                  <Text style={styles.cardText}>
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                  </Text>
                  <View style={[styles.statusPill, statusStyle]}>
                    <Text style={[styles.statusText, statusTextStyle]}>
                      {booking.status}
                    </Text>
                  </View>
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
              );
            })
          )}
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Poprzednie</Text>
          {history.length === 0 ? (
            <Text style={styles.muted}>Brak historii.</Text>
          ) : (
            history.map((booking) => {
              const statusKey = `status_${booking.status}` as keyof typeof styles;
              const statusTextKey = `statusText_${booking.status}` as keyof typeof styles;
              const statusStyle = styles[statusKey] as ViewStyle;
              const statusTextStyle = styles[statusTextKey] as TextStyle;

              return (
                <View key={booking.id} style={styles.bookingCard}>
                  <Text style={styles.cardTitle}>Historia</Text>
                  <Text style={styles.cardText}>
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                  </Text>
                  <View style={[styles.statusPill, statusStyle]}>
                    <Text style={[styles.statusText, statusTextStyle]}>
                      {booking.status}
                    </Text>
                  </View>
                </View>
              );
            })
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
  error: {
    color: theme.colors.error
  },
  muted: {
    color: theme.colors.muted
  },
  bookingCard: {
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
    fontSize: 13,
    color: theme.colors.muted
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase"
  },
  status_requested: {
    backgroundColor: "rgba(217, 119, 6, 0.16)"
  },
  status_approved: {
    backgroundColor: "rgba(44, 122, 123, 0.16)"
  },
  status_declined: {
    backgroundColor: "rgba(185, 28, 28, 0.12)"
  },
  status_canceled: {
    backgroundColor: "rgba(75, 75, 75, 0.12)"
  },
  status_completed: {
    backgroundColor: "rgba(44, 122, 123, 0.12)"
  },
  statusText_requested: {
    color: theme.colors.accent
  },
  statusText_approved: {
    color: theme.colors.primary
  },
  statusText_declined: {
    color: theme.colors.error
  },
  statusText_canceled: {
    color: theme.colors.muted
  },
  statusText_completed: {
    color: theme.colors.primary
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10
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
  }
});
