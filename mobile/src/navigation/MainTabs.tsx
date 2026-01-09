import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { PlacesStack } from "./PlacesStack";
import { BookingsScreen } from "../screens/BookingsScreen";
import { ProfileStack } from "./ProfileStack";
import { useNotifications } from "../notifications/NotificationsProvider";
import { CalendarBlank, House, UserCircle } from "phosphor-react-native";

export type MainTabsParamList = {
  Places: undefined;
  Bookings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  const { unreadCount } = useNotifications();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Places"
        component={PlacesStack}
        options={{
          tabBarLabel: "Miejsca",
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <House color={color} size={size} weight={focused ? "fill" : "regular"} />
          )
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: "Rezerwacje",
          tabBarIcon: ({ color, size, focused }) => (
            <CalendarBlank color={color} size={size} weight={focused ? "fill" : "regular"} />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <UserCircle color={color} size={size} weight={focused ? "fill" : "regular"} />
          )
        }}
      />
    </Tab.Navigator>
  );
}
