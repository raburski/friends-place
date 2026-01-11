import { useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { type Theme, useTheme } from "../theme";
import { SectionCard } from "./SectionCard";

type ListProps = {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
};

export function List({
  title,
  subtitle,
  right,
  children,
  style,
  contentStyle,
  headerStyle,
  titleStyle,
  subtitleStyle
}: ListProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SectionCard style={[styles.card, style]} contentStyle={[styles.content, contentStyle]}>
      {title || subtitle || right ? (
        <View style={[styles.header, headerStyle]}>
          <View style={styles.headerText}>
            {title ? <Text style={[styles.title, titleStyle]}>{title}</Text> : null}
            {subtitle ? <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text> : null}
          </View>
          {right ? <View style={styles.headerRight}>{right}</View> : null}
        </View>
      ) : null}
      {children}
    </SectionCard>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: 0,
      paddingTop: 4,
      gap: 0
    },
    content: {
      gap: 0,
      borderRadius: theme.radius.sheet,
      overflow: "hidden"
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 10
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
      fontSize: 13,
      color: theme.colors.muted
    }
  });
