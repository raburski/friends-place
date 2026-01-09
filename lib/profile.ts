import type { User } from "@prisma/client";

export function isProfileComplete(user: User | null) {
  if (!user) {
    return false;
  }
  return Boolean(user.handle && user.displayName);
}
