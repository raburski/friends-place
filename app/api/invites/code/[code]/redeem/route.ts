import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";
import { createNotification } from "@/lib/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const resolvedParams = await params;
  if (!resolvedParams?.code) {
    return NextResponse.json({ ok: false, error: "missing_code" }, { status: 400 });
  }

  const invite = await prisma.inviteLink.findUnique({
    where: { code: resolvedParams.code }
  });

  if (!invite || invite.revokedAt) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ ok: false, error: "expired" }, { status: 410 });
  }

  if (invite.type === "single" && invite.usedByUserId) {
    return NextResponse.json({ ok: false, error: "already_used" }, { status: 409 });
  }

  if (invite.creatorId === session.user.id) {
    return NextResponse.json(
      { ok: false, error: "cannot_redeem_own_invite" },
      { status: 400 }
    );
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: invite.creatorId, friendId: session.user.id },
        { userId: session.user.id, friendId: invite.creatorId }
      ]
    }
  });

  if (existing) {
    if (existing.status !== "accepted") {
      await prisma.friendship.update({
        where: { id: existing.id },
        data: { status: "accepted" }
      });
    }

    if (invite.type === "single" && !invite.usedByUserId) {
      await prisma.inviteLink.update({
        where: { id: invite.id },
        data: { usedByUserId: session.user.id }
      });
    }

    await createNotification(invite.creatorId, "invite_signup", {
      inviteId: invite.id,
      userId: session.user.id
    });

    return NextResponse.json({ ok: true, data: existing });
  }

  const [friendship] = await prisma.$transaction([
    prisma.friendship.create({
      data: {
        userId: invite.creatorId,
        friendId: session.user.id,
        status: "accepted",
        requestedById: invite.creatorId
      }
    }),
    prisma.inviteLink.update({
      where: { id: invite.id },
      data: invite.type === "single" ? { usedByUserId: session.user.id } : {}
    })
  ]);

  await createNotification(invite.creatorId, "invite_signup", {
    inviteId: invite.id,
    userId: session.user.id
  });

  return NextResponse.json({ ok: true, data: friendship }, { status: 201 });
}
