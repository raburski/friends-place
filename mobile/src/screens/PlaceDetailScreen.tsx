import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PlacesStackParamList } from "../navigation/PlacesStack";
import { useSession } from "../auth/useSession";
import { apiGet, apiPost, apiPatch, apiPut, ApiError } from "../api/client";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDate } from "../utils/date";
import { AvailabilityRange, findMatchingRange } from "../utils/availability";
import { theme } from "../theme";
import { useToast } from "../ui/ToastProvider";

export type PlaceDetailProps = NativeStackScreenProps<PlacesStackParamList, "PlaceDetail">;

export function PlaceDetailScreen({ route }: PlaceDetailProps) {
  const { session } = useSession();
  const { placeId, name } = route.params;
  const toast = useToast();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityRange[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [rules, setRules] = useState("");
  const [guides, setGuides] = useState<Record<string, string>>({});
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
      .catch(() => toast("Nie udało się pobrać danych miejsca.", { kind: "error" }));
  }, [session, placeId]);

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{name}</Text>
        </View>
        {isOwner ? null : (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Złóż prośbę o pobyt</Text>
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
                  toast("Brak sesji.", { kind: "error" });
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
                  toast("Prośba wysłana.", { kind: "success" });
                } catch {
                  toast("Nie udało się wysłać prośby.", { kind: "error" });
                }
              }}
            >
              <Text style={styles.buttonText}>Wyślij prośbę</Text>
            </Pressable>
            {availabilityHint ? <Text style={styles.warning}>{availabilityHint}</Text> : null}
          </View>
        )}
        {isOwner ? (
          <View style={styles.sectionCard}>
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
                      toast("Brak sesji.", { kind: "error" });
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
                      toast("Dostępność dodana.", { kind: "success" });
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
                        toast("Wykryto konflikt.", { kind: "error" });
                        return;
                      }
                      toast("Nie udało się dodać dostępności.", { kind: "error" });
                    }
                  }}
                >
                  <Text style={styles.buttonText}>Zapisz dostępność</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Dostępność</Text>
          {availability.length === 0 ? (
            <Text style={styles.muted}>Brak terminów.</Text>
          ) : (
            availability.map((range) => (
              <View key={range.id} style={styles.rangeRow}>
                <Text style={styles.rangeText}>
                  {formatDate(range.startDate)} → {formatDate(range.endDate)}
                </Text>
                <View style={styles.rangeActions}>
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
                          toast("Nie udało się usunąć terminu.", { kind: "error" });
                          return;
                        }
                        setAvailability((current) => current.filter((item) => item.id !== range.id));
                      }}
                    >
                      <Text style={styles.deleteButtonText}>Usuń</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>
        <View style={styles.sectionCard}>
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
                    toast("Zasady zapisane.", { kind: "success" });
                  } catch {
                    toast("Nie udało się zapisać zasad.", { kind: "error" });
                  }
                }}
              >
                <Text style={styles.buttonText}>Zapisz zasady</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.muted}>{rules || "Brak zasad."}</Text>
          )}
        </View>
        <View style={styles.sectionCard}>
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
                <Text style={styles.muted}>{guides[item.key] ?? "Brak informacji."}</Text>
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
                  toast("Przewodnik zapisany.", { kind: "success" });
                } catch {
                  toast("Nie udało się zapisać przewodnika.", { kind: "error" });
                }
              }}
            >
              <Text style={styles.buttonText}>Zapisz przewodnik</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
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
                    toast("Dostępność dodana.", { kind: "success" });
                    setConfirmVisible(false);
                    setNeedsConfirm(false);
                    const payload = await apiGet<{
                      ok: boolean;
                      data: { ranges: Array<{ id: string; startDate: string; endDate: string }>; isOwner: boolean };
                    }>(`/api/availability/place/${placeId}`, session.token);
                    setAvailability(payload.data?.ranges ?? []);
                  } catch {
                    toast("Nie udało się dodać dostępności.", { kind: "error" });
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
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 16,
    backgroundColor: theme.colors.bg
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    fontFamily: "Fraunces_600SemiBold",
    color: theme.colors.text
  },
  sectionCard: {
    padding: 16,
    borderRadius: theme.radius.sheet,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
    ...theme.shadow.soft
  },
  muted: {
    fontSize: 14,
    color: theme.colors.muted
  },
  pickerRow: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6
  },
  label: {
    fontSize: 12,
    color: theme.colors.muted
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    alignSelf: "flex-start"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600"
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  secondaryButtonText: {
    color: theme.colors.accent
  },
  ownerPanel: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    gap: 12
  },
  rulesBox: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12
  },
  rulesInput: {
    minHeight: 60,
    fontSize: 14,
    color: theme.colors.text
  },
  guideCard: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sheet,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: theme.colors.text
  },
  modalText: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 16
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    fontFamily: "Fraunces_600SemiBold"
  },
  rangeActions: {
    flexDirection: "row",
    gap: 8
  },
  rangeText: {
    fontSize: 13,
    color: theme.colors.text,
    flex: 1
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    gap: 12
  },
  useButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(44, 122, 123, 0.16)"
  },
  useButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "600"
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(185, 28, 28, 0.12)"
  },
  deleteButtonText: {
    color: theme.colors.error,
    fontSize: 12,
    fontWeight: "600"
  },
  warning: {
    color: theme.colors.accent,
    fontSize: 12
  },
});
