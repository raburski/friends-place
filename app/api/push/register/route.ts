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
  const token = body?.token?.trim();

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400 }
    );
  }

  const existing = await prisma.pushToken.findUnique({
    where: { token }
  });

  if (existing) {
    if (existing.userId !== session.user.id) {
      await prisma.pushToken.update({
        where: { token },
        data: { userId: session.user.id }
      });
    }

    return NextResponse.json({ ok: true, data: existing });
  }

  const created = await prisma.pushToken.create({
    data: {
      token,
      userId: session.user.id,
      platform: "expo"
    }
  });

  return NextResponse.json({ ok: true, data: created }, { status: 201 });
}
