import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  if (!code) {
    return NextResponse.json({ ok: false, error: "missing_code" }, { status: 400 });
  }

  const invite = await prisma.inviteLink.findUnique({
    where: { code },
    select: {
      expiresAt: true,
      revokedAt: true,
      creator: {
        select: {
          displayName: true,
          handle: true,
          name: true
        }
      }
    }
  });

  if (!invite || invite.revokedAt) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ ok: false, error: "expired" }, { status: 410 });
  }

  const creator = invite.creator;
  const label = creator.displayName || creator.name || (creator.handle ? `@${creator.handle}` : null);

  return NextResponse.json({
    ok: true,
    data: {
      inviter: label ?? "Znajomy"
    }
  });
}
