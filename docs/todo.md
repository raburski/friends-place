# Configuration TODOs (local & prod)

- Add `.env` with database + auth credentials (see `.env.example`).
- Run Prisma migration after setting `DATABASE_URL`:
  - `npx prisma migrate dev --name init`
  - `npx prisma generate`
- Decide how to store `APPLE_PRIVATE_KEY` (multiline env handling on Railway).
- Configure OAuth credentials + redirect URLs for:
  - Google
  - Discord
  - Apple
- Set `NEXTAUTH_URL` per environment (local + production).
- Add Expo push credentials (once notifications are wired).
- Set `EXPO_ACCESS_TOKEN` for Expo push if required.
- Set Google Maps JS API key (web map) and restrict domains.
- Decide on Nominatim usage policy + caching strategy (if needed).
- Set a proper `NOMINATIM_USER_AGENT` (required by Nominatim usage policy).
- Set `EXPO_PUBLIC_API_BASE_URL` for device testing in Expo.
- Configure `react-native-maps` on iOS (Apple Maps only; no API key).
