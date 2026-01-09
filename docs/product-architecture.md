# Friends Place / Domy Kolegów — Product & Architecture Overview

## 1) Product summary
A private, free platform for friends to share apartments/houses and coordinate stays. Users can both host and stay. Places are visible to friends by default but are unavailable until owners add availability. Booking requests always require owner approval. The experience is chill, Polish-first, and optimized for minimal hosting effort with guided “how to” categories.

- Public brand: **Domy Kolegów** (domykolegow.pl)
- Internal/project name (code): **friends place**
- Primary audience: Poland (Polish UI), with English as secondary language
- Platforms: iOS app (Expo), desktop-focused web app (Next.js)

## 2) Core principles
- **Private by default:** only accepted friends can view places.
- **Simple hosting flow:** guides + house rules reduce repeated explanations.
- **Low friction:** invite links, minimal onboarding, no pricing.
- **Single-occupancy logic:** no overlapping stays per place or per user.

## 3) Feature scope (MVP)
### Accounts & auth
- OAuth via **Apple, Google, Discord** using NextAuth.
- Handles required at signup, unique case-insensitively, format: letters/numbers/underscore.
- Display name required, profile photo **not** in MVP.
- Admins designated by manual DB flag.

### Friends & invites
- Invite links:
  - **Single-use** and **multi-use** links.
  - **Deep links** to open app; fallback to web signup.
  - Default expiry: **1 year**, revokable manually.
- Using an invite link auto-creates friendship with inviter.
- Friend requests by handle, searchable after 3 characters, requires acceptance.
- Unfriend breaks connection (both lose access).

### Places
- Users can create **multiple places**.
- Required: name, address, owner.
- Optional: description, place type (Apartment/House), house rules.
- Visible to friends immediately; booking disabled until availability exists.
- Address visible to friends; editable by owner.
- Place can be **deactivated** (not deleted). Deactivation cancels bookings (with confirmation + notifications).

### Availability & bookings
- Availability: manual ranges, multiple per place.
- Booking model: **night-based** (check-in date to check-out date).
- Booking requires owner approval.
- Prevent overlapping stays:
  - Per place: only one stay at a time.
  - Per guest: cannot book overlapping dates across places.
- Declined or canceled booking releases dates back to availability.
- Availability edits allowed anytime; if conflicts exist, owner must confirm and guest is notified.

### Guides & house rules
- Predefined guide categories (Polish labels):
  - “Jak się dostać”
  - “Jak się wyspać”
  - “Jak się umyć”
  - “Jak się najeść/napić”
  - “Jak obsługiwać”
- MVP: **text-only fields** per category.
- House rules: single text field.

### Scores
- **Stay score**: +1 per night stayed at a friend’s place.
- **Lending score**: +1 per night someone stays at your place.
- Shown **only in own Profile**.

### Notifications
- In-app + push (Expo notifications).
- Bell icon on Places tab:
  - shows unread notifications
  - “See previous” opens full history list
- Events: friend request accepted, booking requested/approved/declined/canceled, place deactivated, availability conflict updates, invite signups.
- Push errors ignored in MVP, but leave TODO markers for future handling.

### UI navigation (mobile)
Bottom tab bar:
1) **Places** — friends’ places list + map; bell icon top right.
2) **Bookings** — “My stays” on top; “At my places” below; “Previous” history button.
3) **Profile** — user info, scores, places management, friends, invites, settings.

### Web app (Next.js)
- Full feature parity with mobile.
- Desktop-focused responsive UI.
- On mobile web: show “Download app” CTA.
- Minimal public landing page with:
  - Logo placeholder
  - 1–2 Polish sentences + phrase “od kolegów dla kolegów”
  - “Zaloguj / Pobierz aplikację”

### Map & geocoding
- Web map: Google Maps (keep provider abstraction for replaceability).
- iOS map: Apple Maps (via `react-native-maps`).
- Address autocomplete + geocoding: OpenStreetMap/Nominatim (server-side).
- Store coordinates + timezone per place.

## 4) UX/UI direction
- Tone: chill, friendly, non-corporate, Polish-first.
- Dark mode supported.
- Platform feel: iOS “liquid glass” vibe, airy spacing.
- Minimal onboarding; clear entry points to add place and request stay.

