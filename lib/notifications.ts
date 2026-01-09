import { prisma } from "@/lib/prisma";
import { pushPayload, sendExpoPush } from "@/lib/push";

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
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      payload
    }
  });

  const tokens = await prisma.pushToken.findMany({
    where: { userId }
  });

  if (tokens.length > 0) {
    const message = pushPayload(type);
    await sendExpoPush(
      tokens.map((token) => ({
        to: token.token,
        title: message.title,
        body: message.body,
        data: { type, ...payload }
      }))
    );
  }

  return notification;
}
