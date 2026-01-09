import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileScreen } from "../screens/ProfileScreen";
import { FriendsScreen } from "../screens/FriendsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Friends: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator>
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
