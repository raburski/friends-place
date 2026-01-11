"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "../../../_components/Button";

type RedeemResponse = {
  ok: boolean;
  error?: string;
};

type InviteInfoResponse = {
  ok: boolean;
  data?: { inviter: string };
  error?: string;
};

export default function InviteRedeemPage() {
  const params = useParams();
  const codeParam = params?.code;
  const code = Array.isArray(codeParam) ? codeParam[0] : codeParam;
  const [status, setStatus] = useState("Ładowanie zaproszenia...");
  const [action, setAction] = useState<"idle" | "login" | "ready" | "done">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [inviter, setInviter] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setStatus("Nieprawidłowy kod zaproszenia.");
      setAction("done");
      return;
    }
    fetch(`/api/invites/code/${code}`)
      .then((response) => response.json() as Promise<InviteInfoResponse>)
      .then((payload) => {
        if (payload.ok && payload.data?.inviter) {
          setInviter(payload.data.inviter);
        }
      })
      .catch(() => {
        setInviter(null);
      });
    setStatus("Potwierdź, aby wysłać prośbę o dodanie.");
    setAction("ready");
  }, [code]);

  return (
    <main className="landing-main">
      <section className="hero" style={{ maxWidth: 720 }}>
        <div className="hero-content">
          <span className="badge">Zaproszenie</span>
          <h1>{inviter ? `${inviter} zaprasza Cię do Domów Kolegów` : "Ktoś zaprasza Cię do Domów Kolegów"}</h1>
          <p className="subtitle">{status}</p>
          {action === "login" ? (
            <a
              className="cta"
              href={`/api/auth/signin?callbackUrl=${encodeURIComponent(`/auth/invite/${code}`)}`}
            >
              Zaloguj się, aby kontynuować
            </a>
          ) : null}
          {action === "ready" ? (
            <Button
              className="cta"
              loading={submitting}
              loadingLabel="Wysyłanie..."
              onClick={async () => {
                setSubmitting(true);
                try {
                  const response = await fetch(`/api/invites/code/${code}/redeem`, {
                    method: "POST",
                    credentials: "include"
                  });

                  if (response.status === 401) {
                    setStatus("Musisz się zalogować, aby użyć zaproszenia.");
                    setAction("login");
                    return;
                  }

                  const payload = (await response.json()) as RedeemResponse;
                  if (!payload.ok) {
                    setStatus("Nie udało się użyć zaproszenia.");
                    setAction("done");
                    return;
                  }

                  setStatus("Zaproszenie zaakceptowane. Możesz przejść dalej.");
                  setAction("done");
                } catch {
                  setStatus("Wystąpił błąd podczas używania zaproszenia.");
                  setAction("done");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              Potwierdź zaproszenie
            </Button>
          ) : null}
          {action === "done" ? (
            <a className="secondary" href="/friends">
              Przejdź do Koledzy
            </a>
          ) : null}
        </div>
      </section>
    </main>
  );
}
