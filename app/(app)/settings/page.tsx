"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type ThemeMode = "auto" | "light" | "dark";

export default function SettingsPage() {
  const [mode, setMode] = useState<ThemeMode>("auto");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme_mode") as ThemeMode | null;
    if (stored) {
      setMode(stored);
      applyTheme(stored);
    } else {
      applyTheme("auto");
    }
  }, []);

  const onChange = (next: ThemeMode) => {
    setMode(next);
    window.localStorage.setItem("theme_mode", next);
    applyTheme(next);
  };

  return (
    <div>
      <h1 className="page-title">Ustawienia</h1>
      <div className="card">
        <h2 className="section-title">Motyw</h2>
        <div className="theme-toggle">
          {(["auto", "light", "dark"] as ThemeMode[]).map((value) => (
            <button
              key={value}
              className={mode === value ? "theme-toggle__button theme-toggle__button--active" : "theme-toggle__button"}
              onClick={() => onChange(value)}
            >
              {labelFor(value)}
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        <h2 className="section-title">Konto</h2>
        <p className="muted">Zakończ bieżącą sesję na tym urządzeniu.</p>
        <button type="button" className="secondary-button" onClick={() => setConfirmOpen(true)}>
          Wyloguj
        </button>
      </div>

      {confirmOpen ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2 className="section-title">Wylogować?</h2>
            <p className="muted">Twoja sesja zostanie zakończona na tym urządzeniu.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setConfirmOpen(false)}
              >
                Anuluj
              </button>
              <button type="button" onClick={() => signOut({ callbackUrl: "/" })}>
                Wyloguj
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
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
