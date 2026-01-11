import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useMemo } from "react";
import { useNotifications } from "../notifications/NotificationsProvider";
import { formatDate } from "../utils/date";
import { notificationLabels } from "../notifications/labels";
import { type Theme, useTheme } from "../theme";

export function NotificationsScreen() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Powiadomienia</Text>
      {unreadCount > 0 ? (
        <Pressable style={styles.button} onPress={markAllRead}>
          <Text style={styles.buttonText}>Oznacz jako przeczytane</Text>
        </Pressable>
      ) : null}
      {notifications.length === 0 ? (
        <Text style={styles.subtitle}>Brak powiadomień.</Text>
      ) : (
        notifications.map((item) => (
          <View key={item.id} style={[styles.card, item.readAt ? styles.cardRead : null]}>
            <Text style={styles.cardTitle}>
              {notificationLabels[item.type] ?? item.type}
            </Text>
            <Text style={styles.cardText}>
              {buildSubtitle(item.payload) ?? formatDate(item.createdAt)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function buildSubtitle(payload: Record<string, unknown>) {
  const placeName = typeof payload.placeName === "string" ? payload.placeName : null;
  const start = typeof payload.startDate === "string" ? formatDate(payload.startDate) : null;
  const end = typeof payload.endDate === "string" ? formatDate(payload.endDate) : null;

  if (placeName && start && end) {
    return `${placeName} · ${start} → ${end}`;
  }

  if (placeName) {
    return placeName;
  }

  if (start && end) {
    return `${start} → ${end}`;
  }

  return null;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: theme.colors.bg,
    gap: 12
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Fraunces_600SemiBold",
    color: theme.colors.text
  },
  subtitle: {
    color: theme.colors.muted
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12
  },
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  cardRead: {
    opacity: 0.6
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: theme.colors.text
  },
  cardText: {
    fontSize: 12,
    color: theme.colors.muted
  }
  });
