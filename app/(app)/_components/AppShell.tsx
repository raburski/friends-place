"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch, ApiError } from "./api";
import { Bell, CalendarBlank, GearSix, House, UserCircle, UsersThree } from "@phosphor-icons/react";
import { Toaster } from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../shared/query/keys";

const links = [
  { href: "/places", label: "Miejsca", Icon: House },
  { href: "/bookings", label: "Rezerwacje", Icon: CalendarBlank },
  { href: "/friends", label: "Koledzy", Icon: UsersThree },
  { href: "/profile", label: "Profil", Icon: UserCircle },
  { href: "/settings", label: "Ustawienia", Icon: GearSix }
];

type NotificationItem = {
  id: string;
  type: string;
  readAt?: string | null;
  createdAt: string;
  payload: Record<string, unknown>;
};

const notificationLabels: Record<string, string> = {
  friend_accepted: "Zaproszenie przyjęte",
  booking_requested: "Nowa prośba o pobyt",
  booking_approved: "Pobyt zaakceptowany",
  booking_declined: "Pobyt odrzucony",
  booking_canceled: "Pobyt anulowany",
  place_deactivated: "Miejsce wyłączone",
  availability_conflict: "Konflikt dostępności",
  invite_signup: "Znajomy dołączył"
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notificationsActive, setNotificationsActive] = useState(false);
  const [profileGateOpen, setProfileGateOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications(10),
    queryFn: () => apiFetch<{ ok: boolean; data: NotificationItem[] }>("/api/notifications?limit=10"),
    enabled: notificationsOpen
  });
  const meQuery = useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => apiFetch<{ ok: boolean; data: { displayName?: string; handle?: string } }>("/api/me"),
    enabled: status === "authenticated"
  });

  const notifications = useMemo(
    () => notificationsQuery.data?.data ?? [],
    [notificationsQuery.data]
  );
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName, handle, locale: "pl" })
      })
  });

  useEffect(() => {
    if (status !== "authenticated") {
      setProfileGateOpen(false);
      return;
    }
    if (meQuery.data?.data) {
      const name = meQuery.data.data.displayName ?? "";
      const nextHandle = meQuery.data.data.handle ?? "";
      setDisplayName(name);
      setHandle(nextHandle);
      setProfileGateOpen(!(name && nextHandle));
    }
    if (meQuery.isError) {
      setProfileGateOpen(false);
    }
  }, [status, meQuery.data, meQuery.isError]);

  useEffect(() => {
    if (notificationsOpen) {
      setNotificationsVisible(true);
      setNotificationsActive(false);
      const frame = window.requestAnimationFrame(() => {
        const timeout = window.setTimeout(() => setNotificationsActive(true), 0);
        return () => window.clearTimeout(timeout);
      });
      return () => window.cancelAnimationFrame(frame);
    }
    setNotificationsActive(false);
    const timeout = window.setTimeout(() => setNotificationsVisible(false), 180);
    return () => window.clearTimeout(timeout);
  }, [notificationsOpen]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!popoverRef.current) {
        return;
      }
      if (event.target instanceof Node && !popoverRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notificationsOpen]);

  if (profileGateOpen) {
    return (
      <div className="profile-gate">
        <section className="hero profile-gate__card">
          <div className="hero-content">
            <span className="badge">Uzupełnij profil</span>
            <h1>Powiedz jak mamy Cię nazywać</h1>
            <p className="subtitle">
              Aby korzystać z aplikacji, potrzebujemy nazwy i handle.
            </p>
            <div className="profile-form">
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Imię / nazwa"
              />
              <input
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
                placeholder="Handle"
              />
              <button
                type="button"
                disabled={profileSaving}
                onClick={async () => {
                  setProfileSaving(true);
                  setProfileError(null);
                  try {
                    await updateProfileMutation.mutateAsync();
                    setProfileGateOpen(false);
                  } catch (err) {
                    if (err instanceof ApiError && err.code === "handle_taken") {
                      setProfileError("Ten handle jest już zajęty.");
                    } else if (err instanceof ApiError && err.code === "invalid_handle") {
                      setProfileError("Nieprawidłowy handle.");
                    } else {
                      setProfileError("Nie udało się zapisać profilu.");
                    }
                  } finally {
                    setProfileSaving(false);
                  }
                }}
              >
                Zapisz profil
              </button>
            </div>
            {profileError ? <p className="muted">{profileError}</p> : null}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Toaster position="top-center" />
      <aside className="app-rail">
        <div className="app-rail__brand">Domy Kolegów</div>
        <nav className="app-rail__nav">
          {links.map((link) => {
            const active = pathname?.startsWith(link.href);
            const Icon = link.Icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "app-rail__link app-rail__link--active" : "app-rail__link"}
                aria-label={link.label}
                title={link.label}
              >
                <Icon size={20} weight={active ? "fill" : "regular"} />
                <span className="app-rail__label">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="app-body">
        <header className="app-topbar">
          <div className="app-topbar__actions">
            <div className="popover popover--left" ref={popoverRef}>
              <button
                type="button"
                className="secondary-button popover-trigger"
                onClick={() => setNotificationsOpen((current) => !current)}
                aria-label="Powiadomienia"
                aria-expanded={notificationsOpen}
              >
                <Bell size={20} weight={notificationsOpen ? "fill" : "regular"} />
                {unreadCount > 0 ? <span className="count-badge">{unreadCount}</span> : null}
              </button>
              {notificationsVisible ? (
                <div className={notificationsActive ? "popover-panel popover-panel--open" : "popover-panel"}>
                  <div className="popover-header">
                    <strong>Powiadomienia</strong>
                    <Link href="/notifications" className="popover-link">
                      Zobacz wszystkie
                    </Link>
                  </div>
                  <div className="popover-list">
                    {notifications.length === 0 ? (
                      <p className="muted">Brak nowych powiadomień.</p>
                    ) : (
                      notifications.map((item) => (
                        <div key={item.id} className="popover-item">
                          <strong>{notificationLabels[item.type] ?? item.type}</strong>
                          <div className="muted">{notificationSubtitle(item.payload)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="app-search">
            <span className="pill">/</span>
            <input placeholder="Szukaj miejsc, osób i pobytów" />
            <span className="pill">⌘K</span>
          </div>
          <div className="app-topbar__actions">
            <button className="secondary-button" type="button">
              Polecenia
            </button>
            {status === "authenticated" ? null : (
              <button type="button" className="secondary-button" onClick={() => signIn()}>
                Zaloguj
              </button>
            )}
          </div>
        </header>
        <main className="app-content">
          <div className="app-container">{children}</div>
        </main>
      </div>
    </div>
  );
}


function notificationSubtitle(payload: Record<string, unknown>) {
  const placeName = typeof payload.placeName === "string" ? payload.placeName : null;
  const start = typeof payload.startDate === "string" ? payload.startDate : null;
  const end = typeof payload.endDate === "string" ? payload.endDate : null;

  if (placeName && start && end) {
    return `${placeName} · ${start} → ${end}`;
  }
  if (placeName) {
    return placeName;
  }
  if (start && end) {
    return `${start} → ${end}`;
  }
  return "";
}
