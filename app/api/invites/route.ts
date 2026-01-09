import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

function randomCode() {
  return Math.random().toString(36).slice(2, 10);
}

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const invites = await prisma.inviteLink.findMany({
    where: { creatorId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ ok: true, data: invites });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const body = await request.json();
  const type = body?.type === "single" ? "single" : "multi";
  const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null;

  const invite = await prisma.inviteLink.create({
    data: {
      creatorId: session.user.id,
      type,
      code: randomCode(),
      expiresAt: expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
    }
  });

  return NextResponse.json({ ok: true, data: invite }, { status: 201 });
}
