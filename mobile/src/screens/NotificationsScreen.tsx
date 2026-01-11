import { StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import { useNotifications } from "../notifications/NotificationsProvider";
import { formatDate } from "../utils/date";
import { notificationLabels } from "../notifications/labels";
import { type Theme, useTheme } from "../theme";
import { Button } from "../ui/Button";
import { Screen } from "../ui/Screen";
import { List } from "../ui/List";
import { ListRow } from "../ui/ListRow";

export function NotificationsScreen() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Screen withHeader title="Powiadomienia" contentStyle={styles.screenContent}>
      {unreadCount > 0 ? (
        <Button
          label="Oznacz jako przeczytane"
          size="sm"
          style={styles.inlineButton}
          onPress={markAllRead}
        />
      ) : null}
      {notifications.length === 0 ? (
        <Text style={styles.subtitle}>Brak powiadomień.</Text>
      ) : (
        <List>
          {notifications.map((item, index) => (
            <ListRow
              key={item.id}
              style={item.readAt ? styles.rowRead : null}
              isLastRow={index === notifications.length - 1}
            >
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>
                  {notificationLabels[item.type] ?? item.type}
                </Text>
                <Text style={styles.rowSubtitle}>
                  {buildSubtitle(item.payload) ?? formatDate(item.createdAt)}
                </Text>
              </View>
            </ListRow>
          ))}
        </List>
      )}
    </Screen>
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
  screenContent: {
    gap: 12,
    paddingTop: 12
  },
  subtitle: {
    color: theme.colors.muted
  },
  rowRead: {
    opacity: 0.6
  },
  rowContent: {
    gap: 4
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text
  },
  rowSubtitle: {
    fontSize: 12,
    color: theme.colors.muted
  },
  inlineButton: {
    alignSelf: "flex-start"
  }
  });
