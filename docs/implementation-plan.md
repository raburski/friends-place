# Friends Place / Domy Kolegów — Implementation Plan (MVP)

## 0) Goals
Deliver an iOS-only Expo app + full-feature desktop-focused Next.js web app, with a shared domain layer, on Railway + Postgres + Prisma. Polish-first UI, English optional.

## 1) Milestones & phases
### Phase 1 — Foundation (Repo + infra)
- Initialize Next.js app at repo root (App Router).
- Add `/mobile` Expo app.
- Add `/shared` for domain logic/types/validation/hooks/providers.
- Configure Prisma + Postgres (Railway).
- Configure NextAuth (Apple/Google/Discord).
- Basic i18n scaffolding (pl default, en optional).
- CI basics (lint/test placeholders).

### Phase 2 — Core data model & API
- Define Prisma schema & migrations.
- Implement core Route Handlers:
  - Auth/session
  - Users/Profiles
  - Friends & friend requests
  - Invite links
  - Places
  - Availability ranges
  - Bookings
  - Notifications
  - Push tokens
- Implement shared validation and API client in `/shared`.

### Phase 3 — Mobile app MVP
- Navigation: tab bar (Places, Bookings, Profile).
- Auth flow (NextAuth via webview + token).
- Places list + map (Apple Maps).
- Place detail + calendar + availability creation.
- Booking request + approval/decline/cancel flows.
- Friend requests + invites + profile management.
- Notifications list + push registration.
- Settings (language switch, sign out).

### Phase 4 — Web app MVP
- Full parity UI (desktop-focused).
- Web map (Google Maps).
- Landing page (minimal).
- Mobile web download CTA.

### Phase 5 — Polish copy + UX polish
- Polish empty states.
- Booking request message template placeholders.
- UI styling tokens + dark mode.

### Phase 6 — Release readiness
- Seed data utilities (optional).
- Basic QA + bug fixes.
- EAS Build/Submit.

---

## 2) Detailed work breakdown
### 2.1 Repo setup
- Root Next.js app with App Router.
- `/mobile` Expo app (iOS only, React Navigation).
- `/shared` folder:
  - `domain/` (types, enums, validation)
  - `api/` (typed client + hooks)
  - `auth/` (token helpers)
- Shared ESLint/TS config (as simple as possible).

### 2.2 Database & Prisma
Tables (high-level):
- `User` (handle, displayName, email, isAdmin, locale)
- `Friendship` (status, requestedBy)
- `InviteLink` (type, code, expiresAt, revokedAt, usedByUserId)
- `Place` (ownerId, name, address, lat, lng, timezone, type, description, rules, isActive)
- `AvailabilityRange` (placeId, startDate, endDate)
- `Booking` (placeId, guestId, startDate, endDate, status)
- `GuideEntry` (placeId, categoryKey, text)
- `Notification` (userId, type, payload, readAt)
- `PushToken` (userId, token, platform)

Rules:
- Handle unique case-insensitive.
- Prevent overlapping bookings (per place, per guest).
- Booking requires availability overlap and owner approval.
- Booking cancel/decline frees availability.
- Place deactivation cancels future bookings.

### 2.3 Auth & sessions
- NextAuth with Apple/Google/Discord.
- Ensure Sign in with Apple compliance (present on iOS).
- Web: standard NextAuth session cookies.
- Mobile: OAuth via webview → exchange for API token/session.

### 2.4 API routes
Core endpoints:
- `POST /api/invites` create invite
- `GET /api/invites` list invites
- `POST /api/invites/code/:code/redeem`
- `POST /api/friends/request`
- `POST /api/friends/respond`
- `GET /api/places` list friends places
- `POST /api/places` create
- `PATCH /api/places/:id` update
- `POST /api/places/:id/deactivate`
- `POST /api/availability` add ranges
- `DELETE /api/availability/:id`
- `POST /api/bookings` request
- `POST /api/bookings/:id/approve`
- `POST /api/bookings/:id/decline`
- `POST /api/bookings/:id/cancel`
- `GET /api/bookings` list (active/pending)
- `GET /api/notifications` list
- `POST /api/notifications/read`
- `POST /api/push/register`

### 2.5 Notifications
- Store notification records in DB.
- Push via Expo service.
- Ignore push failures in MVP (log + TODO comment).

### 2.6 Maps & geocoding
- Server-side geocoding via Nominatim.
- Store `lat/lng/timezone` on place.
- Web: Google Maps JS API with provider abstraction.
- iOS: Apple Maps provider in `react-native-maps`.

### 2.7 UI/UX screens
Mobile:
- Places list + map
- Place detail + calendar
- Bookings (My stays / At my places)
- Profile (My places + friends + invites + settings + scores)
- Notifications list
- Friend search + request
- Invite list + create/revoke

Web:
- Same screens (desktop focus)
- Landing page

### 2.8 Internationalization
- Default `pl` with optional `en`.
- Keep translation keys in `/shared/i18n`.
- UI strings in Polish for MVP.

---

## 3) Order of implementation (recommended)
1) Repo bootstrap (Next.js root + Expo + shared)
2) Prisma schema + migrations
3) Auth (NextAuth) + session wiring for mobile
4) Places + availability API + UI
5) Booking request/approve/cancel flows + constraints
6) Friends + invites + notifications
7) Map & geocoding
8) Booking list + history access
9) Polish copy + dark mode polish
10) Landing page + web mobile CTA

---

## 4) Risks & mitigations
- **Nominatim usage limits** → keep calls minimal, cache later if needed.
- **Mobile auth with NextAuth** → confirm token/session exchange approach early.
- **Overlapping date logic** → add strong DB constraints + server checks.
- **Timezone correctness** → store place timezone, convert on client.

---

## 5) Definition of done (MVP)
- Users can sign in (Apple/Google/Discord), set handle, create places.
- Friends can view places, see availability, request booking.
- Owners approve/decline/cancel; bookings reflect on calendars.
- Notifications delivered in-app + push.
- Map view works (Apple Maps on iOS, Google Maps on web).
- Web app functional (desktop), mobile web shows download CTA.
- Polish UI default, English optional.
