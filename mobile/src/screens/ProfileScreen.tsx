import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSession } from "../auth/useSession";

export function ProfileScreen() {
  const { revoke } = useSession();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Pressable style={styles.button} onPress={revoke}>
        <Text style={styles.buttonText}>Wyloguj</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16
  },
  button: {
    backgroundColor: "#2c7a7b",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600"
  }
});
