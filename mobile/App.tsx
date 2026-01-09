import { StatusBar } from "expo-status-bar";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useSession } from "./src/auth/useSession";
import { NotificationsProvider } from "./src/notifications/NotificationsProvider";

export default function App() {
  useSession();

  return (
    <NotificationsProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </NotificationsProvider>
  );
}
