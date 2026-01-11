import { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, RefreshControl } from "react-native";
import { formatDate } from "../utils/date";
import { type Theme, useTheme } from "../theme";
import { useMobileApiOptions, useMobileApiQueryOptions } from "../api/useMobileApiOptions";
import { useBookingsQuery } from "../../../shared/query/hooks/useQueries";
import { useApproveBookingMutation, useDeclineBookingMutation } from "../../../shared/query/hooks/useMutations";
import { Button } from "../ui/Button";
import { EmptyView } from "../ui/EmptyView";
import { LoadingView } from "../ui/LoadingView";
import { List } from "../ui/List";
import { ListRow } from "../ui/ListRow";
import { Pill, type PillTone } from "../ui/Pill";
import { Screen } from "../ui/Screen";

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
  const approveIsPending =
    (approveMutation as { isPending?: boolean }).isPending ??
    (approveMutation as { isLoading?: boolean }).isLoading ??
    false;
  const declineIsPending =
    (declineMutation as { isPending?: boolean }).isPending ??
    (declineMutation as { isLoading?: boolean }).isLoading ??
    false;

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
  const dateRange = (booking: Booking) =>
    `${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}`;

  const statusTone = (status: string): PillTone => {
    switch (status) {
      case "requested":
        return "accent";
      case "declined":
        return "danger";
      case "canceled":
        return "muted";
      default:
        return "primary";
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([currentQuery.refetch(), historyQuery.refetch()]);
    setRefreshing(false);
  }, [currentQuery, historyQuery]);

  return (
    <Screen
      title="Rezerwacje"
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        )
      }}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <List title="Moje pobyty">
        {loading ? (
          <LoadingView />
        ) : myStays.length === 0 ? (
          <EmptyView message="Brak pobytów." />
        ) : (
          myStays.map((booking, index) => (
            <ListRow key={booking.id} isLastRow={index === myStays.length - 1}>
              <View style={styles.rowContent}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowTitle}>Pobyt</Text>
                  <Pill label={booking.status.toUpperCase()} tone={statusTone(booking.status)} />
                </View>
                <Text style={styles.rowSubtitle}>{dateRange(booking)}</Text>
              </View>
            </ListRow>
          ))
        )}
      </List>
      <List title="U mnie">
        {loading ? (
          <LoadingView />
        ) : atMyPlaces.length === 0 ? (
          <EmptyView message="Brak rezerwacji." />
        ) : (
          atMyPlaces.map((booking, index) => (
            <ListRow key={booking.id} isLastRow={index === atMyPlaces.length - 1}>
              <View style={styles.rowContent}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowTitle}>Rezerwacja</Text>
                  <Pill label={booking.status.toUpperCase()} tone={statusTone(booking.status)} />
                </View>
                <Text style={styles.rowSubtitle}>{dateRange(booking)}</Text>
                {booking.status === "requested" ? (
                  <View style={styles.buttonRow}>
                    <Button
                      label="Akceptuj"
                      size="sm"
                      loading={approveIsPending}
                      onPress={async () => {
                        approveMutation.mutate(booking.id);
                      }}
                    />
                    <Button
                      label="Odrzuć"
                      size="sm"
                      variant="secondary"
                      loading={declineIsPending}
                      onPress={async () => {
                        declineMutation.mutate(booking.id);
                      }}
                    />
                  </View>
                ) : null}
              </View>
            </ListRow>
          ))
        )}
      </List>
      <List title="Poprzednie">
        {loading ? (
          <LoadingView />
        ) : history.length === 0 ? (
          <EmptyView message="Brak historii." />
        ) : (
          history.map((booking, index) => (
            <ListRow key={booking.id} isLastRow={index === history.length - 1}>
              <View style={styles.rowContent}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowTitle}>Historia</Text>
                  <Pill label={booking.status.toUpperCase()} tone={statusTone(booking.status)} />
                </View>
                <Text style={styles.rowSubtitle}>{dateRange(booking)}</Text>
              </View>
            </ListRow>
          ))
        )}
      </List>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  error: {
    color: theme.colors.error
  },
  rowContent: {
    gap: 6
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text
  },
  rowSubtitle: {
    fontSize: 13,
    color: theme.colors.muted
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10
  }
  });
