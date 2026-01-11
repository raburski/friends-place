import {
  BookingStatus,
  FriendshipStatus,
  GuideCategoryKey,
  InviteLinkType,
  Locale,
  NotificationType,
  PlaceType,
  PushPlatform
} from "./enums";

export type Id = string;

export interface User {
  id: Id;
  handle: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
  locale: Locale;
  createdAt: string;
}

export interface Friendship {
  id: Id;
  userId: Id;
  friendId: Id;
  status: FriendshipStatus;
  requestedById: Id;
  createdAt: string;
}

export interface InviteLink {
  id: Id;
  creatorId: Id;
  type: InviteLinkType;
  code: string;
  expiresAt: string;
  revokedAt?: string | null;
  usedByUserId?: Id | null;
  createdAt: string;
}

export interface Place {
  id: Id;
  ownerId: Id;
  name: string;
  address: string;
  lat: number;
  lng: number;
  timezone: string;
  type?: PlaceType | null;
  description?: string | null;
  rules?: string | null;
  headlineImageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AvailabilityRange {
  id: Id;
  placeId: Id;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Booking {
  id: Id;
  placeId: Id;
  guestId: Id;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  createdAt: string;
}

export interface GuideEntry {
  id: Id;
  placeId: Id;
  categoryKey: GuideCategoryKey;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: Id;
  userId: Id;
  type: NotificationType;
  payload: Record<string, unknown>;
  readAt?: string | null;
  createdAt: string;
}

export interface PushToken {
  id: Id;
  userId: Id;
  token: string;
  platform: PushPlatform;
  createdAt: string;
}
