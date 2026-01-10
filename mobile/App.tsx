import { StatusBar } from "expo-status-bar";
import { Text, TextInput } from "react-native";
import { useEffect } from "react";
import { useFonts as useSoraFonts, Sora_400Regular, Sora_600SemiBold } from "@expo-google-fonts/sora";
import { useFonts as useFrauncesFonts, Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { SessionProvider } from "./src/auth/useSession";
import { NotificationsProvider } from "./src/notifications/NotificationsProvider";
import { ToastProvider } from "./src/ui/ToastProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryProvider } from "./src/api/QueryProvider";

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
    const TextWithDefaults = Text as typeof Text & { defaultProps?: { style?: unknown } };
    const TextInputWithDefaults = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };

    TextWithDefaults.defaultProps = TextWithDefaults.defaultProps ?? {};
    TextWithDefaults.defaultProps.style = [
      { fontFamily: "Sora_400Regular" },
      TextWithDefaults.defaultProps.style
    ];

    TextInputWithDefaults.defaultProps = TextInputWithDefaults.defaultProps ?? {};
    TextInputWithDefaults.defaultProps.style = [
      { fontFamily: "Sora_400Regular" },
      TextInputWithDefaults.defaultProps.style
    ];
  }, [soraLoaded, frauncesLoaded]);

  if (!soraLoaded || !frauncesLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <SessionProvider>
          <NotificationsProvider>
            <ToastProvider>
              <RootNavigator />
              <StatusBar style="auto" />
            </ToastProvider>
          </NotificationsProvider>
        </SessionProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
