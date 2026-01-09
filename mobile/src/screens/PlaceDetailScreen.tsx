import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, TextInput } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PlacesStackParamList } from "../navigation/PlacesStack";
import { useSession } from "../auth/useSession";
import { apiGet, apiPost, apiPatch, apiPut, ApiError } from "../api/client";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDate } from "../utils/date";
import { AvailabilityRange, findMatchingRange } from "../utils/availability";

export type PlaceDetailProps = NativeStackScreenProps<PlacesStackParamList, "PlaceDetail">;

export function PlaceDetailScreen({ route }: PlaceDetailProps) {
  const { session } = useSession();
  const { placeId, name } = route.params;
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityRange[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [rules, setRules] = useState("");
  const [guides, setGuides] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [availabilityHint, setAvailabilityHint] = useState<string | null>(null);
  const [ownerMode, setOwnerMode] = useState(false);
  const [newRangeStart, setNewRangeStart] = useState(new Date());
  const [newRangeEnd, setNewRangeEnd] = useState(new Date());
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    if (!session) {
      return;
    }
    Promise.all([
      apiGet<{
        ok: boolean;
        data: { ranges: Array<{ id: string; startDate: string; endDate: string }>; isOwner: boolean };
      }>(`/api/availability/place/${placeId}`, session.token),
      apiGet<{ ok: boolean; data: { rules?: string | null } }>(`/api/places/${placeId}`, session.token),
      apiGet<{ ok: boolean; data: Array<{ categoryKey: string; text: string }> }>(
        `/api/guides/${placeId}`,
        session.token
      )
    ])
      .then(([availabilityPayload, placePayload, guidesPayload]) => {
        setAvailability(availabilityPayload.data?.ranges ?? []);
        setIsOwner(Boolean(availabilityPayload.data?.isOwner));
        setRules(placePayload.data?.rules ?? "");
        const guideMap: Record<string, string> = {};
        (guidesPayload.data ?? []).forEach((entry) => {
          guideMap[entry.categoryKey] = entry.text;
        });
        setGuides(guideMap);
      })
      .catch(() => setStatus("Nie udało się pobrać danych miejsca."));
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
            if (!findMatchingRange(startDate, endDate, availability)) {
              setAvailabilityHint("Wybrany termin nie mieści się w dostępności.");
              return;
            }
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
      {availabilityHint ? <Text style={styles.warning}>{availabilityHint}</Text> : null}
      {isOwner ? (
        <>
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
                      ],
                      confirm: needsConfirm
                    });
                    setStatus("Dostępność dodana.");
                    setNeedsConfirm(false);
                    setConfirmVisible(false);
                    const payload = await apiGet<{
                      ok: boolean;
                      data: { ranges: Array<{ id: string; startDate: string; endDate: string }>; isOwner: boolean };
                    }>(`/api/availability/place/${placeId}`, session.token);
                    setAvailability(payload.data?.ranges ?? []);
                  } catch (error) {
                    if (error instanceof ApiError && error.status === 409) {
                      setNeedsConfirm(true);
                      setConfirmVisible(true);
                      setStatus("Wykryto konflikt.");
                      return;
                    }
                    setStatus("Nie udało się dodać dostępności.");
                  }
                }}
              >
                <Text style={styles.buttonText}>Zapisz dostępność</Text>
              </Pressable>
            </View>
          ) : null}
        </>
      ) : null}
      <Text style={styles.sectionTitle}>Dostępność</Text>
      {availability.length === 0 ? (
        <Text style={styles.subtitle}>Brak terminów.</Text>
      ) : (
        availability.map((range) => (
          <View key={range.id} style={styles.rangeRow}>
            <Text style={styles.rangeText}>
              {formatDate(range.startDate)} → {formatDate(range.endDate)}
            </Text>
            {!isOwner ? (
              <Pressable
                style={styles.useButton}
                onPress={() => {
                  setStartDate(new Date(range.startDate));
                  setEndDate(new Date(range.endDate));
                  setAvailabilityHint(null);
                }}
              >
                <Text style={styles.useButtonText}>Użyj</Text>
              </Pressable>
            ) : null}
            {isOwner ? (
              <Pressable
                style={styles.deleteButton}
                onPress={async () => {
                  if (!session) return;
                  try {
                    await apiPost(`/api/availability/${range.id}/delete`, session.token);
                  } catch {
                    setStatus("Nie udało się usunąć terminu.");
                    return;
                  }
                  setAvailability((current) => current.filter((item) => item.id !== range.id));
                }}
              >
                <Text style={styles.deleteButtonText}>Usuń</Text>
              </Pressable>
            ) : null}
          </View>
        ))
      )}
      {status ? <Text style={styles.status}>{status}</Text> : null}
      <Text style={styles.sectionTitle}>Zasady domu</Text>
      {isOwner ? (
        <>
          <View style={styles.rulesBox}>
            <TextInput
              style={styles.rulesInput}
              placeholder="Dodaj zasady domu..."
              value={rules}
              onChangeText={setRules}
              multiline
            />
          </View>
          <Pressable
            style={styles.button}
            onPress={async () => {
              if (!session) return;
              try {
                await apiPatch(`/api/places/${placeId}`, session.token, { rules });
                setStatus("Zasady zapisane.");
              } catch {
                setStatus("Nie udało się zapisać zasad.");
              }
            }}
          >
            <Text style={styles.buttonText}>Zapisz zasady</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.subtitle}>{rules || "Brak zasad."}</Text>
      )}
      <Text style={styles.sectionTitle}>Przewodnik</Text>
      {GUIDE_LABELS.map((item) => (
        <View key={item.key} style={styles.guideCard}>
          <Text style={styles.guideTitle}>{item.label}</Text>
          {isOwner ? (
            <TextInput
              style={styles.rulesInput}
              placeholder="Dodaj wskazówki..."
              value={guides[item.key] ?? ""}
              onChangeText={(value) =>
                setGuides((current) => ({
                  ...current,
                  [item.key]: value
                }))
              }
              multiline
            />
          ) : (
            <Text style={styles.subtitle}>{guides[item.key] ?? "Brak informacji."}</Text>
          )}
        </View>
      ))}
      {isOwner ? (
        <Pressable
          style={styles.button}
          onPress={async () => {
            if (!session) return;
            try {
              const entries = GUIDE_LABELS.map((item) => ({
                categoryKey: item.key,
                text: guides[item.key] ?? ""
              }));
              await apiPut(`/api/guides/${placeId}`, session.token, { entries });
              setStatus("Przewodnik zapisany.");
            } catch {
              setStatus("Nie udało się zapisać przewodnika.");
            }
          }}
        >
          <Text style={styles.buttonText}>Zapisz przewodnik</Text>
        </Pressable>
      ) : null}
      <Modal transparent visible={confirmVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Konflikt dostępności</Text>
            <Text style={styles.modalText}>
              Wykryto rezerwacje w tym terminie. Dodać dostępność mimo konfliktu?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, styles.secondaryButton]}
                onPress={() => {
                  setConfirmVisible(false);
                  setNeedsConfirm(false);
                }}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Anuluj</Text>
              </Pressable>
              <Pressable
                style={styles.button}
                onPress={async () => {
                  if (!session) return;
                  try {
                    await apiPost("/api/availability", session.token, {
                      placeId,
                      ranges: [
                        {
                          startDate: newRangeStart.toISOString(),
                          endDate: newRangeEnd.toISOString()
                        }
                      ],
                      confirm: true
                    });
                    setStatus("Dostępność dodana.");
                    setConfirmVisible(false);
                    setNeedsConfirm(false);
                    const payload = await apiGet<{
                      ok: boolean;
                      data: { ranges: Array<{ id: string; startDate: string; endDate: string }>; isOwner: boolean };
                    }>(`/api/availability/place/${placeId}`, session.token);
                    setAvailability(payload.data?.ranges ?? []);
                  } catch {
                    setStatus("Nie udało się dodać dostępności.");
                  }
                }}
              >
                <Text style={styles.buttonText}>Dodaj mimo to</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const GUIDE_LABELS = [
  { key: "access", label: "Jak się dostać" },
  { key: "sleep", label: "Jak się wyspać" },
  { key: "wash", label: "Jak się umyć" },
  { key: "eat_drink", label: "Jak się najeść/napić" },
  { key: "operate", label: "Jak obsługiwać" }
];

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
  rulesBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  rulesInput: {
    minHeight: 60,
    fontSize: 14,
    color: "#1b1b1b"
  },
  guideCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8
  },
  modalText: {
    fontSize: 14,
    color: "#4b4b4b",
    marginBottom: 16
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
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
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4
  },
  useButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#dcfce7"
  },
  useButtonText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "600"
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#fee2e2"
  },
  deleteButtonText: {
    color: "#991b1b",
    fontSize: 12,
    fontWeight: "600"
  },
  warning: {
    marginTop: 8,
    color: "#b45309",
    fontSize: 12
  }
});
