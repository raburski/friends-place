import { StatusBar } from "expo-status-bar";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useSession } from "./src/auth/useSession";

export default function App() {
  useSession();

  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}
