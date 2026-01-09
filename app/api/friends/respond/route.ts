import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const body = await request.json();
  const friendshipId = body?.friendshipId;
  const accept = Boolean(body?.accept);

  if (!friendshipId) {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400 }
    );
  }

  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId }
  });

  if (!friendship) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (friendship.friendId !== session.user.id && friendship.userId !== session.user.id) {
    return unauthorized();
  }

  if (accept) {
    const updated = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: "accepted" }
    });

    // TODO: notify requester about acceptance.

    return NextResponse.json({ ok: true, data: updated });
  }

  await prisma.friendship.delete({
    where: { id: friendship.id }
  });

  return NextResponse.json({ ok: true });
}
