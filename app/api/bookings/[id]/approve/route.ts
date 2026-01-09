import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";
import { createNotification } from "@/lib/notifications";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { place: true }
  });

  if (!booking) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (booking.place.ownerId !== session.user.id) {
    return unauthorized();
  }

  if (booking.status !== "requested") {
    return NextResponse.json(
      { ok: false, error: "invalid_status" },
      { status: 400 }
    );
  }

  const conflictPlace = await prisma.booking.findFirst({
    where: {
      placeId: booking.placeId,
      status: "approved",
      startDate: { lt: booking.endDate },
      endDate: { gt: booking.startDate }
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
      guestId: booking.guestId,
      status: "approved",
      startDate: { lt: booking.endDate },
      endDate: { gt: booking.startDate }
    }
  });

  if (conflictGuest) {
    return NextResponse.json(
      { ok: false, error: "guest_unavailable" },
      { status: 409 }
    );
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "approved" }
  });

  await createNotification(booking.guestId, "booking_approved", {
    bookingId: booking.id,
    placeId: booking.placeId,
    placeName: booking.place.name,
    ownerId: session.user.id,
    startDate: booking.startDate.toISOString(),
    endDate: booking.endDate.toISOString()
  });

  return NextResponse.json({ ok: true, data: updated });
}
