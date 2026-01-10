export const queryKeys = {
  me: () => ["me"] as const,
  places: () => ["places"] as const,
  place: (placeId: string) => ["place", placeId] as const,
  availability: (placeId: string) => ["availability", placeId] as const,
  guides: (placeId: string) => ["guides", placeId] as const,
  bookings: (scope: "current" | "history") => ["bookings", scope] as const,
  friends: () => ["friends"] as const,
  friendRequests: () => ["friendRequests"] as const,
  invites: () => ["invites"] as const,
  notifications: (limit: number) => ["notifications", limit] as const
};
