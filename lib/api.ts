import { NextResponse } from "next/server";

export function notImplemented(message: string) {
  return NextResponse.json(
    {
      ok: false,
      error: "not_implemented",
      message
    },
    { status: 501 }
  );
}

export function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "unauthorized" },
    { status: 401 }
  );
}
