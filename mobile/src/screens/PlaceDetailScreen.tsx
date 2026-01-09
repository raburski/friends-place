import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PlacesStackParamList } from "../navigation/PlacesStack";
import { useSession } from "../auth/useSession";
import { apiGet, apiPost } from "../api/client";
import DateTimePicker from "@react-native-community/datetimepicker";

export type PlaceDetailProps = NativeStackScreenProps<PlacesStackParamList, "PlaceDetail">;

export function PlaceDetailScreen({ route }: PlaceDetailProps) {
  const { session } = useSession();
  const { placeId, name } = route.params;
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [availability, setAvailability] = useState<Array<{ id: string; startDate: string; endDate: string }>>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }
    apiGet<{ ok: boolean; data: Array<{ id: string; startDate: string; endDate: string }> }>(
      `/api/availability/place/${placeId}`,
      session.token
    )
      .then((payload) => setAvailability(payload.data ?? []))
      .catch(() => setStatus("Nie udało się pobrać dostępności."));
  }, [session, placeId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.subtitle}>Złóż prośbę o pobyt</Text>
      <View style={styles.pickerRow}>
        <Text style={styles.label}>Przyjazd</Text>
        <DateTimePicker value={startDate} mode="date" onChange={(_, date) => date && setStartDate(date)} />
      </View>
      <View style={styles.pickerRow}>
        <Text style={styles.label}>Wyjazd</Text>
        <DateTimePicker value={endDate} mode="date" onChange={(_, date) => date && setEndDate(date)} />
      </View>
      <Pressable
        style={styles.button}
        onPress={async () => {
          if (!session) {
            setStatus("Brak sesji.");
            return;
          }
          try {
            await apiPost("/api/bookings", session.token, {
              placeId,
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            });
            setStatus("Prośba wysłana.");
          } catch {
            setStatus("Nie udało się wysłać prośby.");
          }
        }}
      >
        <Text style={styles.buttonText}>Wyślij prośbę</Text>
      </Pressable>
      <Text style={styles.sectionTitle}>Dostępność</Text>
      {availability.length === 0 ? (
        <Text style={styles.subtitle}>Brak terminów.</Text>
      ) : (
        availability.map((range) => (
          <Text key={range.id} style={styles.rangeText}>
            {range.startDate} → {range.endDate}
          </Text>
        ))
      )}
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f7f4ee"
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: "#4b4b4b",
    marginBottom: 16
  },
  pickerRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  label: {
    fontSize: 12,
    color: "#4b4b4b",
    marginBottom: 6
  },
  button: {
    backgroundColor: "#2c7a7b",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600"
  },
  status: {
    marginTop: 12,
    color: "#4b4b4b"
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8
  },
  rangeText: {
    fontSize: 12,
    color: "#4b4b4b",
    marginBottom: 4
  }
});
