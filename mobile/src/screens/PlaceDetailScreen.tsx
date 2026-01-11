import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PlacesStackParamList } from "../navigation/PlacesStack";
import { useSession } from "../auth/useSession";
import { ApiError } from "../api/client";
import { formatDate } from "../utils/date";
import { AvailabilityRange, findMatchingRange } from "../utils/availability";
import { theme } from "../theme";
import { InlineCalendar } from "../ui/InlineCalendar";
import { useToast } from "../ui/ToastProvider";
import { useMobileApiOptions, useMobileApiQueryOptions } from "../api/useMobileApiOptions";
import {
  useAvailabilityQuery,
  useGuidesQuery,
  usePlaceQuery
} from "../../../shared/query/hooks/useQueries";
import {
  useAddAvailabilityMutation,
  useDeleteAvailabilityMutation,
  useRequestBookingMutation,
  useUpdateGuidesMutation,
  useUpdateRulesMutation
} from "../../../shared/query/hooks/useMutations";

export type PlaceDetailProps = NativeStackScreenProps<PlacesStackParamList, "PlaceDetail">;

const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const isBeforeDay = (left: Date, right: Date) => dayStart(left).getTime() < dayStart(right).getTime();

const isAfterDay = (left: Date, right: Date) => dayStart(left).getTime() > dayStart(right).getTime();

const formatDateLabel = (date: Date | null) =>
  date
    ? date.toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "—";

const isDayAvailable = (day: Date, ranges: AvailabilityRange[]) => {
  return ranges.some((range) => {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    return dayStart(day).getTime() >= dayStart(start).getTime() && dayStart(day).getTime() <= dayStart(end).getTime();
  });
};

