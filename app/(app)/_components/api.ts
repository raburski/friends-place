import { signOut } from "next-auth/react";
import { requestJson } from "../../../shared/api/request";

export { ApiError } from "../../../shared/api/request";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return requestJson<T>(path, {
    method: options?.method,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    },
    body: options?.body,
    credentials: "include",
    onUnauthorized: () => {
      if (typeof window === "undefined") {
        return;
      }
      return signOut({ callbackUrl: "/" }).catch(() => {
        window.location.assign("/api/auth/signout");
      });
    }
  });
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined
  });
}
