import { useMemo } from "react";
import { useSession } from "../auth/useSession";
import type { ApiOptions, ApiQueryOptions } from "../../../shared/query/hooks/api";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export function useMobileApiOptions(): ApiOptions {
  const { session } = useSession();
  return useMemo(
    () => ({
      baseUrl: API_BASE_URL,
      token: session?.token
    }),
    [session?.token]
  );
}

export function useMobileApiQueryOptions(): ApiQueryOptions {
  const { session } = useSession();
  return useMemo(
    () => ({
      baseUrl: API_BASE_URL,
      token: session?.token,
      enabled: Boolean(session?.token)
    }),
    [session?.token]
  );
}
