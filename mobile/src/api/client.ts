import { authHeaders } from "../../../shared/auth/mobile-session";
import { requestJson } from "../../../shared/api/request";

export { ApiError } from "../../../shared/api/request";

import { API_BASE_URL } from "../config";

export async function apiGet<T>(path: string, token: string): Promise<T> {
  return requestJson<T>(path, {
    baseUrl: API_BASE_URL,
    headers: authHeaders(token)
  });
}

export async function apiPost<T>(path: string, token: string, body?: unknown): Promise<T> {
  return requestJson<T>(path, {
    method: "POST",
    baseUrl: API_BASE_URL,
    headers: authHeaders(token),
    body
  });
}

export async function apiPatch<T>(path: string, token: string, body?: unknown): Promise<T> {
  return requestJson<T>(path, {
    method: "PATCH",
    baseUrl: API_BASE_URL,
    headers: authHeaders(token),
    body
  });
}

export async function apiPut<T>(path: string, token: string, body?: unknown): Promise<T> {
  return requestJson<T>(path, {
    method: "PUT",
    baseUrl: API_BASE_URL,
    headers: authHeaders(token),
    body
  });
}
