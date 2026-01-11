import { useMemo, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { type Theme, useTheme } from "../theme";

export type ListRowProps = Pick<
  PressableProps,
  "onPress" | "disabled" | "accessibilityRole" | "accessibilityLabel" | "accessibilityState"
> & {
  children: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  showDivider?: boolean;
  isLastRow?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  leftStyle?: StyleProp<ViewStyle>;
  rightStyle?: StyleProp<ViewStyle>;
  dividerStyle?: StyleProp<ViewStyle>;
};

export function ListRow({
  children,
  left,
  right,
  showDivider,
  isLastRow,
  style,
  contentStyle,
  leftStyle,
  rightStyle,
  dividerStyle,
  onPress,
  disabled,
  accessibilityRole,
  accessibilityLabel,
  accessibilityState
}: ListRowProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const shouldShowDivider =
    showDivider ?? (isLastRow === undefined ? true : !isLastRow);
  const wrapperStyle = [styles.rowWrapper, isLastRow && styles.rowWrapperLast];
  const isDisabled = disabled || !onPress;


  return (
    <View style={style}>
      <View style={wrapperStyle}>
        <Pressable
          style={({ pressed }) => [
            styles.row,
            contentStyle,
            pressed && !isDisabled && styles.rowPressed
          ]}
          onPress={onPress}
          disabled={isDisabled}
          accessibilityRole={accessibilityRole}
          accessibilityLabel={accessibilityLabel}
          accessibilityState={accessibilityState}
        >
          {left ? <View style={[styles.rowLeft, leftStyle]}>{left}</View> : null}
          <View style={styles.rowMain}>{children}</View>
          {right ? <View style={[styles.rowRight, rightStyle]}>{right}</View> : null}
        </Pressable>
        {shouldShowDivider ? <View style={[styles.divider, dividerStyle]} /> : null}
      </View>
    </View>
  );
}

ListRow.displayName = "ListRow";
(ListRow as typeof ListRow & { isListRow?: boolean }).isListRow = true;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    rowWrapper: {
      paddingHorizontal: 4
    },
    rowWrapperLast: {
      marginBottom: 4
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      overflow: "hidden"
    },
    rowLeft: {
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center"
    },
    rowMain: {
      flex: 1,
      minWidth: 0,
      justifyContent: "center",
    },
    rowRight: {
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center"
    },
    rowPressed: {
      backgroundColor: theme.mode === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.06)",
      borderRadius: theme.radius.sheet
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginHorizontal: 14
    }
  });
