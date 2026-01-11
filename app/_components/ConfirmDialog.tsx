"use client";

import { type ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  confirmLoading?: boolean;
  confirmLoadingLabel?: string;
  confirmDisabled?: boolean;
  confirmVariant?: "primary" | "secondary";
  confirmIcon?: ReactNode;
  cancelIcon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = "Anuluj",
  confirmLoading = false,
  confirmLoadingLabel,
  confirmDisabled = false,
  confirmVariant = "primary",
  confirmIcon,
  cancelIcon,
  onConfirm,
  onCancel,
  children
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm" showCloseButton={false}>
      {children ?? (description ? <p className="muted">{description}</p> : null)}
      <div className="action-bar">
        <Button variant="secondary" onClick={onCancel} icon={cancelIcon} disabled={confirmLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={confirmVariant === "secondary" ? "secondary" : "primary"}
          onClick={onConfirm}
          icon={confirmIcon}
          loading={confirmLoading}
          loadingLabel={confirmLoadingLabel}
          disabled={confirmDisabled}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
