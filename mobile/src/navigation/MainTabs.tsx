import { BottomTabBarButtonProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlacesStack } from "./PlacesStack";
import { BookingsScreen } from "../screens/BookingsScreen";
import { ProfileStack } from "./ProfileStack";
import { useNotifications } from "../notifications/NotificationsProvider";
import { CalendarBlank, House, UserCircle } from "phosphor-react-native";
import { theme } from "../theme";

export type MainTabsParamList = {
  Places: undefined;
  Bookings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  const { unreadCount } = useNotifications();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: insets.bottom,
            height: 64 + insets.bottom
          }
        ],
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarBadgeStyle: styles.tabBadge,
        tabBarButton: TabBarButton
      }}
    >
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

function TabBarButton({
  children,
  onPress,
  onLongPress,
  accessibilityState,
  style,
  ...rest
}: BottomTabBarButtonProps) {
  const scale = usePressScale();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={scale.handlePressIn}
      onPressOut={scale.handlePressOut}
      accessibilityState={accessibilityState}
      style={style}
      {...rest}
    >
      <Animated.View style={[styles.pressableInner, { transform: [{ scale: scale.value }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function usePressScale() {
  const value = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(value, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(value, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 8
    }).start();
  };
  return { value, handlePressIn, handlePressOut };
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: 10,
    height: 64,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10
  },
  tabItem: {
    paddingVertical: 4
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Fraunces_600SemiBold"
  },
  tabBadge: {
    backgroundColor: theme.colors.accent,
    color: theme.colors.surfaceAlt,
    borderColor: theme.colors.surfaceAlt,
    borderWidth: 1
  },
  pressableInner: {
    alignItems: "center",
    justifyContent: "center"
  }
});
