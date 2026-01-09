import { StatusBar } from "expo-status-bar";
import { Text, TextInput } from "react-native";
import { useEffect } from "react";
import { useFonts as useSoraFonts, Sora_400Regular, Sora_600SemiBold } from "@expo-google-fonts/sora";
import { useFonts as useFrauncesFonts, Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { SessionProvider } from "./src/auth/useSession";
import { NotificationsProvider } from "./src/notifications/NotificationsProvider";

export default function App() {
  const [soraLoaded] = useSoraFonts({
    Sora_400Regular,
    Sora_600SemiBold
  });
  const [frauncesLoaded] = useFrauncesFonts({
    Fraunces_600SemiBold
  });

  useEffect(() => {
    if (!soraLoaded || !frauncesLoaded) {
      return;
    }
    Text.defaultProps = Text.defaultProps ?? {};
    Text.defaultProps.style = [{ fontFamily: "Sora_400Regular" }, Text.defaultProps.style];
    TextInput.defaultProps = TextInput.defaultProps ?? {};
    TextInput.defaultProps.style = [{ fontFamily: "Sora_400Regular" }, TextInput.defaultProps.style];
  }, [soraLoaded, frauncesLoaded]);

  if (!soraLoaded || !frauncesLoaded) {
    return null;
  }

  return (
    <SessionProvider>
      <NotificationsProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </NotificationsProvider>
    </SessionProvider>
  );
}
