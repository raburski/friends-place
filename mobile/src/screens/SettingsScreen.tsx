import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import { useSession } from "../auth/useSession";
import { type Theme, type ThemePreference, useTheme, useThemePreference } from "../theme";
import { Button } from "../ui/Button";
import { Screen } from "../ui/Screen";
import { SectionCard } from "../ui/SectionCard";

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
    <Screen withHeader contentStyle={styles.screenContent}>
      <SectionCard title="Wygląd" contentStyle={styles.sectionContent}>
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
      </SectionCard>
      <SectionCard title="Konto" subtitle="Zarządzaj swoim kontem i sesją." contentStyle={styles.sectionContent}>
        <Button label="Wyloguj" style={styles.inlineButton} onPress={revoke} />
      </SectionCard>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  screenContent: {
    paddingTop: 12
  },
  sectionContent: {
    gap: 8
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
  inlineButton: {
    alignSelf: "flex-start",
    marginTop: 4
  }
  });
