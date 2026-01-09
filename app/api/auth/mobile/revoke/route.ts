import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  await prisma.appSession.deleteMany({
    where: { token }
  });

  return NextResponse.json({ ok: true });
}
