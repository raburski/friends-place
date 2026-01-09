import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const userId = session.user.id;

  const friendships = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ userId }, { friendId: userId }]
    },
    include: {
      user: true,
      friend: true
    },
    orderBy: { createdAt: "desc" }
  });

  const friendsMap = new Map<string, { friendshipId: string; friendId: string; handle?: string; displayName?: string; createdAt: Date }>();
  friendships.forEach((friendship) => {
    const friend = friendship.userId === userId ? friendship.friend : friendship.user;
    if (!friendsMap.has(friend.id)) {
      friendsMap.set(friend.id, {
        friendshipId: friendship.id,
        friendId: friend.id,
        handle: friend.handle ?? undefined,
        displayName: friend.displayName ?? undefined,
        createdAt: friendship.createdAt
      });
    }
  });

  const friends = Array.from(friendsMap.values());

  return NextResponse.json({ ok: true, data: friends });
}
