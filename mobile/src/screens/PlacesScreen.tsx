import { useCallback, useMemo, useState } from "react";
import { Text, StyleSheet, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMobileApiQueryOptions } from "../api/useMobileApiOptions";
import type { PlacesStackParamList } from "../navigation/PlacesStack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { type Theme, useTheme } from "../theme";
import { useMeQuery, usePlacesQuery } from "../../../shared/query/hooks/useQueries";
import { Button, IconButton } from "../ui/Button";
import { EmptyView } from "../ui/EmptyView";
import { LoadingView } from "../ui/LoadingView";
import { PlaceRow } from "../ui/PlaceRow";
import { Screen } from "../ui/Screen";
import { List } from "../ui/List";

type PlacesNav = NativeStackNavigationProp<PlacesStackParamList, "PlacesList">;

export function PlacesScreen() {
  const navigation = useNavigation<PlacesNav>();
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const apiQueryOptions = useMobileApiQueryOptions();
  const meQuery = useMeQuery(apiQueryOptions);
  const placesQuery = usePlacesQuery(apiQueryOptions);

  const places = useMemo(
    () =>
      (placesQuery.data?.data ??
        []) as Array<{
          id: string;
          ownerId: string;
          name: string;
          address: string;
          headlineImageUrl?: string | null;
          lat?: number;
          lng?: number;
        }>,
    [placesQuery.data]
  );
  const userId = meQuery.data?.data?.id ?? null;
  const loading = meQuery.isLoading || placesQuery.isLoading;
  const error = meQuery.isError || placesQuery.isError ? "Nie udało się pobrać miejsc." : null;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([meQuery.refetch(), placesQuery.refetch()]);
    setRefreshing(false);
  }, [meQuery, placesQuery]);

  const myPlaces = userId ? places.filter((place) => place.ownerId === userId) : [];
  const friendPlaces = userId ? places.filter((place) => place.ownerId !== userId) : [];

  return (
    <Screen
      title="Miejsca"
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
      <List title="Kolegów">
        {loading ? (
          <LoadingView />
        ) : friendPlaces.length === 0 ? (
          <EmptyView message="Brak miejsc od kolegów." />
        ) : (
          friendPlaces.map((place, index) => (
            <PlaceRow
              key={place.id}
              onPress={() => navigation.navigate("PlaceDetail", { placeId: place.id, name: place.name })}
              badgeLabel="Kolega"
              name={place.name}
              address={place.address}
              imageUrl={place.headlineImageUrl}
              isLastRow={index === friendPlaces.length - 1}
            />
          ))
        )}
      </List>

      <List
        title="Moje"
        right={
          <IconButton
            accessibilityLabel="Dodaj miejsce"
            icon={<Text style={styles.iconButtonText}>+</Text>}
            onPress={() => navigation.navigate("AddPlace")}
          />
        }
      >
        {loading ? (
          <LoadingView />
        ) : myPlaces.length === 0 ? (
          <EmptyView message="Nie masz jeszcze żadnego miejsca.">
            <Button
              label="Dodaj miejsce"
              style={styles.inlineButton}
              onPress={() => navigation.navigate("AddPlace")}
            />
          </EmptyView>
        ) : (
          myPlaces.map((place, index) => (
            <PlaceRow
              key={place.id}
              onPress={() => navigation.navigate("PlaceDetail", { placeId: place.id, name: place.name })}
              badgeLabel="Ty"
              name={place.name}
              address={place.address}
              imageUrl={place.headlineImageUrl}
              isLastRow={index === myPlaces.length - 1}
            />
          ))
        )}
      </List>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  iconButtonText: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "600",
    color: theme.colors.text
  },
  inlineButton: {
    alignSelf: "flex-start",
    marginTop: 12
  },
  error: {
    color: theme.colors.error
  }
  });
