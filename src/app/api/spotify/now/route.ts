import { NextResponse } from "next/server";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENT_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

type Track = {
  name: string;
  external_urls: { spotify: string };
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
};

async function accessToken(id: string, secret: string, refresh: string) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("no access_token in response");
  return json.access_token;
}

const shape = (t: Track, playing: boolean, progress_ms: number | null) => ({
  playing,
  name: t.name,
  artists: t.artists.map((a) => a.name).join(", "),
  album: t.album.name,
  url: t.external_urls.spotify,
  image: t.album.images[1]?.url ?? t.album.images[0]?.url ?? null,
  progress_ms,
  duration_ms: t.duration_ms,
});

// now playing has to be live, so never cache this one
export const dynamic = "force-dynamic";

export async function GET() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!id || !secret || !refresh) {
    return NextResponse.json({ configured: false, track: null });
  }

  try {
    const token = await accessToken(id, secret, refresh);
    const headers = { Authorization: `Bearer ${token}` };

    const now = await fetch(NOW_URL, { headers, cache: "no-store" });

    // 204 = nothing playing right now
    if (now.status === 200) {
      const json = (await now.json()) as {
        is_playing: boolean;
        progress_ms: number | null;
        item: Track | null;
      };
      if (json.item) {
        return NextResponse.json({
          configured: true,
          track: shape(json.item, json.is_playing, json.progress_ms),
        });
      }
    }

    // fall back to the last thing played
    const recent = await fetch(RECENT_URL, { headers, cache: "no-store" });
    if (recent.ok) {
      const json = (await recent.json()) as { items?: { track: Track }[] };
      const last = json.items?.[0]?.track;
      if (last) {
        return NextResponse.json({ configured: true, track: shape(last, false, null) });
      }
    }

    return NextResponse.json({ configured: true, track: null });
  } catch (err) {
    console.error("[spotify now]", err);
    return NextResponse.json({ configured: true, track: null, error: true });
  }
}
