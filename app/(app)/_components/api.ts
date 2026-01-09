import { signOut } from "next-auth/react";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    },
    credentials: "include"
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const errorCode = data?.error;
    if ((response.status === 401 || errorCode === "unauthorized") && typeof window !== "undefined") {
      void signOut({ callbackUrl: "/" }).catch(() => {
        window.location.assign("/api/auth/signout");
      });
    }
    throw new ApiError(errorCode ?? "request_failed", response.status, errorCode);
  }

  return response.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined
  });
}
