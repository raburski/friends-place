import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";
import { useSession } from "../auth/useSession";
import { API_BASE_URL } from "../config";
import { type Theme, useTheme } from "../theme";
import { Button } from "../ui/Button";

export function AuthScreen() {
  const { setSessionData } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const apiBase = API_BASE_URL;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Domy Kolegów</Text>
      <Text style={styles.subtitle}>
        Użyj logowania przez przeglądarkę, aby połączyć konto.
      </Text>
      <Button label="Zaloguj się" style={styles.authButton} onPress={() => setShowWebView(true)} />
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Fraunces_600SemiBold",
    marginBottom: 8,
    color: theme.colors.text
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: theme.colors.muted
  },
  authButton: {
    marginTop: 16
  },
  error: {
    color: theme.colors.error,
    marginTop: 12
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  modalHeader: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Fraunces_600SemiBold",
    color: theme.colors.text
  },
  modalClose: {
    color: theme.colors.primary,
    fontWeight: "600"
  }
  });
