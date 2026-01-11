import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { PlacesStackParamList } from "../navigation/PlacesStack";
import { useMobileApiOptions } from "../api/useMobileApiOptions";
import { useCreatePlaceMutation } from "../../../shared/query/hooks/useMutations";
import { type Theme, useTheme } from "../theme";

type PlacesNav = NativeStackNavigationProp<PlacesStackParamList, "AddPlace">;

type PlacePayload = {
  id: string;
  name: string;
};

export function AddPlaceScreen() {
  const navigation = useNavigation<PlacesNav>();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const apiOptions = useMobileApiOptions();
  const createMutation = useCreatePlaceMutation(apiOptions);
  const isSubmitting =
    (createMutation as { isPending?: boolean }).isPending ??
    (createMutation as { isLoading?: boolean }).isLoading ??
    false;

  const canSubmit = name.trim().length > 0 && address.trim().length > 0 && !isSubmitting;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dodaj miejsce</Text>
      <Text style={styles.subtitle}>Podaj nazwę i adres.</Text>
      <TextInput
        style={styles.input}
        placeholder="Nazwa miejsca"
        placeholderTextColor={theme.colors.muted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Adres"
        placeholderTextColor={theme.colors.muted}
        value={address}
        onChangeText={setAddress}
      />
      <Pressable
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={async () => {
          if (!canSubmit) {
            return;
          }
          setError(null);
          try {
            const payload = await createMutation.mutateAsync({ name, address });
            navigation.replace("PlaceDetail", { placeId: payload.data.id, name: payload.data.name });
          } catch {
            setError("Nie udało się dodać miejsca.");
          }
        }}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Zapisywanie..." : "Dodaj miejsce"}
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Fraunces_600SemiBold",
    marginBottom: 4,
    color: theme.colors.text
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 8
  },
  input: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  button: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600"
  },
  error: {
    color: theme.colors.error,
    marginTop: 8
  }
  });
