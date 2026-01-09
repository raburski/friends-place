import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params;
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  if (!placeId) {
    return NextResponse.json({ ok: false, error: "missing_place_id" }, { status: 400 });
  }

  const place = await prisma.place.findUnique({
    where: { id: placeId }
  });

  if (!place) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const ranges = await prisma.availabilityRange.findMany({
    where: { placeId },
    orderBy: { startDate: "asc" }
  });

  return NextResponse.json({
    ok: true,
    data: {
      ranges,
      isOwner: place.ownerId === session.user.id
    }
  });
}