export function PlaceDetailScreen({ route }: PlaceDetailProps) {
  const { session } = useSession();
  const { placeId, name } = route.params;
  const toast = useToast();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [availability, setAvailability] = useState<AvailabilityRange[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [rules, setRules] = useState("");
  const [guides, setGuides] = useState<Record<string, string>>({});
  const [availabilityHint, setAvailabilityHint] = useState<string | null>(null);
  const [ownerMode, setOwnerMode] = useState(false);
  const [newRangeStart, setNewRangeStart] = useState<Date | null>(null);
  const [newRangeEnd, setNewRangeEnd] = useState<Date | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const apiOptions = useMobileApiOptions();
  const apiQueryOptions = useMobileApiQueryOptions();
  const availabilityQuery = useAvailabilityQuery(placeId, apiQueryOptions);
  const placeQuery = usePlaceQuery(placeId, apiQueryOptions);
  const guidesQuery = useGuidesQuery(placeId, apiQueryOptions);

  useEffect(() => {
    if (availabilityQuery.data?.data) {
      setAvailability(availabilityQuery.data.data.ranges ?? []);
      setIsOwner(Boolean(availabilityQuery.data.data.isOwner));
    }
  }, [availabilityQuery.data]);

  useEffect(() => {
    if (placeQuery.data?.data) {
      setRules(placeQuery.data.data.rules ?? "");
    }
  }, [placeQuery.data]);

  useEffect(() => {
    setGuides(guidesQuery.guidesMap);
  }, [guidesQuery.guidesMap]);

  useEffect(() => {
    if (availabilityQuery.isError || placeQuery.isError || guidesQuery.isError) {
      toast("Nie udało się pobrać danych miejsca.", { kind: "error" });
    }
  }, [availabilityQuery.isError, placeQuery.isError, guidesQuery.isError, toast]);

  const bookingMutation = useRequestBookingMutation(apiOptions);
  const addAvailabilityMutation = useAddAvailabilityMutation(apiOptions);
  const deleteAvailabilityMutation = useDeleteAvailabilityMutation(apiOptions);
  const rulesMutation = useUpdateRulesMutation(apiOptions);
  const guidesMutation = useUpdateGuidesMutation(apiOptions);
  const today = dayStart(new Date());

  const handleBookingSelect = (date: Date) => {
    setAvailabilityHint(null);
    if (!startDate || endDate) {
      setStartDate(date);
      setEndDate(null);
      return;
    }
    if (startDate && !endDate) {
      if (isSameDay(date, startDate) || isBeforeDay(date, startDate)) {
        setStartDate(date);
        setEndDate(null);
        return;
      }
      if (!findMatchingRange(startDate, date, availability)) {
        setAvailabilityHint("Wybrany termin nie mieści się w dostępności.");
        return;
      }
      setEndDate(date);
    }
  };

  const handleOwnerSelect = (date: Date) => {
    if (!newRangeStart || newRangeEnd) {
      setNewRangeStart(date);
      setNewRangeEnd(null);
      return;
    }
    if (newRangeStart && !newRangeEnd) {
      if (isSameDay(date, newRangeStart) || isBeforeDay(date, newRangeStart)) {
        setNewRangeStart(date);
        setNewRangeEnd(null);
        return;
      }
      setNewRangeEnd(date);
    }
  };

  const canRequestBooking = startDate && endDate ? isAfterDay(endDate, startDate) : false;
  const canSaveAvailability =
    newRangeStart && newRangeEnd ? isAfterDay(newRangeEnd, newRangeStart) : false;

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{name}</Text>
        </View>
        {isOwner ? null : (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Złóż prośbę o pobyt</Text>
            <InlineCalendar
              availability={availability}
              selectedStart={startDate}
              selectedEnd={endDate}
              minDate={today}
              isDateDisabled={(date) => !isDayAvailable(date, availability)}
              onSelectDay={handleBookingSelect}
            />
            <View style={styles.selectionRow}>
              <View style={styles.selectionItem}>
                <Text style={styles.selectionLabel}>Przyjazd</Text>
                <Text style={styles.selectionValue}>{formatDateLabel(startDate)}</Text>
              </View>
              <View style={styles.selectionItem}>
                <Text style={styles.selectionLabel}>Wyjazd</Text>
                <Text style={styles.selectionValue}>{formatDateLabel(endDate)}</Text>
              </View>
            </View>
            <Pressable
              disabled={!canRequestBooking}
              style={[styles.button, !canRequestBooking && styles.buttonDisabled]}
              onPress={async () => {
                if (!session) {
                  toast("Brak sesji.", { kind: "error" });
                  return;
                }
                try {
                  if (!startDate || !endDate) {
                    setAvailabilityHint("Wybierz daty przyjazdu i wyjazdu.");
                    return;
                  }
                  if (!findMatchingRange(startDate, endDate, availability)) {
                    setAvailabilityHint("Wybrany termin nie mieści się w dostępności.");
                    return;
                  }
                  bookingMutation.mutate(
                    {
                      placeId,
                      startDate: startDate.toISOString(),
                      endDate: endDate.toISOString()
                    },
                    {
                      onSuccess: () => toast("Prośba wysłana.", { kind: "success" }),
                      onError: () => toast("Nie udało się wysłać prośby.", { kind: "error" })
                    }
                  );
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
                <InlineCalendar
                  availability={availability}
                  selectedStart={newRangeStart}
                  selectedEnd={newRangeEnd}
                  minDate={today}
                  onSelectDay={handleOwnerSelect}
                />
                <View style={styles.selectionRow}>
                  <View style={styles.selectionItem}>
                    <Text style={styles.selectionLabel}>Start</Text>
                    <Text style={styles.selectionValue}>{formatDateLabel(newRangeStart)}</Text>
                  </View>
                  <View style={styles.selectionItem}>
                    <Text style={styles.selectionLabel}>Koniec</Text>
                    <Text style={styles.selectionValue}>{formatDateLabel(newRangeEnd)}</Text>
                  </View>
                </View>
                <Pressable
                  disabled={!canSaveAvailability}
                  style={[styles.button, !canSaveAvailability && styles.buttonDisabled]}
                  onPress={async () => {
                    if (!session) {
                      toast("Brak sesji.", { kind: "error" });
                      return;
                    }
                    if (!newRangeStart || !newRangeEnd) {
                      toast("Wybierz daty dostępności.", { kind: "error" });
                      return;
                    }
                    addAvailabilityMutation.mutate(
                      {
                        placeId,
                        startDate: newRangeStart.toISOString(),
                        endDate: newRangeEnd.toISOString(),
                        confirm: needsConfirm
                      },
                      {
                        onSuccess: () => {
                          toast("Dostępność dodana.", { kind: "success" });
                          setNeedsConfirm(false);
                          setConfirmVisible(false);
                        },
                        onError: (error) => {
                          if (error instanceof ApiError && error.status === 409) {
                            setNeedsConfirm(true);
                            setConfirmVisible(true);
                            toast("Wykryto konflikt.", { kind: "error" });
                            return;
                          }
                          toast("Nie udało się dodać dostępności.", { kind: "error" });
                        }
                      }
                    );
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
                        deleteAvailabilityMutation.mutate(
                          { rangeId: range.id, placeId },
                          {
                            onError: () => toast("Nie udało się usunąć terminu.", { kind: "error" })
                          }
                        );
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
                  rulesMutation.mutate(
                    { placeId, rules },
                    {
                      onSuccess: () => toast("Zasady zapisane.", { kind: "success" }),
                      onError: () => toast("Nie udało się zapisać zasad.", { kind: "error" })
                    }
                  );
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
                guidesMutation.mutate(
                  {
                    placeId,
                    entries: GUIDE_LABELS.map((item) => ({
                      categoryKey: item.key,
                      text: guides[item.key] ?? ""
                    }))
                  },
                  {
                    onSuccess: () => toast("Przewodnik zapisany.", { kind: "success" }),
                    onError: () => toast("Nie udało się zapisać przewodnika.", { kind: "error" })
                  }
                );
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
                    if (!newRangeStart || !newRangeEnd) {
                      toast("Wybierz daty dostępności.", { kind: "error" });
                      return;
                    }
                    addAvailabilityMutation.mutate(
                      {
                        placeId,
                        startDate: newRangeStart.toISOString(),
                        endDate: newRangeEnd.toISOString(),
                      confirm: true
                    },
                    {
                      onSuccess: () => {
                        toast("Dostępność dodana.", { kind: "success" });
                        setConfirmVisible(false);
                        setNeedsConfirm(false);
                      },
                      onError: () => toast("Nie udało się dodać dostępności.", { kind: "error" })
                    }
                  );
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
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    alignSelf: "flex-start"
  },
  buttonDisabled: {
    opacity: 0.6
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
  selectionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  selectionItem: {
    gap: 4
  },
  selectionLabel: {
    fontSize: 11,
    color: theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  selectionValue: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text
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
