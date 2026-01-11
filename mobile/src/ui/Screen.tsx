import { useMemo, type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { type Theme, useTheme } from "../theme";

type ScreenProps = {
  children: ReactNode;
  title?: string;
  right?: ReactNode;
  scroll?: boolean;
  withHeader?: boolean;
  edges?: Edge[];
  safeAreaStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  scrollProps?: Omit<ScrollViewProps, "contentContainerStyle">;
};

export function Screen({
  children,
  title,
  right,
  scroll = true,
  withHeader = false,
  edges = ["top"],
  safeAreaStyle,
  contentStyle,
  headerStyle,
  titleStyle,
  scrollProps
}: ScreenProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const content = scroll ? (
    <ScrollView contentContainerStyle={[styles.container, contentStyle]} {...scrollProps}>
      {title ? (
        <View style={[styles.headerRow, headerStyle]}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {right ? <View style={styles.headerRight}>{right}</View> : null}
        </View>
      ) : null}
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, contentStyle]}>
      {title ? (
        <View style={[styles.headerRow, headerStyle]}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {right ? <View style={styles.headerRight}>{right}</View> : null}
        </View>
      ) : null}
      {children}
    </View>
  );

  const resolvedEdges = withHeader ? edges.filter((edge) => edge !== "top") : edges;

  return (
    <SafeAreaView style={[styles.safeArea, safeAreaStyle]} edges={resolvedEdges}>
      {content}
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.bg
    },
    container: {
      flex: 1,
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingBottom: 24,
      paddingTop: 0,
      gap: 16,
      backgroundColor: theme.colors.bg
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    },
    headerRight: {
      alignItems: "center",
      justifyContent: "center"
    },
    title: {
      fontSize: 32,
      fontWeight: "600",
      fontFamily: "Fraunces_600SemiBold",
      color: theme.colors.text
    }
  });
