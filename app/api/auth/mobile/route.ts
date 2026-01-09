import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { unauthorized } from "@/lib/api";
import { isProfileComplete } from "@/lib/profile";

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    data: {
      user,
      profileComplete: isProfileComplete(user)
    }
  });
}
