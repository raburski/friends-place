import { useMemo, useRef, useState } from "react";
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
import { type Theme, useTheme } from "../theme";

export function ProfileSetupScreen() {
  const { session } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const handleInputRef = useRef<TextInput>(null);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!session) {
    return null;
  }

  const saveProfile = async () => {
    if (saving) {
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await updateProfile(session.token, { displayName, handle, locale: "pl" });
      await fetchMobileProfile(session.token);
    } catch {
      setError("Nie udało się zapisać profilu.");
    } finally {
      setSaving(false);
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
              placeholderTextColor={theme.colors.muted}
              value={displayName}
              onChangeText={setDisplayName}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => handleInputRef.current?.focus()}
              editable={!saving}
            />
            <TextInput
              ref={handleInputRef}
              style={styles.input}
              placeholder="handle (np. marek_krk)"
              placeholderTextColor={theme.colors.muted}
              value={handle}
              onChangeText={setHandle}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={saveProfile}
              editable={!saving}
            />
            <Pressable
              style={[styles.button, saving ? styles.buttonDisabled : null]}
              onPress={saveProfile}
              disabled={saving}
            >
              <Text style={styles.buttonText}>{saving ? "Zapisywanie..." : "Zapisz profil"}</Text>
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg
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
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.soft
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Fraunces_600SemiBold",
    marginBottom: 8,
    color: theme.colors.text
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: theme.colors.muted,
    marginBottom: 8
  },
  input: {
    width: "100%",
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 12,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  button: {
    marginTop: 18,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600"
  },
  error: {
    color: theme.colors.error,
    marginTop: 12,
    textAlign: "center"
  }
  });
