import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

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

  const [updatedPlace] = await prisma.$transaction([
    prisma.place.update({
      where: { id: place.id },
      data: { isActive: false }
    }),
    prisma.booking.updateMany({
      where: {
        placeId: place.id,
        startDate: { gt: now },
        status: { in: ["requested", "approved"] }
      },
      data: { status: "canceled" }
    })
  ]);

  // TODO: notify guests about cancellations.

  return NextResponse.json({ ok: true, data: updatedPlace });
}
