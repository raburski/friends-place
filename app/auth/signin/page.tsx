"use client";

import { DiscordLogo } from "@phosphor-icons/react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackParam = searchParams.get("callbackUrl");
  const callbackUrl = callbackParam && callbackParam.length > 0 ? callbackParam : "/places";

  return (
    <main className="landing-main auth-shell">
      <section className="hero auth-card">
        <div className="hero-content auth-stack">
          <span className="badge">Domy Kolegów</span>
          <div className="auth-heading">
            <h1>Użyj domofonu, kolego</h1>
          </div>
          <div className="auth-actions">
            <button
              type="button"
              className="cta cta-discord"
              onClick={() => {
                void signIn("discord", { callbackUrl });
              }}
            >
              <DiscordLogo className="cta-icon" size={18} weight="bold" />
              Kontynuuj z Discord
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
