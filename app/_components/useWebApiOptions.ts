"use client";

import { signOut } from "next-auth/react";
import { useMemo } from "react";
import type { ApiOptions } from "../../shared/query/hooks/api";

export function useWebApiOptions(): ApiOptions {
  return useMemo(
    () => ({
      credentials: "include",
      onUnauthorized: () => {
        if (typeof window === "undefined") {
          return;
        }
        return signOut({ callbackUrl: "/" }).catch(() => {
          window.location.assign("/api/auth/signout");
        });
      }
    }),
    []
  );
}
