import { NextResponse } from "next/server";

// Deprecated: the On repeat list was replaced by the live now-playing card.
// This folder can be deleted.
export function GET() {
  return NextResponse.json({ deprecated: true }, { status: 410 });
}
