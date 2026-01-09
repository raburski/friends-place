import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSession } from "../auth/useSession";
import { apiPost } from "../api/client";
import type { PlacesStackParamList } from "../navigation/PlacesStack";

type PlacesNav = NativeStackNavigationProp<PlacesStackParamList, "AddPlace">;

type PlacePayload = {
  id: string;
  name: string;
};

export function AddPlaceScreen() {
  const navigation = useNavigation<PlacesNav>();
  const { session } = useSession();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) {
    return null;
  }

  const canSubmit = name.trim().length > 0 && address.trim().length > 0 && !saving;

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
          setSaving(true);
          setError(null);
          try {
            const payload = await apiPost<{ ok: boolean; data: PlacePayload }>(
              "/api/places",
              session.token,
              { name, address }
            );
            navigation.replace("PlaceDetail", { placeId: payload.data.id, name: payload.data.name });
          } catch {
            setError("Nie udało się dodać miejsca.");
          } finally {
            setSaving(false);
          }
        }}
      >
        <Text style={styles.buttonText}>{saving ? "Zapisywanie..." : "Dodaj miejsce"}</Text>
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
