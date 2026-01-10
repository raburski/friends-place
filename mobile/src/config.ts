// Central app config to avoid env var setup on device builds.
export const API_BASE_URL = __DEV__
  ? "http://localhost:3000"
  : "https://domykolegow.pl";
