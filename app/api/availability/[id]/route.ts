import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const availability = await prisma.availabilityRange.findUnique({
    where: { id: params.id },
    include: { place: true }
  });

  if (!availability) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (availability.place.ownerId !== session.user.id) {
    return unauthorized();
  }

  await prisma.availabilityRange.delete({
    where: { id: availability.id }
  });

  // TODO: handle conflicts with existing bookings.

  return NextResponse.json({ ok: true });
}
