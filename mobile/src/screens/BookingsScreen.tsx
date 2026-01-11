import { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ViewStyle, TextStyle, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDate } from "../utils/date";
import { type Theme, useTheme } from "../theme";
import { useMobileApiOptions, useMobileApiQueryOptions } from "../api/useMobileApiOptions";
import { useBookingsQuery } from "../../../shared/query/hooks/useQueries";
import { useApproveBookingMutation, useDeclineBookingMutation } from "../../../shared/query/hooks/useMutations";

type Booking = {
  id: string;
  placeId: string;
  startDate: string;
  endDate: string;
  status: string;
};

export function BookingsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const apiOptions = useMobileApiOptions();
  const apiQueryOptions = useMobileApiQueryOptions();
  const currentQuery = useBookingsQuery("current", apiQueryOptions);
  const historyQuery = useBookingsQuery("history", apiQueryOptions);
  const approveMutation = useApproveBookingMutation(apiOptions);
  const declineMutation = useDeclineBookingMutation(apiOptions);

  const myStays = useMemo(
    () => (currentQuery.data?.data?.myStays as Booking[]) ?? [],
    [currentQuery.data]
  );
  const atMyPlaces = useMemo(
    () => (currentQuery.data?.data?.atMyPlaces as Booking[]) ?? [],
    [currentQuery.data]
  );
  const history = useMemo(() => {
    const payload = historyQuery.data?.data ?? { myStays: [], atMyPlaces: [] };
    return [...payload.myStays, ...payload.atMyPlaces].filter((booking) =>
      ["canceled", "declined", "completed"].includes(booking.status)
    ) as Booking[];
  }, [historyQuery.data]);

  const error =
    currentQuery.isError || historyQuery.isError ? "Nie udało się pobrać rezerwacji." : null;
  const loading = currentQuery.isLoading || historyQuery.isLoading;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([currentQuery.refetch(), historyQuery.refetch()]);
    setRefreshing(false);
  }, [currentQuery, historyQuery]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
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
                          approveMutation.mutate(booking.id);
                        }}
                      >
                        <Text style={styles.smallButtonText}>Akceptuj</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.smallButton, styles.secondaryButton]}
                        onPress={async () => {
                          declineMutation.mutate(booking.id);
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
    backgroundColor: theme.colors.accentSoft
  },
  status_approved: {
    backgroundColor: theme.colors.primarySoft
  },
  status_declined: {
    backgroundColor: theme.colors.errorSoft
  },
  status_canceled: {
    backgroundColor: theme.colors.mutedSoft
  },
  status_completed: {
    backgroundColor: theme.colors.primarySoft
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
