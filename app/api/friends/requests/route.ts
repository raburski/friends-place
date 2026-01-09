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

  const requests = await prisma.friendship.findMany({
    where: {
      status: "pending",
      friendId: userId
    },
    include: {
      user: true
    },
    orderBy: { createdAt: "desc" }
  });

  const data = requests.map((request) => ({
    friendshipId: request.id,
    requesterId: request.userId,
    handle: request.user.handle,
    displayName: request.user.displayName,
    createdAt: request.createdAt
  }));

  return NextResponse.json({ ok: true, data });
}
