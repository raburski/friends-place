"use client";

import { AppleLogo, SignIn } from "@phosphor-icons/react";
import { APP_STORE_URL } from "@/lib/links";

export function LandingCtas() {
  return (
    <div className="cta-row">
      <a className="cta" href="/api/auth/signin?callbackUrl=/places">
        <SignIn className="cta-icon" size={18} weight="bold" />
        Zaloguj
      </a>
      <a className="cta cta-ios" href={APP_STORE_URL}>
        <AppleLogo className="cta-icon" size={18} weight="bold" />
        Pobierz aplikację
      </a>
    </div>
  );
}
