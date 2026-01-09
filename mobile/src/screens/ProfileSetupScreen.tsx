import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useSession } from "../auth/useSession";
import { updateProfile, fetchMobileProfile } from "../auth/api";

export function ProfileSetupScreen() {
  const { session } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!session) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Uzupełnij profil</Text>
      <Text style={styles.subtitle}>
        Podaj nazwę i handle, aby korzystać z aplikacji.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Imię / nazwa"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        placeholder="handle (np. marek_krk)"
        value={handle}
        onChangeText={setHandle}
        autoCapitalize="none"
      />
      <Pressable
        style={styles.button}
        onPress={async () => {
          setError(null);
          try {
            await updateProfile(session.token, { displayName, handle, locale: "pl" });
            await fetchMobileProfile(session.token);
          } catch {
            setError("Nie udało się zapisać profilu.");
          }
        }}
      >
        <Text style={styles.buttonText}>Zapisz profil</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1b1b1b"
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#4b4b4b"
  },
  input: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12
  },
  button: {
    marginTop: 16,
    backgroundColor: "#2c7a7b",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600"
  },
  error: {
    color: "#b91c1c",
    marginTop: 12
  }
});
