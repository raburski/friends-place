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

  const friendships = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ userId }, { friendId: userId }]
    },
    select: {
      userId: true,
      friendId: true
    }
  });

  const friendIds = new Set<string>();
  for (const friendship of friendships) {
    const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
    friendIds.add(friendId);
  }

  const places = await prisma.place.findMany({
    where: {
      ownerId: { in: [userId, ...Array.from(friendIds)] },
      isActive: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ ok: true, data: places });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }
  const userId = session.user.id;
  const body = await request.json();

  const name = body?.name?.trim();
  const address = body?.address?.trim();
  const lat = Number(body?.lat);
  const lng = Number(body?.lng);
  const timezone = body?.timezone?.trim();

  if (!name || !address || Number.isNaN(lat) || Number.isNaN(lng) || !timezone) {
    return NextResponse.json(
      { ok: false, error: "invalid_request", message: "Missing required fields" },
      { status: 400 }
    );
  }

  // TODO: server-side geocoding + timezone derivation via Nominatim.

  const place = await prisma.place.create({
    data: {
      ownerId: userId,
      name,
      address,
      lat,
      lng,
      timezone,
      type: body?.type ?? null,
      description: body?.description ?? null,
      rules: body?.rules ?? null,
      isActive: true
    }
  });

  return NextResponse.json({ ok: true, data: place }, { status: 201 });
}
