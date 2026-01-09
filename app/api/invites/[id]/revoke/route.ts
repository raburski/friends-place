import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id?: string }> }
) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const params = await context.params;
  const inviteId = params?.id;
  if (!inviteId) {
    return NextResponse.json(
      { ok: false, error: "missing_id" },
      { status: 400 }
    );
  }

  const invite = await prisma.inviteLink.findUnique({
    where: { id: inviteId }
  });

  if (!invite) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (invite.creatorId !== session.user.id) {
    return unauthorized();
  }

  const updated = await prisma.inviteLink.update({
    where: { id: invite.id },
    data: { revokedAt: new Date() }
  });

  return NextResponse.json({ ok: true, data: updated });
}
