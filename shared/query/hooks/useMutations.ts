import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ApiOptions } from "./api";
import { queryKeys } from "../keys";

type BookingStatus = "approved" | "declined";

type BookingsPayload = {
  myStays: Array<{ id: string; status: string }>;
  atMyPlaces: Array<{ id: string; status: string }>;
};

export function useCreatePlaceMutation(options: ApiOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; address: string }) =>
      apiRequest<{ ok: boolean; data: { id: string; name: string } }>("/api/places", {
        ...options,
        method: "POST",
        body: payload
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.places() });
    }
  });
}

export function useRequestBookingMutation(options: ApiOptions = {}) {
  return useMutation({
    mutationFn: (payload: { placeId: string; startDate: string; endDate: string }) =>
      apiRequest("/api/bookings", {
        ...options,
        method: "POST",
        body: payload
      })
  });
}

export function useAddAvailabilityMutation(options: ApiOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { placeId: string; startDate: string; endDate: string; confirm?: boolean }) =>
      apiRequest("/api/availability", {
        ...options,
        method: "POST",
        body: {
          placeId: payload.placeId,
          ranges: [{ startDate: payload.startDate, endDate: payload.endDate }],
          confirm: payload.confirm
        }
      }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.availability(variables.placeId) });
    }
  });
}

export function useDeleteAvailabilityMutation(options: ApiOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { rangeId: string; placeId: string }) =>
      apiRequest(`/api/availability/${payload.rangeId}/delete`, {
        ...options,
        method: "POST"
      }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.availability(variables.placeId) });
    }
  });
}

export function useUpdateRulesMutation(options: ApiOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { placeId: string; rules: string }) =>
      apiRequest(`/api/places/${payload.placeId}`, {
        ...options,
        method: "PATCH",
        body: { rules: payload.rules }
      }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.place(variables.placeId) });
    }
  });
}

export function useUpdateGuidesMutation(options: ApiOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { placeId: string; entries: Array<{ categoryKey: string; text: string }> }) =>
      apiRequest(`/api/guides/${payload.placeId}`, {
        ...options,
        method: "PUT",
        body: { entries: payload.entries }
      }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.guides(variables.placeId) });
    }
  });
}

export function useUpdateProfileMutation(options: ApiOptions = {}) {
  return useMutation({
    mutationFn: (payload: { displayName: string; handle: string; locale?: string }) =>
      apiRequest("/api/me", {
        ...options,
        method: "PATCH",
        body: payload
      })
  });
}

export function useApproveBookingMutation(options: ApiOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) =>
      apiRequest(`/api/bookings/${bookingId}/approve`, {
        ...options,
        method: "POST"
      }),
    onSuccess: (_, bookingId) => {
      queryClient.setQueryData<{ ok: boolean; data: BookingsPayload } | undefined>(
        queryKeys.bookings("current"),
        (current) => {
          if (!current?.data) {
            return current;
          }
          return {
            ...current,
            data: {
              ...current.data,
              atMyPlaces: current.data.atMyPlaces.map((item) =>
                item.id === bookingId ? { ...item, status: "approved" as BookingStatus } : item
              )
            }
          };
        }
      );
    }
  });
}

export function useDeclineBookingMutation(options: ApiOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) =>
      apiRequest(`/api/bookings/${bookingId}/decline`, {
        ...options,
        method: "POST"
      }),
    onSuccess: (_, bookingId) => {
      queryClient.setQueryData<{ ok: boolean; data: BookingsPayload } | undefined>(
        queryKeys.bookings("current"),
        (current) => {
          if (!current?.data) {
            return current;
          }
          return {
            ...current,
            data: {
              ...current.data,
              atMyPlaces: current.data.atMyPlaces.map((item) =>
                item.id === bookingId ? { ...item, status: "declined" as BookingStatus } : item
              )
            }
          };
        }
      );
    }
  });
}

export function useRevokeInviteMutation(options: ApiOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) =>
      apiRequest(`/api/invites/${inviteId}/revoke`, {
        ...options,
        method: "POST"
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.invites() });
    }
  });
}

export function useUnfriendMutation(options: ApiOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendId: string) =>
      apiRequest("/api/friends/unfriend", {
        ...options,
        method: "POST",
        body: { friendId }
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.friends() });
    }
  });
}

export function useMarkNotificationsReadMutation(options: ApiOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      apiRequest("/api/notifications/read", {
        ...options,
        method: "POST",
        body: { ids }
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications(50) });
    }
  });
}
