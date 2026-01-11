import { authHeaders, MobileSession } from "../../../shared/auth/mobile-session";
import { requestJson } from "../../../shared/api/request";

import { API_BASE_URL } from "../config";

export async function exchangeSession(): Promise<MobileSession> {
  const payload = await requestJson<{ data: MobileSession }>("/api/auth/mobile/exchange", {
    baseUrl: API_BASE_URL,
    method: "POST",
    credentials: "include"
  });
  return payload.data as MobileSession;
}

export async function refreshSession(token: string): Promise<MobileSession> {
  const payload = await requestJson<{ data: MobileSession }>("/api/auth/mobile/refresh", {
    baseUrl: API_BASE_URL,
    method: "POST",
    headers: authHeaders(token)
  });
  return payload.data as MobileSession;
}

export async function revokeSession(token: string) {
  await requestJson<void>("/api/auth/mobile/revoke", {
    baseUrl: API_BASE_URL,
    method: "POST",
    headers: authHeaders(token)
  });
}

export async function fetchMobileProfile(token: string) {
  return requestJson<{ ok: boolean; data?: { profileComplete?: boolean } }>("/api/auth/mobile", {
    baseUrl: API_BASE_URL,
    headers: authHeaders(token)
  });
}

export async function updateProfile(token: string, data: { handle: string; displayName: string; locale?: string }) {
  return requestJson("/api/me", {
    baseUrl: API_BASE_URL,
    method: "PATCH",
    headers: authHeaders(token),
    body: data
  });
}
