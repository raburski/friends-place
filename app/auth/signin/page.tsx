"use client";

import { DiscordLogo } from "@phosphor-icons/react";

export default function SignInPage() {
  return (
    <main className="landing-main auth-shell">
      <section className="hero auth-card">
        <div className="hero-content auth-stack">
          <span className="badge">Domy Kolegów</span>
          <div className="auth-heading">
            <h1>Użyj domofonu, kolego</h1>
          </div>
          <div className="auth-actions">
            <a
              className="cta cta-discord"
              href="/api/auth/signin/discord?callbackUrl=/places"
            >
              <DiscordLogo className="cta-icon" size={18} weight="bold" />
              Kontynuuj z Discord
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
