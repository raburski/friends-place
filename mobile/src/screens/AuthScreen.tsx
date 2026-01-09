import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";
import { useSession } from "../auth/useSession";

export function AuthScreen() {
  const { setSessionData } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);

  const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Domy Kolegów</Text>
      <Text style={styles.subtitle}>
        Użyj logowania przez przeglądarkę, aby połączyć konto.
      </Text>
      <Pressable style={styles.button} onPress={() => setShowWebView(true)}>
        <Text style={styles.buttonText}>Zaloguj się</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Modal visible={showWebView} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Logowanie</Text>
            <Pressable onPress={() => setShowWebView(false)}>
              <Text style={styles.modalClose}>Zamknij</Text>
            </Pressable>
          </View>
          <WebView
            source={{ uri: `${apiBase}/api/auth/signin?callbackUrl=${apiBase}/auth/mobile` }}
            onMessage={async (event) => {
              try {
                const payload = JSON.parse(event.nativeEvent.data);
                if (payload?.token && payload?.expiresAt) {
                  await setSessionData(payload);
                  setShowWebView(false);
                }
              } catch {
                setError("Nie udało się odebrać tokenu.");
              }
            }}
          />
        </SafeAreaView>
      </Modal>
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
    fontFamily: "Fraunces_600SemiBold",
    marginBottom: 8,
    color: "#1b1b1b"
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#4b4b4b"
  },
  button: {
    marginTop: 16,
    backgroundColor: "#2c7a7b",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600"
  },
  error: {
    color: "#b91c1c",
    marginTop: 12
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff"
  },
  modalHeader: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e0d5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Fraunces_600SemiBold"
  },
  modalClose: {
    color: "#2c7a7b",
    fontWeight: "600"
  }
});
