import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";

export async function GET(
  request: Request,
  { params }: { params: { placeId: string } }
) {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const ranges = await prisma.availabilityRange.findMany({
    where: { placeId: params.placeId },
    orderBy: { startDate: "asc" }
  });

  return NextResponse.json({ ok: true, data: ranges });
}
