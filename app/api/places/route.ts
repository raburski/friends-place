import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized, profileIncomplete } from "@/lib/api";
import { geocodeAddress } from "@/lib/geocoding";
import { timezoneFromCoords } from "@/lib/timezone";
import { isProfileComplete } from "@/lib/profile";

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });
  if (!isProfileComplete(user)) {
    return profileIncomplete();
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
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: {
          id: true,
          displayName: true,
          name: true,
          handle: true
        }
      }
    }
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
  const inputLat = body?.lat;
  const inputLng = body?.lng;
  const inputTimezone = body?.timezone?.trim();

  if (!name || !address) {
    return NextResponse.json(
      { ok: false, error: "invalid_request", message: "Missing required fields" },
      { status: 400 }
    );
  }

  let lat = typeof inputLat === "number" ? inputLat : Number(inputLat);
  let lng = typeof inputLng === "number" ? inputLng : Number(inputLng);
  let timezone = inputTimezone;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    const geocoded = await geocodeAddress(address);
    if (!geocoded) {
      return NextResponse.json(
        { ok: false, error: "geocode_failed" },
        { status: 400 }
      );
    }
    lat = geocoded.lat;
    lng = geocoded.lng;
  }

  if (!timezone) {
    timezone = timezoneFromCoords(lat, lng) ?? undefined;
  }

  if (!timezone) {
    return NextResponse.json(
      { ok: false, error: "timezone_missing" },
      { status: 400 }
    );
  }

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
