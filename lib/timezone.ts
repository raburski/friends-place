import tzLookup from "tz-lookup";

export function timezoneFromCoords(lat: number, lng: number) {
  try {
    return tzLookup(lat, lng);
  } catch {
    return null;
  }
}
