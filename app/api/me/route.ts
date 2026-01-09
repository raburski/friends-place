import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";
import { isValidHandle } from "@/shared/validation/handle";
import { normalizeHandle } from "@/lib/handles";

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

  return NextResponse.json({ ok: true, data: user });
}

export async function PATCH(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const body = await request.json();
  const displayName = body?.displayName?.trim();
  const handle = body?.handle?.trim();
  const locale = body?.locale?.trim();

  if (!displayName || !handle) {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400 }
    );
  }

  if (!isValidHandle(handle)) {
    return NextResponse.json(
      { ok: false, error: "invalid_handle" },
      { status: 400 }
    );
  }

  const handleLower = normalizeHandle(handle);

  const existing = await prisma.user.findFirst({
    where: {
      handleLower
    }
  });

  if (existing && existing.id !== session.user.id) {
    return NextResponse.json(
      { ok: false, error: "handle_taken" },
      { status: 409 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName,
      handle,
      handleLower,
      locale: locale ?? undefined
    }
  });

  return NextResponse.json({ ok: true, data: updated });
}
