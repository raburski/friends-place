import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../theme";

type ToastKind = "success" | "error" | "info";

type ToastState = {
  message: string;
  kind: ToastKind;
  durationMs: number;
};

type ToastOptions = {
  kind?: ToastKind;
  durationMs?: number;
};

type ToastContextValue = (message: string, options?: ToastOptions) => void;

const ToastContext = createContext<ToastContextValue>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useMemo<ToastContextValue>(
    () => (message, options) => {
      setToast({
        message,
        kind: options?.kind ?? "info",
        durationMs: options?.durationMs ?? 2400
      });
    },
    []
  );

  useEffect(() => {
    if (!toast) {
      return;
    }
    toastAnim.setValue(0);
    Animated.spring(toastAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 12,
      stiffness: 180,
      mass: 0.6
    }).start();
    const timeout = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true
      }).start(() => setToast(null));
    }, toast.durationMs);
    return () => clearTimeout(timeout);
  }, [toast, toastAnim]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toastContainer,
            {
              top: insets.top + 12,
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-12, 0]
                  })
                },
                {
                  scale: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1]
                  })
                }
              ]
            }
          ]}
        >
          <View
            style={[
              styles.toastCard,
              toast.kind === "success"
                ? styles.toastSuccess
                : toast.kind === "error"
                  ? styles.toastError
                  : styles.toastInfo
            ]}
          >
            <Text style={[styles.toastText, toast.kind === "info" ? styles.toastTextInfo : styles.toastTextOnColor]}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center"
  },
  toastCard: {
    maxWidth: 360,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.soft
  },
  toastSuccess: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  toastError: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error
  },
  toastInfo: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border
  },
  toastText: {
    fontSize: 13,
    fontWeight: "600"
  },
  toastTextOnColor: {
    color: "#fff"
  },
  toastTextInfo: {
    color: theme.colors.text
  }
});
