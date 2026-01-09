import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

type RangeInput = {
  startDate: string;
  endDate: string;
};

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const body = await request.json();
  const placeId = body?.placeId;
  const ranges: RangeInput[] = Array.isArray(body?.ranges) ? body.ranges : [];

  if (!placeId || ranges.length === 0) {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400 }
    );
  }

  const place = await prisma.place.findUnique({
    where: { id: placeId }
  });

  if (!place) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (place.ownerId !== session.user.id) {
    return unauthorized();
  }

  const data = ranges
    .map((range) => ({
      placeId,
      startDate: new Date(range.startDate),
      endDate: new Date(range.endDate)
    }))
    .filter((range) => !Number.isNaN(range.startDate.getTime()) && !Number.isNaN(range.endDate.getTime()));

  if (data.length === 0) {
    return NextResponse.json(
      { ok: false, error: "invalid_dates" },
      { status: 400 }
    );
  }

  const created = await prisma.availabilityRange.createMany({
    data
  });

  // TODO: detect conflicts with existing bookings and require confirmation.

  return NextResponse.json({ ok: true, data: created });
}
