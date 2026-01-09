"use client";

import { useEffect, useState } from "react";

type ExchangeResponse = {
  ok: boolean;
  data?: { token: string; expiresAt: string };
};

export default function MobileAuthPage() {
  const [status, setStatus] = useState("Ładowanie...");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch("/api/auth/mobile/exchange", {
          method: "POST",
          credentials: "include"
        });

        const payload = (await response.json()) as ExchangeResponse;

        if (!payload.ok || !payload.data) {
          setStatus("Nie udało się wymienić sesji.");
          return;
        }

        setToken(payload.data.token);
        setStatus("Zalogowano. Możesz wrócić do aplikacji.");

        if (typeof window !== "undefined" && "ReactNativeWebView" in window) {
          // @ts-expect-error - ReactNativeWebView is injected by WebView.
          window.ReactNativeWebView.postMessage(JSON.stringify(payload.data));
        }
      } catch {
        setStatus("Błąd połączenia.");
      }
    };

    run();
  }, []);

  return (
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1>Domy Kolegów</h1>
      <p>{status}</p>
      {token ? (
        <p style={{ fontSize: 12, opacity: 0.6 }}>
          Token: {token.slice(0, 8)}…
        </p>
      ) : null}
    </main>
  );
}
