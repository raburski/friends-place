import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";
import { isValidHandle } from "@/shared/validation/handle";

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const body = await request.json();
  const handle = body?.handle?.trim();

  if (!handle || !isValidHandle(handle)) {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400 }
    );
  }

  const target = await prisma.user.findFirst({
    where: {
      handle: {
        equals: handle,
        mode: "insensitive"
      }
    }
  });

  if (!target) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (target.id === session.user.id) {
    return NextResponse.json(
      { ok: false, error: "cannot_friend_self" },
      { status: 400 }
    );
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: session.user.id, friendId: target.id },
        { userId: target.id, friendId: session.user.id }
      ]
    }
  });

  if (existing) {
    return NextResponse.json(
      { ok: true, data: existing },
      { status: 200 }
    );
  }

  const friendship = await prisma.friendship.create({
    data: {
      userId: session.user.id,
      friendId: target.id,
      status: "pending",
      requestedById: session.user.id
    }
  });

  // TODO: notify target about friend request.

  return NextResponse.json({ ok: true, data: friendship }, { status: 201 });
}
