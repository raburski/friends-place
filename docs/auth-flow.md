# Auth flow details (MVP)

## Web
- NextAuth session cookie as default.
- `GET /api/me` to load current user profile.
- `PATCH /api/me` to set `handle`, `displayName`, and optionally `locale` after first login.
- `GET /api/auth/mobile` can be used by the app to read the current session + `profileComplete`.

## Mobile (Expo)
- Use NextAuth sign-in via WebView or `AuthSession`.
- After OAuth, exchange the web session for an app token:
  - `POST /api/auth/mobile/exchange` returns a bearer token (30 days).
  - Store and send `Authorization: Bearer <token>` on API calls.
  - Refresh token: `POST /api/auth/mobile/refresh`.
  - Optional logout: `POST /api/auth/mobile/revoke`.
- `GET /api/auth/mobile` returns the current user and `profileComplete`.

## Required user fields
- `handle` and `displayName` are required after signup.
- `handle` uniqueness is enforced case-insensitively via `handleLower`.
- Profile completion is required before creating places, invites, bookings, or friend requests.

## TODOs
- Decide and implement the exact mobile token/session exchange.
- Enforce `handle`/`displayName` completion in UI before using the app.
