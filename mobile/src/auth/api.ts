import { authHeaders, MobileSession } from "../../../shared/auth/mobile-session";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export async function exchangeSession(): Promise<MobileSession> {
  const response = await fetch(`${API_BASE_URL}/api/auth/mobile/exchange`, {
    method: "POST",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Exchange failed");
  }

  const payload = await response.json();
  return payload.data as MobileSession;
}

export async function refreshSession(token: string): Promise<MobileSession> {
  const response = await fetch(`${API_BASE_URL}/api/auth/mobile/refresh`, {
    method: "POST",
    headers: {
      ...authHeaders(token)
    }
  });

  if (!response.ok) {
    throw new Error("Refresh failed");
  }

  const payload = await response.json();
  return payload.data as MobileSession;
}

export async function revokeSession(token: string) {
  await fetch(`${API_BASE_URL}/api/auth/mobile/revoke`, {
    method: "POST",
    headers: {
      ...authHeaders(token)
    }
  });
}
