import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PlacesScreen } from "../screens/PlacesScreen";
import { AddPlaceScreen } from "../screens/AddPlaceScreen";
import { PlaceDetailScreen } from "../screens/PlaceDetailScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { Pressable, Text, View } from "react-native";
import { useNotifications } from "../notifications/NotificationsProvider";

export type PlacesStackParamList = {
  PlacesList: undefined;
  PlaceDetail: { placeId: string; name: string };
  AddPlace: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<PlacesStackParamList>();

export function PlacesStack() {
  const { unreadCount } = useNotifications();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PlacesList"
        component={PlacesScreen}
        options={({ navigation }) => ({
          headerShown: false,
          title: "Miejsca",
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={() => navigation.navigate("AddPlace")}>
                <Text>Dodaj</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate("Notifications")}>
                <Text>Powiadomienia{unreadCount > 0 ? ` (${unreadCount})` : ""}</Text>
              </Pressable>
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