### UI tokens (initial proposal)
Can be refined later; define as CSS variables for web and shared tokens for mobile.
- Radius: `12` (cards), `16` (sheets), `999` (pills)
- Border: subtle 1px, low-contrast
- Colors (light):
  - Primary: soft teal `#2C7A7B`
  - Secondary: warm sand `#F3E9D2`
  - Text: `#1B1B1B`
  - Border: `#E5E0D5`
- Colors (dark):
  - Background: `#121212`
  - Surface: `#1C1C1C`
  - Text: `#F5F5F5`
  - Border: `#2A2A2A`
- Typography: leave slots for primary/secondary fonts (Polish friendly).

### Empty states (Polish, chill)
Provide playful copy for:
- No friends
- No places
- No availability
- No bookings
- No notifications

## 5) Technical architecture
### Monorepo layout (root = Next.js)
```
/ (Next.js app, web + API)
/mobile (Expo app)
/shared (domain logic, types, validation, hooks, providers)
```
- No separate packages; shared code via `/shared` directory.

### Web (Next.js)
- App Router (default)
- API via Route Handlers (same app)
- CSS Modules for styling
- I18n enabled (Polish default, English secondary)

### Mobile (Expo)
- React Navigation
- iOS-only target
- Expo push notifications
- Expo EAS Build/Submit

### Backend & data
- PostgreSQL + Prisma
- Hosted on Railway
- Synchronous API (no background queues in MVP)

### External services
- Nominatim for geocoding/autocomplete
- Google Maps JS API (web)
- Apple Maps (iOS via `react-native-maps`)

## 6) Data model (high level)
Entities and key relationships:
- **User**: id, handle, displayName, email, isAdmin, locale, createdAt
- **Friendship**: userId, friendId, status (pending/accepted), requestedBy
- **InviteLink**: id, creatorId, type (single/multi), code, expiresAt, revokedAt, usedByUserId
- **Place**: id, ownerId, name, address, lat, lng, timezone, type, description, rules, isActive
- **AvailabilityRange**: id, placeId, startDate, endDate (check-in/check-out)
- **Booking**: id, placeId, guestId, startDate, endDate, status (requested/approved/declined/canceled/completed)
- **GuideEntry**: id, placeId, categoryKey, text
- **Notification**: id, userId, type, payload, readAt, createdAt
- **PushToken**: id, userId, token, platform, createdAt

## 7) Key flows (MVP)
- **Invite signup:** user opens deep link → OAuth signup → handle creation → friendship auto-created → notification to inviter.
- **Friend request:** search handle (>=3 chars) → send request (optional message) → accept/decline → access granted.
- **Create place:** enter name/address/type/description/rules → server geocodes → place visible to friends.
- **Add availability:** select multiple ranges → saved.
- **Request booking:** select dates within availability → request (owner approval required) → external share message (Polish template with placeholders).
- **Approve booking:** owner approves → dates blocked → notifications.
- **Cancel:** owner or guest cancels → dates freed → notifications.
- **Deactivation:** owner deactivates → auto-cancel future stays → confirm → notifications.

## 8) Non-goals (MVP)
- Photos
- Payments
- In-app chat
- Admin moderation UI
- Analytics/telemetry
- Email notifications
- Account deletion

## 9) Localization
- Polish default UI language, English optional.
- All user-facing copy in Polish for MVP.
- Code and identifiers in English.

## 10) Open items to finalize later
- Polish message template for booking request (with `{placeName}`, `{checkIn}`, `{checkOut}`).
- Final UI font pairing and logo.
- Landing page copy (1–2 sentences in Polish).

---

## Quick reference: confirmed decisions
- iOS-only, Expo managed workflow, EAS Build/Submit.
- Next.js root app with Route Handlers API.
- Postgres + Prisma on Railway.
- Auth: Apple + Google + Discord via NextAuth.
- Maps: Google (web), Apple (iOS), Nominatim geocoding.
- Notifications: in-app + push; no email.
- Places visible to friends by default; bookings require approval.
- Manual availability ranges; night-based check-in/out.
```
