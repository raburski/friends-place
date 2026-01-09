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

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "declined" }
  });

  await createNotification(booking.guestId, "booking_declined", {
    bookingId: booking.id,
    placeId: booking.placeId,
    ownerId: session.user.id
  });

  return NextResponse.json({ ok: true, data: updated });
}
