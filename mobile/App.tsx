import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useSession } from "./src/auth/useSession";

export default function App() {
  const { session, exchange, refresh, revoke } = useSession();

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
  }
});
