import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { useSession } from "../auth/useSession";
import { updateProfile, fetchMobileProfile } from "../auth/api";

export function ProfileSetupScreen() {
  const { session } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const handleInputRef = useRef<TextInput>(null);

  if (!session) {
    return null;
  }

  const saveProfile = async () => {
    setError(null);
    try {
      await updateProfile(session.token, { displayName, handle, locale: "pl" });
      await fetchMobileProfile(session.token);
    } catch {
      setError("Nie udało się zapisać profilu.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Uzupełnij profil</Text>
            <Text style={styles.subtitle}>
              Podaj nazwę i handle, aby korzystać z aplikacji.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Imię / nazwa"
              value={displayName}
              onChangeText={setDisplayName}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => handleInputRef.current?.focus()}
            />
            <TextInput
              ref={handleInputRef}
              style={styles.input}
              placeholder="handle (np. marek_krk)"
              value={handle}
              onChangeText={setHandle}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={saveProfile}
            />
            <Pressable style={styles.button} onPress={saveProfile}>
              <Text style={styles.buttonText}>Zapisz profil</Text>
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f4ee"
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Fraunces_600SemiBold",
    marginBottom: 8,
    color: "#1b1b1b"
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#4b4b4b",
    marginBottom: 8
  },
  input: {
    width: "100%",
    backgroundColor: "#f7f4ee",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 12
  },
  button: {
    marginTop: 18,
    backgroundColor: "#2c7a7b",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600"
  },
  error: {
    color: "#b91c1c",
    marginTop: 12,
    textAlign: "center"
  }
});
