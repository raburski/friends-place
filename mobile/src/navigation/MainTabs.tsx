import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { PlacesStack } from "./PlacesStack";
import { BookingsScreen } from "../screens/BookingsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

export type MainTabsParamList = {
  Places: undefined;
  Bookings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Places" component={PlacesStack} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
