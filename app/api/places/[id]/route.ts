import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const place = await prisma.place.findUnique({
    where: { id }
  });

  if (!place) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (place.ownerId !== session.user.id) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: "accepted",
        OR: [
          { userId: session.user.id, friendId: place.ownerId },
          { userId: place.ownerId, friendId: session.user.id }
        ]
      }
    });

    if (!friendship) {
      return unauthorized();
    }
  }

  return NextResponse.json({ ok: true, data: place });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const place = await prisma.place.findUnique({
    where: { id }
  });

  if (!place) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (place.ownerId !== session.user.id) {
    return unauthorized();
  }

  const body = await request.json();

  const updates = {
    name: body?.name?.trim() ?? place.name,
    address: body?.address?.trim() ?? place.address,
    lat: body?.lat !== undefined ? Number(body.lat) : place.lat,
    lng: body?.lng !== undefined ? Number(body.lng) : place.lng,
    timezone: body?.timezone?.trim() ?? place.timezone,
    type: body?.type ?? place.type,
    description: body?.description ?? place.description,
    rules: body?.rules ?? place.rules
  };

  const updated = await prisma.place.update({
    where: { id: place.id },
    data: updates
  });

  return NextResponse.json({ ok: true, data: updated });
}
