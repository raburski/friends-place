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

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
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

  // TODO: notify counterpart about cancellation.

  return NextResponse.json({ ok: true, data: updated });
}
