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

  const place = await prisma.place.findUnique({
    where: { id: params.id }
  });

  if (!place) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (place.ownerId !== session.user.id) {
    return unauthorized();
  }

  const now = new Date();

  const [updatedPlace, canceledBookings] = await prisma.$transaction([
    prisma.place.update({
      where: { id: place.id },
      data: { isActive: false }
    }),
    prisma.booking.findMany({
      where: {
        placeId: place.id,
        startDate: { gt: now },
        status: { in: ["requested", "approved"] }
      },
    })
  ]);

  if (canceledBookings.length > 0) {
    await prisma.booking.updateMany({
      where: { id: { in: canceledBookings.map((booking) => booking.id) } },
      data: { status: "canceled" }
    });

    await Promise.all(
      canceledBookings.map((booking) =>
        createNotification(booking.guestId, "place_deactivated", {
          placeId: place.id,
          bookingId: booking.id,
          placeName: place.name,
          startDate: booking.startDate.toISOString(),
          endDate: booking.endDate.toISOString()
        })
      )
    );
  }

  return NextResponse.json({ ok: true, data: updatedPlace });
}
