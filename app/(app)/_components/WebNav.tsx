"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

const links = [
  { href: "/places", label: "Miejsca" },
  { href: "/bookings", label: "Rezerwacje" },
  { href: "/notifications", label: "Powiadomienia" },
  { href: "/profile", label: "Profil" },
  { href: "/settings", label: "Ustawienia" }
];

export function WebNav() {
  const pathname = usePathname();
  const { status } = useSession();

  return (
    <nav className="web-nav">
      <div className="web-nav__brand">Domy Kolegów</div>
      <div className="web-nav__links">
        {links.map((link) => {
          const active = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? "web-nav__link web-nav__link--active" : "web-nav__link"}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      {status === "authenticated" ? (
        <button className="web-nav__link web-nav__button" onClick={() => signOut({ callbackUrl: "/" })}>
          Wyloguj
        </button>
      ) : (
        <button className="web-nav__link web-nav__button" onClick={() => signIn()}>
          Zaloguj
        </button>
      )}
    </nav>
  );
}
