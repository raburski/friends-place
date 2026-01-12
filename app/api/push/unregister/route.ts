import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return unauthorized();
  }

  let token: string | null = null;
  try {
    const body = await request.json();
    token = typeof body?.token === "string" ? body.token.trim() : null;
  } catch {
    token = null;
  }

  if (token) {
    await prisma.pushToken.deleteMany({
      where: {
        token,
        userId: session.user.id
      }
    });

    return NextResponse.json({ ok: true });
  }

  const deleted = await prisma.pushToken.deleteMany({
    where: { userId: session.user.id }
  });

  return NextResponse.json({ ok: true, data: { deleted: deleted.count } });
}
