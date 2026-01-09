import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

const CATEGORY_KEYS = ["access", "sleep", "wash", "eat_drink", "operate"] as const;

type GuidePayload = {
  categoryKey: (typeof CATEGORY_KEYS)[number];
  text: string;
};

export async function GET(
  request: Request,
  { params }: { params: { placeId: string } }
) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const guides = await prisma.guideEntry.findMany({
    where: { placeId: params.placeId },
    orderBy: { categoryKey: "asc" }
  });

  return NextResponse.json({ ok: true, data: guides });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const place = await prisma.place.findUnique({
    where: { id: params.placeId }
  });

  if (!place) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (place.ownerId !== session.user.id) {
    return unauthorized();
  }

  const body = await request.json();
  const entries: GuidePayload[] = Array.isArray(body?.entries) ? body.entries : [];

  const filtered = entries.filter(
    (entry) => CATEGORY_KEYS.includes(entry.categoryKey) && typeof entry.text === "string"
  );

  await prisma.$transaction(
    filtered.map((entry) =>
      prisma.guideEntry.upsert({
        where: {
          placeId_categoryKey: {
            placeId: place.id,
            categoryKey: entry.categoryKey
          }
        },
        update: { text: entry.text },
        create: {
          placeId: place.id,
          categoryKey: entry.categoryKey,
          text: entry.text
        }
      })
    )
  );

  const updated = await prisma.guideEntry.findMany({
    where: { placeId: place.id },
    orderBy: { categoryKey: "asc" }
  });

  return NextResponse.json({ ok: true, data: updated });
}
