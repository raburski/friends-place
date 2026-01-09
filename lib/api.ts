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
