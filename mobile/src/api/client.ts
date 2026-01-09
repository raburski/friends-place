import { authHeaders } from "../../../shared/auth/mobile-session";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiGet<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...authHeaders(token)
    }
  });

  if (!response.ok) {
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    throw new ApiError(`Request failed: ${response.status}`, response.status, data);
  }

  return response.json();
}

export async function apiPost<T>(path: string, token: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token)
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    throw new ApiError(`Request failed: ${response.status}`, response.status, data);
  }

  return response.json();
}
