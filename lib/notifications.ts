import { prisma } from "@/lib/prisma";

type Payload = Record<string, unknown>;

export async function createNotification(
  userId: string,
  type:
    | "friend_accepted"
    | "booking_requested"
    | "booking_approved"
    | "booking_declined"
    | "booking_canceled"
    | "place_deactivated"
    | "availability_conflict"
    | "invite_signup",
  payload: Payload
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      payload
    }
  });
}
