import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";

const lightTheme = {
  mode: "light",
  colors: {
    bg: "#f7f4ee",
    surface: "#fff9f0",
    surfaceAlt: "#fffdf6",
    border: "#c3beb5",
    text: "#1b1b1b",
    muted: "#4b4b4b",
    primary: "#2c7a7b",
    primarySoft: "rgba(44, 122, 123, 0.16)",
    accent: "#d97706",
    accentSoft: "rgba(217, 119, 6, 0.16)",
    error: "#b91c1c",
    errorSoft: "rgba(185, 28, 28, 0.12)",
    mutedSoft: "rgba(75, 75, 75, 0.12)",
    scrim: "rgba(0, 0, 0, 0.4)"
  },
  radius: {
    card: 12,
    sheet: 16,
    pill: 999
  },
  shadow: {
    soft: {
      shadowColor: "#2c7a7b",
      shadowOpacity: 0.15,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6
    }
  }
} as const;

const darkTheme = {
  mode: "dark",
  colors: {
    bg: "#14120f",
    surface: "#1d1b17",
    surfaceAlt: "#23211c",
    border: "#3b342c",
    text: "#f4f1ea",
    muted: "#c1b8aa",
    primary: "#4fb5b6",
    primarySoft: "rgba(79, 181, 182, 0.22)",
    accent: "#f2a33b",
    accentSoft: "rgba(242, 163, 59, 0.22)",
    error: "#f87171",
    errorSoft: "rgba(248, 113, 113, 0.22)",
    mutedSoft: "rgba(193, 184, 170, 0.18)",
    scrim: "rgba(0, 0, 0, 0.6)"
  },
  radius: {
    card: 12,
    sheet: 16,
    pill: 999
  },
  shadow: {
    soft: {
      shadowColor: "#000000",
      shadowOpacity: 0.35,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8
    }
  }
} as const;

export type Theme = typeof lightTheme;
export type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (value: ThemePreference) => void;
};

const THEME_PREFERENCE_KEY = "themePreference";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const isThemePreference = (value: string): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [storageReady, setStorageReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    SecureStore.isAvailableAsync()
      .then((available) => {
        if (!active) return;
        setStorageAvailable(available);
        setStorageReady(true);
        if (!available) return null;
        return SecureStore.getItemAsync(THEME_PREFERENCE_KEY);
      })
      .then((stored) => {
        if (!active || !stored) return;
        if (isThemePreference(stored)) {
          setPreferenceState(stored);
        }
      })
      .catch(() => {
        if (!active) return;
        setStorageReady(true);
        setStorageAvailable(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!storageReady || !storageAvailable) {
      return;
    }
    SecureStore.setItemAsync(THEME_PREFERENCE_KEY, preference).catch(() => null);
  }, [preference, storageReady, storageAvailable]);

  const resolvedScheme = preference === "system" ? systemScheme ?? "light" : preference;
  const theme = useMemo(() => (resolvedScheme === "dark" ? darkTheme : lightTheme), [resolvedScheme]);

  const setPreference = useCallback((value: ThemePreference) => {
    setPreferenceState(value);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context.theme;
}

export function useThemePreference() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemePreference must be used within ThemeProvider");
  }
  return { preference: context.preference, setPreference: context.setPreference };
}
