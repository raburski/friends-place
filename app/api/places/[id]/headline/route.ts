import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { unauthorized } from "@/lib/api";
import { createBunnyClient } from "@/lib/bunny";
import { env } from "@/lib/env";

const MAX_HEADLINE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);
const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif"
};

const normalizeExtension = (extension: string) => (extension === "jpeg" ? "jpg" : extension);

const getFileExtension = (filename: string, contentType: string) => {
  const byType = MIME_EXTENSION_MAP[contentType];
  if (byType) {
    return byType;
  }
  const parts = filename.split(".");
  if (parts.length < 2) {
    return "";
  }
  return normalizeExtension(parts[parts.length - 1]?.toLowerCase() ?? "");
};

type FormDataValue = File | string;
type FormDataWithGet = { get: (name: string) => FormDataValue | null };

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireSession(request);
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

  const formData = (await request.formData()) as unknown as FormDataWithGet;
  const file = formData.get("file");
  if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
    return NextResponse.json(
      { ok: false, error: "invalid_file", message: "Missing headline image file." },
      { status: 400 }
    );
  }

  const uploadFile = file as File;
  if (uploadFile.size === 0) {
    return NextResponse.json(
      { ok: false, error: "empty_file", message: "File is empty." },
      { status: 400 }
    );
  }
  if (uploadFile.size > MAX_HEADLINE_BYTES) {
    return NextResponse.json(
      { ok: false, error: "file_too_large", message: "File size exceeds 5MB." },
      { status: 400 }
    );
  }

  const rawContentType = uploadFile.type || "";
  const extension = getFileExtension(uploadFile.name || "headline", rawContentType);
  const contentType =
    rawContentType ||
    (extension ? `image/${extension === "jpg" ? "jpeg" : extension}` : "image/jpeg");
  const isAllowed = ALLOWED_MIME_TYPES.has(contentType) || ALLOWED_EXTENSIONS.has(extension);
  if (!isAllowed) {
    return NextResponse.json(
      { ok: false, error: "unsupported_type", message: "Unsupported image type." },
      { status: 400 }
    );
  }

  const safeExtension = extension || MIME_EXTENSION_MAP[contentType] || "jpg";
  const path = `places/${place.id}/headline-${Date.now()}.${safeExtension}`;
  const buffer = Buffer.from(await uploadFile.arrayBuffer());

  let client: ReturnType<typeof createBunnyClient>;
  try {
    client = createBunnyClient();
  } catch (error) {
    console.error("Missing Bunny CDN configuration:", error);
    return NextResponse.json(
      { ok: false, error: "cdn_not_configured", message: "CDN configuration missing." },
      { status: 500 }
    );
  }
  const uploadContentType = contentType === "image/jpg" ? "image/jpeg" : contentType || "image/jpeg";
  const uploadResult = await client.uploadBuffer(buffer, path, uploadContentType);

  if (!uploadResult.success || !uploadResult.url) {
    return NextResponse.json(
      { ok: false, error: "upload_failed", message: uploadResult.error ?? "Upload failed." },
      { status: 502 }
    );
  }

  const updated = await prisma.place.update({
    where: { id: place.id },
    data: { headlineImageUrl: uploadResult.url }
  });

  const previousUrl = place.headlineImageUrl;
  if (previousUrl && previousUrl !== uploadResult.url) {
    const pullZoneUrl = env.bunnyPullZoneUrl();
    if (previousUrl.startsWith(pullZoneUrl)) {
      client
        .deleteFileByUrl(previousUrl, `places/${place.id}`)
        .catch((error) => console.warn("Failed to delete old headline image:", error));
    }
  }

  return NextResponse.json({ ok: true, data: updated }, { status: 201 });
}
