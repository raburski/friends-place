import { useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { type Theme, useTheme } from "../theme";

type EmptyViewProps = {
  message?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function EmptyView({ message, children, style, textStyle }: EmptyViewProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, style]}>
      {message ? <Text style={[styles.text, textStyle]}>{message}</Text> : null}
      {children}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 8
    },
    text: {
      fontSize: 14,
      color: theme.colors.muted
    }
  });
