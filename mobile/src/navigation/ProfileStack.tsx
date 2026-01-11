import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ProfileScreen } from "../screens/ProfileScreen";
import { FriendsScreen } from "../screens/FriendsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { type Theme, useTheme } from "../theme";

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Friends: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
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
        name="ProfileHome"
        component={ProfileScreen}
        options={{ headerShown: false, title: "Profil" }}
      />
      <Stack.Screen name="Friends" component={FriendsScreen} options={{ title: "Koledzy" }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Ustawienia" }} />
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
    }
  });
