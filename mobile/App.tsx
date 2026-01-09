import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.badge}>Domy Kolegów</Text>
      <Text style={styles.title}>Od kolegów dla kolegów.</Text>
      <Text style={styles.subtitle}>
        Prywatne miejsca na wspólne wyjazdy, bez spiny.
      </Text>
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
  }
});
