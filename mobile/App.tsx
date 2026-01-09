import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Pressable, TextInput } from "react-native";
import { useState } from "react";
import { WebView } from "react-native-webview";
import { useSession } from "./src/auth/useSession";
import { fetchMobileProfile, updateProfile } from "./src/auth/api";

export default function App() {
  const { session, exchange, refresh, revoke, setSessionData } = useSession();
  const [profileComplete, setProfileComplete] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  const ensureProfile = async (token: string) => {
    try {
      const response = await fetchMobileProfile(token);
      const complete = Boolean(response?.data?.profileComplete);
      setProfileComplete(complete);
    } catch (err) {
      setError("Nie udało się pobrać profilu.");
    }
  };

  if (!session) {
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
                  await ensureProfile(payload.token);
                }
              } catch {
                setError("Nie udało się odebrać tokenu.");
              }
            }}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!profileComplete) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Uzupełnij profil</Text>
        <Text style={styles.subtitle}>
          Podaj nazwę i handle, aby korzystać z aplikacji.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Imię / nazwa"
          value={displayName}
          onChangeText={setDisplayName}
        />
        <TextInput
          style={styles.input}
          placeholder="handle (np. marek_krk)"
          value={handle}
          onChangeText={setHandle}
          autoCapitalize="none"
        />
        <Pressable
          style={styles.button}
          onPress={async () => {
            setError(null);
            try {
              await updateProfile(session.token, { displayName, handle, locale: "pl" });
              await ensureProfile(session.token);
            } catch {
              setError("Nie udało się zapisać profilu.");
            }
          }}
        >
          <Text style={styles.buttonText}>Zapisz profil</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>Domy Kolegów</Text>
      <Text style={styles.title}>Od kolegów dla kolegów.</Text>
      <Text style={styles.subtitle}>
        Prywatne miejsca na wspólne wyjazdy, bez spiny.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sesja mobilna</Text>
        <Text style={styles.cardText}>
          {session ? `Token: ${session.token.slice(0, 8)}…` : "Brak tokenu"}
        </Text>
        <View style={styles.buttonRow}>
          <Pressable style={styles.button} onPress={exchange}>
            <Text style={styles.buttonText}>Exchange</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={refresh}>
            <Text style={styles.buttonText}>Refresh</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={revoke}>
            <Text style={styles.buttonText}>Revoke</Text>
          </Pressable>
        </View>
      </View>
      <StatusBar style="auto" />
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
  badge: {
    backgroundColor: "rgba(44, 122, 123, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    color: "#2c7a7b",
    fontWeight: "600",
    marginBottom: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    color: "#1b1b1b"
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#4b4b4b"
  },
  card: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: 360,
    shadowColor: "#1b1b1b",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1b1b1b"
  },
  cardText: {
    fontSize: 14,
    marginBottom: 12,
    color: "#4b4b4b"
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  button: {
    backgroundColor: "#2c7a7b",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600"
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
  input: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12
  },
  error: {
    color: "#b91c1c",
    marginTop: 12
  }
});
