import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const userId = session.user.id;

  const [myStays, atMyPlaces] = await Promise.all([
    prisma.booking.findMany({
      where: { guestId: userId },
      orderBy: { startDate: "desc" }
    }),
    prisma.booking.findMany({
      where: { place: { ownerId: userId } },
      orderBy: { startDate: "desc" },
      include: { place: true }
    })
  ]);

  return NextResponse.json({ ok: true, data: { myStays, atMyPlaces } });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const body = await request.json();
  const placeId = body?.placeId;
  const startDate = new Date(body?.startDate);
  const endDate = new Date(body?.endDate);

  if (!placeId || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400 }
    );
  }

  if (endDate <= startDate) {
    return NextResponse.json(
      { ok: false, error: "invalid_dates" },
      { status: 400 }
    );
  }

  const place = await prisma.place.findUnique({
    where: { id: placeId }
  });

  if (!place || !place.isActive) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (place.ownerId === session.user.id) {
    return NextResponse.json(
      { ok: false, error: "cannot_book_own_place" },
      { status: 400 }
    );
  }

  const availability = await prisma.availabilityRange.findFirst({
    where: {
      placeId,
      startDate: { lte: startDate },
      endDate: { gte: endDate }
    }
  });

  if (!availability) {
    return NextResponse.json(
      { ok: false, error: "no_availability" },
      { status: 400 }
    );
  }

  const conflictPlace = await prisma.booking.findFirst({
    where: {
      placeId,
      status: { in: ["requested", "approved"] },
      startDate: { lt: endDate },
      endDate: { gt: startDate }
    }
  });

  if (conflictPlace) {
    return NextResponse.json(
      { ok: false, error: "place_unavailable" },
      { status: 409 }
    );
  }

  const conflictGuest = await prisma.booking.findFirst({
    where: {
      guestId: session.user.id,
      status: { in: ["requested", "approved"] },
      startDate: { lt: endDate },
      endDate: { gt: startDate }
    }
  });

  if (conflictGuest) {
    return NextResponse.json(
      { ok: false, error: "guest_unavailable" },
      { status: 409 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      placeId,
      guestId: session.user.id,
      startDate,
      endDate,
      status: "requested"
    }
  });

  // TODO: notify owner about booking request.

  return NextResponse.json({ ok: true, data: booking }, { status: 201 });
}
