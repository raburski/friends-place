"use client";

import { ArrowRight, DownloadSimple, SignIn } from "@phosphor-icons/react";

export function LandingCtas() {
  return (
    <div className="cta-row">
      <a className="cta cta-ios cta-ios--green" href="/api/auth/signin?callbackUrl=/places">
        <SignIn className="cta-icon" size={18} weight="bold" />
        Zaloguj
      </a>
      <a className="cta cta-ios" href="/auth/mobile">
        <DownloadSimple className="cta-icon" size={18} weight="bold" />
        Pobierz aplikację
      </a>
      <a className="secondary" href="/places">
        <ArrowRight className="cta-icon" size={18} weight="bold" />
        Dowiedz się więcej
      </a>
    </div>
  );
}
