import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";
import { createNotification } from "@/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { place: true }
  });

  if (!booking) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const isOwner = booking.place.ownerId === session.user.id;
  const isGuest = booking.guestId === session.user.id;

  if (!isOwner && !isGuest) {
    return unauthorized();
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "canceled" }
  });

  const recipientId = isOwner ? booking.guestId : booking.place.ownerId;

  await createNotification(recipientId, "booking_canceled", {
    bookingId: booking.id,
    placeId: booking.placeId,
    placeName: booking.place.name,
    canceledById: session.user.id,
    startDate: booking.startDate.toISOString(),
    endDate: booking.endDate.toISOString()
  });

  return NextResponse.json({ ok: true, data: updated });
}
