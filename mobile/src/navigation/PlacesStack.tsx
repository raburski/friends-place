import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PlacesScreen } from "../screens/PlacesScreen";
import { PlaceDetailScreen } from "../screens/PlaceDetailScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { Pressable, Text } from "react-native";
import { useNotifications } from "../notifications/NotificationsProvider";

export type PlacesStackParamList = {
  PlacesList: undefined;
  PlaceDetail: { placeId: string; name: string };
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
          title: "Miejsca",
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate("Notifications")}>
              <Text>
                Powiadomienia{unreadCount > 0 ? ` (${unreadCount})` : ""}
              </Text>
            </Pressable>
          )
        })}
      />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} options={{ title: "Szczegóły" }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Powiadomienia" }} />
    </Stack.Navigator>
  );
}
