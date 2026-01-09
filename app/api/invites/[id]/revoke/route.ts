import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const invite = await prisma.inviteLink.findUnique({
    where: { id: params.id }
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
