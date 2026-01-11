import { useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { type Theme, useTheme } from "../theme";

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
};

export function SectionCard({
  title,
  subtitle,
  right,
  children,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle
}: SectionCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.card, style]}>
      {title || subtitle || right ? (
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            {title ? <Text style={[styles.title, titleStyle]}>{title}</Text> : null}
            {subtitle ? <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text> : null}
          </View>
          {right ? <View style={styles.headerRight}>{right}</View> : null}
        </View>
      ) : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: 16,
      borderRadius: theme.radius.sheet,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
      ...theme.shadow.soft
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    },
    headerText: {
      flex: 1,
      gap: 4
    },
    headerRight: {
      alignItems: "center",
      justifyContent: "center"
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Fraunces_600SemiBold"
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.muted
    },
    content: {
      gap: 12
    }
  });
