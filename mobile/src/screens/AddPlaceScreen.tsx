import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { PlacesStackParamList } from "../navigation/PlacesStack";
import { useMobileApiOptions } from "../api/useMobileApiOptions";
import { useCreatePlaceMutation } from "../../../shared/query/hooks/useMutations";

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
  const apiOptions = useMobileApiOptions();
  const createMutation = useCreatePlaceMutation(apiOptions);

  const canSubmit = name.trim().length > 0 && address.trim().length > 0 && !createMutation.isLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dodaj miejsce</Text>
      <Text style={styles.subtitle}>Podaj nazwę i adres.</Text>
      <TextInput
        style={styles.input}
        placeholder="Nazwa miejsca"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Adres"
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
          {createMutation.isLoading ? "Zapisywanie..." : "Dodaj miejsce"}
        </Text>
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
    padding: 24,
    gap: 12
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Fraunces_600SemiBold",
    marginBottom: 4,
    color: "#1b1b1b"
  },
  subtitle: {
    fontSize: 14,
    color: "#4b4b4b",
    marginBottom: 8
  },
  input: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  button: {
    marginTop: 8,
    backgroundColor: "#2c7a7b",
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
    color: "#b91c1c",
    marginTop: 8
  }
});
