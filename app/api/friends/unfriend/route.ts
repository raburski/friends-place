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
  const friendId = body?.friendId;

  if (!friendId) {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400 }
    );
  }

  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { userId: session.user.id, friendId },
        { userId: friendId, friendId: session.user.id }
      ]
    }
  });

  return NextResponse.json({ ok: true });
}
