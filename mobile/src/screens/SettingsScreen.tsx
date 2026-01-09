import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../auth/useSession";
import { theme } from "../theme";

export function SettingsScreen() {
  const { revoke } = useSession();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Ustawienia</Text>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Konto</Text>
          <Text style={styles.muted}>Zarządzaj swoim kontem i sesją.</Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={revoke}>
          <Text style={styles.primaryButtonText}>Wyloguj</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 0,
    gap: 16,
    backgroundColor: theme.colors.bg
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    fontFamily: "Fraunces_600SemiBold",
    color: theme.colors.text
  },
  sectionCard: {
    padding: 16,
    borderRadius: theme.radius.sheet,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
    ...theme.shadow.soft
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    fontFamily: "Fraunces_600SemiBold"
  },
  muted: {
    fontSize: 14,
    color: theme.colors.muted
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    alignSelf: "flex-start",
    ...theme.shadow.soft
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600"
  }
});
