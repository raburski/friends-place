import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCallback, useMemo } from "react";
import * as Notifications from "expo-notifications";
import { useSession } from "../auth/useSession";
import { type Theme, type ThemePreference, useTheme, useThemePreference } from "../theme";
import { Button } from "../ui/Button";
import { Pill } from "../ui/Pill";
import { Screen } from "../ui/Screen";
import { SectionCard } from "../ui/SectionCard";
import { useNotificationPermissions } from "../notifications/useNotificationPermissions";
import { usePushTokenRegistration } from "../notifications/usePushTokenRegistration";

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
  const {
    loading: notificationsLoading,
    requesting: notificationsRequesting,
    enabled: notificationsEnabled,
    canAskAgain: notificationsCanAskAgain,
    status: notificationStatus,
    requestPermission,
    openSettings
  } = useNotificationPermissions();
  const { register, loading: pushTokenLoading } = usePushTokenRegistration();

  const notificationStatusLabel = notificationsLoading
    ? "Sprawdzanie..."
    : notificationsEnabled
      ? "Włączone"
      : notificationStatus === Notifications.PermissionStatus.UNDETERMINED
        ? "Nieustawione"
      : "Wyłączone";

  const notificationStatusTone = notificationsLoading
    ? "muted"
    : notificationsEnabled
      ? "primary"
      : notificationStatus === Notifications.PermissionStatus.DENIED
        ? "danger"
        : "muted";

  const notificationDescription = notificationsEnabled
    ? "Powiadomienia push są aktywne."
    : notificationStatus === Notifications.PermissionStatus.UNDETERMINED
      ? "Nie prosiliśmy jeszcze o zgodę na powiadomienia."
      : "Powiadomienia są wyłączone w ustawieniach systemu.";

  const notificationActionLabel = notificationsCanAskAgain ? "Włącz powiadomienia" : "Otwórz ustawienia";
  const notificationActionLoading = notificationsRequesting || pushTokenLoading;

  const handleNotificationAction = useCallback(async () => {
    if (notificationsLoading || notificationsEnabled) {
      return;
    }

    if (!notificationsCanAskAgain) {
      openSettings().catch(() => null);
      return;
    }

    const permissions = await requestPermission();
    const enabled =
      permissions?.granted ||
      permissions?.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    if (enabled) {
      await register();
    }
  }, [
    notificationsCanAskAgain,
    notificationsEnabled,
    notificationsLoading,
    openSettings,
    register,
    requestPermission
  ]);

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
      <SectionCard
        title="Powiadomienia"
        subtitle="Informacje o rezerwacjach i ważnych zmianach."
        right={<Pill label={notificationStatusLabel} tone={notificationStatusTone} />}
        contentStyle={styles.sectionContent}
      >
        <Text style={styles.notificationsDescription}>{notificationDescription}</Text>
        {!notificationsLoading && !notificationsEnabled ? (
          <Button
            label={notificationActionLabel}
            size="sm"
            loading={notificationActionLoading}
            loadingLabel="Włączanie..."
            style={styles.notificationsAction}
            onPress={handleNotificationAction}
          />
        ) : null}
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
  },
  notificationsDescription: {
    fontSize: 14,
    color: theme.colors.muted
  },
  notificationsAction: {
    alignSelf: "flex-start"
  }
  });
