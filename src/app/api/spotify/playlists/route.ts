import { NextResponse } from "next/server";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const LIST_URL = "https://api.spotify.com/v1/me/playlists?limit=50";

type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string;
  public: boolean;
  owner: { id: string };
  tracks: { total: number };
};

async function accessToken(id: string, secret: string, refresh: string) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
    // access tokens live an hour; cache below that so the route can still revalidate
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("no access_token in response");
  return json.access_token;
}

export const revalidate = 3600;

export async function GET() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!id || !secret || !refresh) {
    return NextResponse.json({ configured: false, playlists: [] });
  }

  try {
    const token = await accessToken(id, secret, refresh);
    const res = await fetch(LIST_URL, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate },
    });
    // 403 means the refresh token predates the playlist-read-private scope.
    if (!res.ok) throw new Error(`playlists ${res.status}`);

    const json = (await res.json()) as { items?: SpotifyPlaylist[] };
    const playlists = (json.items ?? [])
      .filter((p) => p.public && p.tracks.total > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        tracks: p.tracks.total,
      }));

    return NextResponse.json({ configured: true, playlists });
  } catch (err) {
    console.error("[spotify playlists]", err);
    return NextResponse.json({ configured: true, playlists: [], error: true });
  }
}
