import { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle
} from "react-native";
import { type Theme, useTheme } from "../theme";

type LoadingViewProps = {
  message?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function LoadingView({ message = "Ładowanie...", style, textStyle }: LoadingViewProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
      <Text style={[styles.text, textStyle]}>{message}</Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    },
    text: {
      fontSize: 14,
      color: theme.colors.muted
    }
  });
