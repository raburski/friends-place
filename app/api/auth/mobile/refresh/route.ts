import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/tokens";

const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const session = await prisma.appSession.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() }
    }
  });

  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const newToken = generateToken();
  const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS);

  await prisma.appSession.update({
    where: { id: session.id },
    data: {
      token: newToken,
      expiresAt
    }
  });

  return NextResponse.json({
    ok: true,
    data: {
      token: newToken,
      expiresAt: expiresAt.toISOString()
    }
  });
}
