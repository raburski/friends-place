import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useSession } from "../auth/useSession";

export function AuthScreen() {
  const { setSessionData } = useSession();
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zaloguj się</Text>
      <Text style={styles.subtitle}>
        Użyj logowania przez przeglądarkę, aby połączyć konto.
      </Text>
      <View style={styles.webviewWrapper}>
        <WebView
          source={{ uri: `${apiBase}/api/auth/signin?callbackUrl=${apiBase}/auth/mobile` }}
          onMessage={async (event) => {
            try {
              const payload = JSON.parse(event.nativeEvent.data);
              if (payload?.token && payload?.expiresAt) {
                await setSessionData(payload);
              }
            } catch {
              setError("Nie udało się odebrać tokenu.");
            }
          }}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f4ee",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1b1b1b"
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#4b4b4b"
  },
  webviewWrapper: {
    height: 420,
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginTop: 16
  },
  error: {
    color: "#b91c1c",
    marginTop: 12
  }
});
