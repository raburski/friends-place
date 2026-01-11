import { useMemo, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle
} from "react-native";
import { useTheme, type Theme } from "../theme";

type ButtonVariant = "primary" | "secondary" | "soft" | "danger" | "ghost";
type ButtonSize = "md" | "sm" | "xs";
type IconPosition = "start" | "end";

export type ButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: IconPosition;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

const resolveTextColor = (theme: Theme, variant: ButtonVariant) => {
  switch (variant) {
    case "primary":
      return "#fff";
    case "secondary":
      return theme.colors.accent;
    case "soft":
      return theme.colors.primary;
    case "danger":
      return theme.colors.error;
    case "ghost":
      return theme.colors.primary;
    default:
      return theme.colors.text;
  }
};

export function Button({
  label,
  loading = false,
  loadingLabel,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "start",
  disabled,
  style,
  textStyle,
  contentStyle,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDisabled = Boolean(disabled || loading);
  const textColor = resolveTextColor(theme, variant);
  const buttonLabel = loading && loadingLabel ? loadingLabel : label;
  const showLabel = buttonLabel.length > 0;
  const iconNode = loading ? <ActivityIndicator size="small" color={textColor} /> : icon;

  const sizeStyle = size === "xs" ? styles.sizeXs : size === "sm" ? styles.sizeSm : styles.sizeMd;
  const textSizeStyle = size === "xs" ? styles.textXs : size === "sm" ? styles.textSm : styles.textMd;
  const variantStyle =
    variant === "secondary"
      ? styles.variantSecondary
      : variant === "soft"
        ? styles.variantSoft
        : variant === "danger"
          ? styles.variantDanger
          : variant === "ghost"
            ? styles.variantGhost
            : styles.variantPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyle,
        variantStyle,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style
      ]}
      {...props}
    >
      <View style={[styles.content, contentStyle]}>
        {iconNode && iconPosition === "start" ? <View style={styles.iconSlot}>{iconNode}</View> : null}
        {showLabel ? (
          <Text style={[textSizeStyle, { color: textColor }, textStyle]}>{buttonLabel}</Text>
        ) : null}
        {iconNode && iconPosition === "end" ? <View style={styles.iconSlot}>{iconNode}</View> : null}
      </View>
    </Pressable>
  );
}

export type IconButtonProps = Omit<ButtonProps, "label" | "loadingLabel" | "iconPosition"> & {
  icon: ReactNode;
  accessibilityLabel: string;
  size?: ButtonSize;
};

export function IconButton({
  icon,
  accessibilityLabel,
  loading = false,
  variant = "secondary",
  size = "sm",
  disabled,
  style,
  ...props
}: IconButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDisabled = Boolean(disabled || loading);
  const textColor = resolveTextColor(theme, variant);
  const iconNode = loading ? <ActivityIndicator size="small" color={textColor} /> : icon;

  const sizeStyle = size === "xs" ? styles.iconSizeXs : size === "md" ? styles.iconSizeMd : styles.iconSizeSm;
  const variantStyle =
    variant === "secondary"
      ? styles.variantSecondary
      : variant === "soft"
        ? styles.variantSoft
        : variant === "danger"
          ? styles.variantDanger
          : variant === "ghost"
            ? styles.variantGhost
            : styles.variantPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.iconButton,
        sizeStyle,
        variantStyle,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style
      ]}
      {...props}
    >
      {iconNode}
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: "transparent",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center"
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    },
    iconSlot: {
      alignItems: "center",
      justifyContent: "center"
    },
    sizeMd: {
      paddingVertical: 10,
      paddingHorizontal: 16
    },
    sizeSm: {
      paddingVertical: 6,
      paddingHorizontal: 10
    },
    sizeXs: {
      paddingVertical: 4,
      paddingHorizontal: 8
    },
    textMd: {
      fontSize: 14,
      fontWeight: "600",
      flexShrink: 1
    },
    textSm: {
      fontSize: 12,
      fontWeight: "600",
      flexShrink: 1
    },
    textXs: {
      fontSize: 12,
      fontWeight: "600",
      flexShrink: 1
    },
    variantPrimary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    variantSecondary: {
      backgroundColor: theme.colors.surfaceAlt,
      borderColor: theme.colors.border
    },
    variantSoft: {
      backgroundColor: theme.colors.primarySoft,
      borderColor: "transparent"
    },
    variantDanger: {
      backgroundColor: theme.colors.errorSoft,
      borderColor: "transparent"
    },
    variantGhost: {
      backgroundColor: "transparent",
      borderColor: "transparent"
    },
    pressed: {
      opacity: 0.85
    },
    disabled: {
      opacity: 0.6
    },
    iconButton: {
      borderRadius: 999,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center"
    },
    iconSizeMd: {
      width: 36,
      height: 36
    },
    iconSizeSm: {
      width: 28,
      height: 28
    },
    iconSizeXs: {
      width: 24,
      height: 24
    }
  });
