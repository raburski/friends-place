# Auth flow details (MVP)

## Web
- NextAuth session cookie as default.
- `GET /api/me` to load current user profile.
- `PATCH /api/me` to set `handle`, `displayName`, and optionally `locale` after first login.

## Mobile (Expo)
- Use NextAuth sign-in via WebView or `AuthSession`.
- After OAuth, rely on NextAuth cookie in the webview and exchange for an app session.
  - Option A: open a deep link to the app that hits `/api/auth/session` and stores the session.
  - Option B (recommended): use `GET /api/me` after login and store a lightweight token from server.

## Required user fields
- `handle` and `displayName` are required after signup.
- `handle` uniqueness is enforced case-insensitively via `handleLower`.

## TODOs
- Decide and implement the exact mobile token/session exchange.
- Enforce `handle`/`displayName` completion in UI before using the app.
