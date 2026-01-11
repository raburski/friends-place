import { useMemo } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { type Theme, useTheme } from "../theme";

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmLoading?: boolean;
  confirmLoadingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = "Anuluj",
  confirmLoading = false,
  confirmLoadingLabel,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
          <View style={styles.actions}>
            <Button
              label={cancelLabel}
              variant="secondary"
              onPress={onCancel}
              disabled={confirmLoading}
            />
            <Button
              label={confirmLabel}
              loading={confirmLoading}
              loadingLabel={confirmLoadingLabel}
              onPress={onConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.scrim,
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    },
    card: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.sheet,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text
    },
    description: {
      fontSize: 14,
      color: theme.colors.muted
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12
    }
  });
