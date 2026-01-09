import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PlacesScreen } from "../screens/PlacesScreen";
import { PlaceDetailScreen } from "../screens/PlaceDetailScreen";

export type PlacesStackParamList = {
  PlacesList: undefined;
  PlaceDetail: { placeId: string; name: string };
};

const Stack = createNativeStackNavigator<PlacesStackParamList>();

export function PlacesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PlacesList" component={PlacesScreen} options={{ title: "Miejsca" }} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} options={{ title: "Szczegóły" }} />
    </Stack.Navigator>
  );
}
