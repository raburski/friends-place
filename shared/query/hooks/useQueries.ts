import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, ApiQueryOptions } from "./api";
import { queryKeys } from "../keys";

type Place = {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  rules?: string | null;
  owner?: {
    id: string;
    displayName?: string | null;
    name?: string | null;
    handle?: string | null;
  };
};

type Availability = { id: string; startDate: string; endDate: string };

type GuideEntry = { categoryKey: string; text: string };

type Booking = {
  id: string;
  placeId: string;
  startDate: string;
  endDate: string;
  status: string;
};

type BookingsPayload = {
  myStays: Booking[];
  atMyPlaces: Booking[];
};

type Friend = { friendshipId: string; friendId: string; handle?: string; displayName?: string };

type Invite = { id: string; code: string; type: string; revokedAt?: string | null };

type FriendRequest = { friendshipId: string; handle?: string; displayName?: string };

type NotificationItem = {
  id: string;
  type: string;
  readAt?: string | null;
  createdAt: string;
  payload: Record<string, unknown>;
};

function splitQueryOptions(options: ApiQueryOptions) {
  const { enabled, ...apiOptions } = options;
  return { enabled, apiOptions };
}

export function useMeQuery(options: ApiQueryOptions = {}) {
  const { enabled, apiOptions } = splitQueryOptions(options);
  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => apiRequest<{ ok: boolean; data: { id: string; displayName?: string; handle?: string } }>(
      "/api/me",
      apiOptions
    ),
    enabled: enabled ?? true
  });
}

export function usePlacesQuery(options: ApiQueryOptions = {}) {
  const { enabled, apiOptions } = splitQueryOptions(options);
  return useQuery({
    queryKey: queryKeys.places(),
    queryFn: () => apiRequest<{ ok: boolean; data: Place[] }>("/api/places", apiOptions),
    enabled: enabled ?? true
  });
}

export function usePlaceQuery(placeId: string, options: ApiQueryOptions = {}) {
  const { enabled, apiOptions } = splitQueryOptions(options);
  return useQuery({
    queryKey: queryKeys.place(placeId),
    queryFn: () => apiRequest<{ ok: boolean; data: Place }>(`/api/places/${placeId}`, apiOptions),
    enabled: (enabled ?? true) && Boolean(placeId)
  });
}

export function useAvailabilityQuery(placeId: string, options: ApiQueryOptions = {}) {
  const { enabled, apiOptions } = splitQueryOptions(options);
  return useQuery({
    queryKey: queryKeys.availability(placeId),
    queryFn: () =>
      apiRequest<{ ok: boolean; data: { ranges: Availability[]; isOwner: boolean } }>(
        `/api/availability/place/${placeId}`,
        apiOptions
      ),
    enabled: (enabled ?? true) && Boolean(placeId)
  });
}

export function useGuidesQuery(placeId: string, options: ApiQueryOptions = {}) {
  const { enabled, apiOptions } = splitQueryOptions(options);
  const query = useQuery({
    queryKey: queryKeys.guides(placeId),
    queryFn: () => apiRequest<{ ok: boolean; data: GuideEntry[] }>(`/api/guides/${placeId}`, apiOptions),
    enabled: (enabled ?? true) && Boolean(placeId)
  });

  const guidesMap = useMemo(() => {
    const next: Record<string, string> = {};
    query.data?.data?.forEach((entry) => {
      next[entry.categoryKey] = entry.text;
    });
    return next;
  }, [query.data]);

  return { ...query, guidesMap };
}

export function useBookingsQuery(scope: "current" | "history", options: ApiQueryOptions = {}) {
  const { enabled, apiOptions } = splitQueryOptions(options);
  const path = scope === "history" ? "/api/bookings?history=true" : "/api/bookings";
  return useQuery({
    queryKey: queryKeys.bookings(scope),
    queryFn: () => apiRequest<{ ok: boolean; data: BookingsPayload }>(path, apiOptions),
    enabled: enabled ?? true
  });
}

export function useFriendsQuery(options: ApiQueryOptions = {}) {
  const { enabled, apiOptions } = splitQueryOptions(options);
  return useQuery({
    queryKey: queryKeys.friends(),
    queryFn: () => apiRequest<{ ok: boolean; data: Friend[] }>("/api/friends", apiOptions),
    enabled: enabled ?? true
  });
}

export function useFriendRequestsQuery(options: ApiQueryOptions = {}) {
  const { enabled, apiOptions } = splitQueryOptions(options);
  return useQuery({
    queryKey: queryKeys.friendRequests(),
    queryFn: () => apiRequest<{ ok: boolean; data: FriendRequest[] }>("/api/friends/requests", apiOptions),
    enabled: enabled ?? true
  });
}

export function useInvitesQuery(options: ApiQueryOptions = {}) {
  const { enabled, apiOptions } = splitQueryOptions(options);
  return useQuery({
    queryKey: queryKeys.invites(),
    queryFn: () => apiRequest<{ ok: boolean; data: Invite[] }>("/api/invites", apiOptions),
    enabled: enabled ?? true
  });
}

export function useNotificationsQuery(limit: number, options: ApiQueryOptions = {}) {
  const { enabled, apiOptions } = splitQueryOptions(options);
  return useQuery({
    queryKey: queryKeys.notifications(limit),
    queryFn: () => apiRequest<{ ok: boolean; data: NotificationItem[] }>(`/api/notifications?limit=${limit}`,
      apiOptions
    ),
    enabled: enabled ?? true
  });
}
