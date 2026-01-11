"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type ModalSize = "sm" | "md" | "lg";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
};

const CLOSE_ANIMATION_MS = 180;

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true
}: ModalProps) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const handleClose = useCallback(() => {
    if (isClosing) {
      return;
    }
    onClose();
  }, [isClosing, onClose]);

  useEffect(() => {
    if (isOpen) {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setIsRendered(true);
      setIsClosing(false);
      return;
    }
    if (!isRendered) {
      return;
    }
    setIsClosing(true);
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
      closeTimeoutRef.current = null;
    }, CLOSE_ANIMATION_MS);
  }, [isOpen, isRendered]);

  useEffect(() => {
    if (!isRendered) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRendered, handleClose]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  if (!isRendered) {
    return null;
  }

  return (
    <div
      className={`modal-backdrop modal-backdrop--animated ${isClosing ? "is-closing" : ""}`}
      onClick={handleClose}
      role="presentation"
    >
      <div
        className={`modal-card modal-card--${size} modal-card--animated ${isClosing ? "is-closing" : ""}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {(title || showCloseButton) ? (
          <div className="modal-header">
            {title ? <h2 className="section-title">{title}</h2> : <span />}
            {showCloseButton ? (
              <button
                type="button"
                className="icon-button"
                onClick={handleClose}
                aria-label="Zamknij"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6l-12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
