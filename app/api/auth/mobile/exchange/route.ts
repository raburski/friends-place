import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { unauthorized } from "@/lib/api";

const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

export async function POST() {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS);

  const appSession = await prisma.appSession.create({
    data: {
      userId: session.user.id,
      token,
      expiresAt
    }
  });

  return NextResponse.json({
    ok: true,
    data: {
      token: appSession.token,
      expiresAt: appSession.expiresAt.toISOString()
    }
  });
}
