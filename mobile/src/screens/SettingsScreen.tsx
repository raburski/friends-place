import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import { useSession } from "../auth/useSession";
import { type Theme, type ThemePreference, useTheme, useThemePreference } from "../theme";

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: "system", label: "System" },
  { value: "light", label: "Jasny" },
  { value: "dark", label: "Ciemny" }
];

export function SettingsScreen() {
  const { revoke } = useSession();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { preference, setPreference } = useThemePreference();

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Wygląd</Text>
          <View style={styles.themeOptions}>
            {THEME_OPTIONS.map((option) => {
              const selected = preference === option.value;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.themeOption, selected && styles.themeOptionActive]}
                  onPress={() => setPreference(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.themeOptionText, selected && styles.themeOptionTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Konto</Text>
          <Text style={styles.muted}>Zarządzaj swoim kontem i sesją.</Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={revoke}>
          <Text style={styles.primaryButtonText}>Wyloguj</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 16,
    backgroundColor: theme.colors.bg
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
  themeOptions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  themeOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  themeOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text
  },
  themeOptionTextActive: {
    color: "#fff"
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.muted
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
