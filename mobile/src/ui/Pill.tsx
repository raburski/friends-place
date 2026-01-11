import { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { type Theme, useTheme } from "../theme";

export type PillTone = "primary" | "accent" | "muted" | "danger";

type PillProps = {
  label: string;
  tone?: PillTone;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const resolvePillColors = (theme: Theme, tone: PillTone) => {
  switch (tone) {
    case "accent":
      return { background: theme.colors.accentSoft, text: theme.colors.accent };
    case "danger":
      return { background: theme.colors.errorSoft, text: theme.colors.error };
    case "muted":
      return { background: theme.colors.mutedSoft, text: theme.colors.muted };
    default:
      return { background: theme.colors.primarySoft, text: theme.colors.primary };
  }
};

export function Pill({ label, tone = "primary", style, textStyle }: PillProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const colors = resolvePillColors(theme, tone);

  return (
    <View style={[styles.base, { backgroundColor: colors.background }, style]}>
      <Text style={[styles.text, { color: colors.text }, textStyle]}>{label}</Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      alignSelf: "flex-start",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: theme.radius.pill
    },
    text: {
      fontSize: 12,
      fontWeight: "600"
    }
  });
