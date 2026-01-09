export type Locale = "pl" | "en";

export enum FriendshipStatus {
  Pending = "pending",
  Accepted = "accepted"
}

export enum InviteLinkType {
  Single = "single",
  Multi = "multi"
}

export enum PlaceType {
  Apartment = "apartment",
  House = "house"
}

export enum BookingStatus {
  Requested = "requested",
  Approved = "approved",
  Declined = "declined",
  Canceled = "canceled",
  Completed = "completed"
}

export enum GuideCategoryKey {
  Access = "access",
  Sleep = "sleep",
  Wash = "wash",
  EatDrink = "eat_drink",
  Operate = "operate"
}

export enum NotificationType {
  FriendAccepted = "friend_accepted",
  BookingRequested = "booking_requested",
  BookingApproved = "booking_approved",
  BookingDeclined = "booking_declined",
  BookingCanceled = "booking_canceled",
  PlaceDeactivated = "place_deactivated",
  AvailabilityConflict = "availability_conflict",
  InviteSignup = "invite_signup"
}

export enum PushPlatform {
  Expo = "expo"
}
