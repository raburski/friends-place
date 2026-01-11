"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "../../_components/Button";
import { SectionCard } from "../../_components/SectionCard";
import { ConfirmDialog } from "../../_components/ConfirmDialog";
import { ScreenLayout } from "../../_components/ScreenLayout";

type ThemeMode = "auto" | "light" | "dark";

export default function SettingsPage() {
  const [mode, setMode] = useState<ThemeMode>("auto");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const stored = readThemeCookie();
    const nextMode = stored ?? "auto";
    setMode(nextMode);
    applyTheme(nextMode);
  }, []);

  const onChange = (next: ThemeMode) => {
    setMode(next);
    setThemeCookie(next);
    applyTheme(next);
  };

  return (
    <ScreenLayout title="Ustawienia">
      <SectionCard title="Motyw">
        <div className="theme-toggle">
          {(["auto", "light", "dark"] as ThemeMode[]).map((value) => (
            <Button
              key={value}
              className={mode === value ? "theme-toggle__button theme-toggle__button--active" : "theme-toggle__button"}
              onClick={() => onChange(value)}
            >
              {labelFor(value)}
            </Button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Konto" subtitle="Zakończ bieżącą sesję na tym urządzeniu.">
        <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
          Wyloguj
        </Button>
      </SectionCard>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Wylogować?"
        description="Twoja sesja zostanie zakończona na tym urządzeniu."
        confirmLabel="Wyloguj"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => signOut({ callbackUrl: "/" })}
      />
    </ScreenLayout>
  );
}

function labelFor(mode: ThemeMode) {
  switch (mode) {
    case "light":
      return "Jasny";
    case "dark":
      return "Ciemny";
    default:
      return "Automatyczny";
  }
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "auto") {
    root.removeAttribute("data-theme");
    return;
  }
  root.setAttribute("data-theme", mode);
}

function readThemeCookie(): ThemeMode | null {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("theme_mode="));
  if (!match) {
    return null;
  }
  const value = decodeURIComponent(match.split("=")[1] ?? "");
  if (value === "light" || value === "dark" || value === "auto") {
    return value;
  }
  return null;
}

function setThemeCookie(mode: ThemeMode) {
  if (mode === "auto") {
    document.cookie = "theme_mode=; path=/; max-age=0";
    return;
  }
  document.cookie = `theme_mode=${mode}; path=/; max-age=31536000; samesite=lax`;
}
