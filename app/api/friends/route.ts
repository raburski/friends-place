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

  const friends = friendships.map((friendship) => {
    const friend = friendship.userId === userId ? friendship.friend : friendship.user;
    return {
      friendshipId: friendship.id,
      friendId: friend.id,
      handle: friend.handle,
      displayName: friend.displayName,
      createdAt: friendship.createdAt
    };
  });

  return NextResponse.json({ ok: true, data: friends });
}
