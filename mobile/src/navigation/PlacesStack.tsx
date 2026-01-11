import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useMemo } from "react";
import { PlacesScreen } from "../screens/PlacesScreen";
import { AddPlaceScreen } from "../screens/AddPlaceScreen";
import { PlaceDetailScreen } from "../screens/PlaceDetailScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { View, StyleSheet } from "react-native";
import { useNotifications } from "../notifications/NotificationsProvider";
import { type Theme, useTheme } from "../theme";
import { Button } from "../ui/Button";

export type PlacesStackParamList = {
  PlacesList: undefined;
  PlaceDetail: { placeId: string; name: string };
  AddPlace: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<PlacesStackParamList>();

export function PlacesStack() {
  const { unreadCount } = useNotifications();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const screenOptions = useMemo(
    () => ({
      headerStyle: styles.header,
      headerTintColor: theme.colors.text,
      headerTitleStyle: styles.headerTitle,
      headerShadowVisible: false,
      headerBackTitleVisible: false
    }),
    [styles, theme]
  );
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="PlacesList"
        component={PlacesScreen}
        options={({ navigation }) => ({
          headerShown: false,
          title: "Miejsca",
          headerRight: () => (
            <View style={styles.headerActions}>
              <Button
                label="Dodaj"
                size="xs"
                variant="ghost"
                textStyle={styles.headerActionText}
                onPress={() => navigation.navigate("AddPlace")}
              />
              <Button
                label={`Powiadomienia${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                size="xs"
                variant="ghost"
                textStyle={styles.headerActionText}
                onPress={() => navigation.navigate("Notifications")}
              />
            </View>
          )
        })}
      />
      <Stack.Screen name="AddPlace" component={AddPlaceScreen} options={{ title: "Dodaj miejsce" }} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} options={{ title: "Szczegóły" }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Powiadomienia" }} />
    </Stack.Navigator>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      backgroundColor: theme.colors.surface
    },
    headerTitle: {
      fontFamily: "Fraunces_600SemiBold",
      fontWeight: "600",
      color: theme.colors.text
    },
    headerActions: {
      flexDirection: "row",
      gap: 12
    },
    headerActionText: {
      color: theme.colors.primary,
      fontWeight: "600"
    }
  });
