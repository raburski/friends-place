import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PlacesStackParamList } from "../navigation/PlacesStack";
import { useSession } from "../auth/useSession";
import { apiGet, apiPost } from "../api/client";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDate } from "../utils/date";

export type PlaceDetailProps = NativeStackScreenProps<PlacesStackParamList, "PlaceDetail">;

export function PlaceDetailScreen({ route }: PlaceDetailProps) {
  const { session } = useSession();
  const { placeId, name } = route.params;
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [availability, setAvailability] = useState<Array<{ id: string; startDate: string; endDate: string }>>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [ownerMode, setOwnerMode] = useState(false);
  const [newRangeStart, setNewRangeStart] = useState(new Date());
  const [newRangeEnd, setNewRangeEnd] = useState(new Date());

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
      <Pressable
        style={[styles.button, styles.secondaryButton]}
        onPress={() => setOwnerMode((current) => !current)}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          {ownerMode ? "Ukryj zarządzanie dostępnością" : "Dodaj dostępność (właściciel)"}
        </Text>
      </Pressable>
      {ownerMode ? (
        <View style={styles.ownerPanel}>
          <Text style={styles.sectionTitle}>Nowy zakres</Text>
          <View style={styles.pickerRow}>
            <Text style={styles.label}>Start</Text>
            <DateTimePicker
              value={newRangeStart}
              mode="date"
              onChange={(_, date) => date && setNewRangeStart(date)}
            />
          </View>
          <View style={styles.pickerRow}>
            <Text style={styles.label}>Koniec</Text>
            <DateTimePicker
              value={newRangeEnd}
              mode="date"
              onChange={(_, date) => date && setNewRangeEnd(date)}
            />
          </View>
          <Pressable
            style={styles.button}
            onPress={async () => {
              if (!session) {
                setStatus("Brak sesji.");
                return;
              }
              try {
                await apiPost("/api/availability", session.token, {
                  placeId,
                  ranges: [
                    {
                      startDate: newRangeStart.toISOString(),
                      endDate: newRangeEnd.toISOString()
                    }
                  ]
                });
                setStatus("Dostępność dodana.");
                const payload = await apiGet<{
                  ok: boolean;
                  data: Array<{ id: string; startDate: string; endDate: string }>;
                }>(`/api/availability/place/${placeId}`, session.token);
                setAvailability(payload.data ?? []);
              } catch {
                setStatus("Nie udało się dodać dostępności.");
              }
            }}
          >
            <Text style={styles.buttonText}>Zapisz dostępność</Text>
          </Pressable>
        </View>
      ) : null}
      <Text style={styles.sectionTitle}>Dostępność</Text>
      {availability.length === 0 ? (
        <Text style={styles.subtitle}>Brak terminów.</Text>
      ) : (
        availability.map((range) => (
          <Text key={range.id} style={styles.rangeText}>
            {formatDate(range.startDate)} → {formatDate(range.endDate)}
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
  secondaryButton: {
    marginTop: 12,
    backgroundColor: "#f3e9d2"
  },
  secondaryButtonText: {
    color: "#7c5a00"
  },
  ownerPanel: {
    width: "100%",
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12
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
