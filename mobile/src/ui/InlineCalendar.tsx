import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { type Theme, useTheme } from "../theme";
import { availabilityColors } from "../../../shared/theme/availabilityColors";

export type CalendarRange = { startDate: string; endDate: string };

type InlineCalendarProps = {
  availability?: CalendarRange[];
  selectedStart: Date | null;
  selectedEnd: Date | null;
  onSelectDay: (date: Date) => void;
  monthsToShow?: number;
  minDate?: Date;
  isDateDisabled?: (date: Date) => boolean;
};

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const isBeforeDay = (left: Date, right: Date) => dayStart(left).getTime() < dayStart(right).getTime();

const isBetweenInclusive = (day: Date, start: Date, end: Date) => {
  const value = dayStart(day).getTime();
  return value >= dayStart(start).getTime() && value <= dayStart(end).getTime();
};

const addMonths = (base: Date, offset: number) => new Date(base.getFullYear(), base.getMonth() + offset, 1);

const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const getMonthLabel = (date: Date) =>
  date.toLocaleDateString("pl-PL", {
    month: "long",
    year: "numeric"
  });

const getMonthMatrix = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const totalDays = getDaysInMonth(firstOfMonth);
  const slots: Array<Date | null> = [];

  for (let i = 0; i < startOffset; i += 1) {
    slots.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    slots.push(new Date(year, month, day));
  }

  return slots;
};

const isDayAvailable = (day: Date, availability?: CalendarRange[]) => {
  if (!availability || availability.length === 0) return false;
  return availability.some((range) => {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    return isBetweenInclusive(day, start, end);
  });
};

export function InlineCalendar({
  availability,
  selectedStart,
  selectedEnd,
  onSelectDay,
  monthsToShow = 1,
  minDate,
  isDateDisabled
}: InlineCalendarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const today = dayStart(new Date());
  const minDay = minDate ? dayStart(minDate) : today;
  const [monthOffset, setMonthOffset] = useState(0);
  const months = Array.from({ length: monthsToShow }, (_, index) => addMonths(today, monthOffset + index));

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.legendAvailable]} />
          <Text style={styles.legendLabel}>Dostępne dni</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.legendRange]} />
          <Text style={styles.legendLabel}>Wybrany zakres</Text>
        </View>
      </View>
      {months.map((month) => (
        <View key={`${month.getFullYear()}-${month.getMonth()}`} style={styles.monthCard}>
          <View style={styles.monthHeader}>
            <Pressable style={styles.navButton} onPress={() => setMonthOffset((current) => current - 1)}>
              <Text style={styles.navButtonText}>←</Text>
            </Pressable>
            <Text style={styles.monthLabel}>{getMonthLabel(month)}</Text>
            <Pressable style={styles.navButton} onPress={() => setMonthOffset((current) => current + 1)}>
              <Text style={styles.navButtonText}>→</Text>
            </Pressable>
          </View>
          <View style={styles.weekdays}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {getMonthMatrix(month).map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={styles.emptyCell} />;
              }

              const available = isDayAvailable(day, availability);
              const disabled = isBeforeDay(day, minDay) || (isDateDisabled ? isDateDisabled(day) : false);
              const isStart = selectedStart ? isSameDay(day, selectedStart) : false;
              const isEnd = selectedEnd ? isSameDay(day, selectedEnd) : false;
              const inRange =
                selectedStart && selectedEnd ? isBetweenInclusive(day, selectedStart, selectedEnd) : false;
              const isToday = isSameDay(day, today);

              const dayStyles: Array<StyleProp<ViewStyle>> = [styles.dayCell];
              const textStyles: Array<StyleProp<TextStyle>> = [styles.dayText];

              if (available) dayStyles.push(styles.dayAvailable);
              if (available) textStyles.push(styles.dayAvailableText);
              if (inRange) dayStyles.push(styles.dayRange);
              if (inRange) textStyles.push(styles.dayRangeText);
              if (isStart || isEnd) {
                dayStyles.push(styles.daySelected);
                textStyles.push(styles.daySelectedText);
              }
              if (disabled) {
                dayStyles.push(styles.dayDisabled);
                textStyles.push(styles.dayDisabledText);
              }
              if (isToday) dayStyles.push(styles.dayToday);

              return (
                <Pressable
                  key={day.toISOString()}
                  style={dayStyles}
                  onPress={() => {
                    if (disabled) return;
                    onSelectDay(day);
                  }}
                >
                  <Text style={textStyles}>{day.getDate()}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  container: {
    gap: 12
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface
  },
  navButtonText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: "600"
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  legendAvailable: {
    backgroundColor: availabilityColors.available
  },
  legendRange: {
    backgroundColor: availabilityColors.range
  },
  legendLabel: {
    fontSize: 12,
    color: theme.colors.muted
  },
  monthCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    gap: 8
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    textTransform: "capitalize",
    flex: 1,
    textAlign: "center"
  },
  weekdays: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  weekdayText: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 11,
    color: theme.colors.muted
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 6
  },
  emptyCell: {
    width: "14.28%",
    height: 32
  },
  dayCell: {
    width: "14.28%",
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12
  },
  dayText: {
    fontSize: 13,
    color: theme.colors.text
  },
  dayAvailable: {
    backgroundColor: availabilityColors.available
  },
  dayAvailableText: {
    color: "#fff",
    fontWeight: "600"
  },
  dayRange: {
    backgroundColor: availabilityColors.range
  },
  dayRangeText: {
    color: "#fff",
    fontWeight: "600"
  },
  daySelected: {
    backgroundColor: theme.colors.primary
  },
  daySelectedText: {
    color: "#fff",
    fontWeight: "600"
  },
  dayDisabled: {
    opacity: 0.45
  },
  dayDisabledText: {
    color: theme.colors.muted
  },
  dayToday: {
    borderWidth: 1,
    borderColor: theme.colors.accent
  }
  });
