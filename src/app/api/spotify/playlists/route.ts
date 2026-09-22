import { NextResponse } from "next/server";

// Deprecated: playlists are now a curated list in src/data/site.ts, no API call needed.
// This folder can be deleted.
export function GET() {
  return NextResponse.json({ deprecated: true }, { status: 410 });
}
