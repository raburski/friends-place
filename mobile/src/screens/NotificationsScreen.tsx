import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useNotifications } from "../notifications/NotificationsProvider";
import { formatDate } from "../utils/date";
import { notificationLabels } from "../notifications/labels";

export function NotificationsScreen() {
  const { notifications, unreadCount, markAllRead } = useNotifications();

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
            <Text style={styles.cardText}>{formatDate(item.createdAt)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#f7f4ee",
    gap: 12
  },
  title: {
    fontSize: 24,
    fontWeight: "600"
  },
  subtitle: {
    color: "#4b4b4b"
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#2c7a7b",
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
    backgroundColor: "#fff"
  },
  cardRead: {
    opacity: 0.6
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4
  },
  cardText: {
    fontSize: 12,
    color: "#4b4b4b"
  }
});
