import { View, Text, StyleSheet } from "react-native";

export function PlacesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Places</Text>
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
    fontWeight: "600"
  }
});
