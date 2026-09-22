import { NextResponse } from "next/server";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const TOP_URL =
  "https://api.spotify.com/v1/me/top/tracks?limit=8&time_range=short_term";

type SpotifyTrack = {
  name: string;
  external_urls: { spotify: string };
  artists: { name: string }[];
  album: { name: string; images: { url: string; width: number }[] };
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

export const revalidate = 3600; // refresh at most once an hour

export async function GET() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;

  // Not wired up yet: answer cleanly so the UI can show a neutral state.
  if (!id || !secret || !refresh) {
    return NextResponse.json({ configured: false, tracks: [] });
  }

  try {
    const token = await accessToken(id, secret, refresh);
    const res = await fetch(TOP_URL, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate },
    });
    if (!res.ok) throw new Error(`top tracks ${res.status}`);

    const json = (await res.json()) as { items?: SpotifyTrack[] };
    const tracks = (json.items ?? []).map((t) => ({
      name: t.name,
      artists: t.artists.map((a) => a.name).join(", "),
      album: t.album.name,
      url: t.external_urls.spotify,
      image: t.album.images.at(-1)?.url ?? t.album.images[0]?.url ?? null,
    }));

    return NextResponse.json({ configured: true, tracks });
  } catch (err) {
    console.error("[spotify]", err);
    return NextResponse.json({ configured: true, tracks: [], error: true }, { status: 200 });
  }
}
