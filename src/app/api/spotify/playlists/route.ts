import { NextResponse } from "next/server";
import { playlists } from "@/data/site";
import { accessToken, spotifyCreds } from "@/lib/spotify";

export type PlaylistInfo = {
  id: string;
  name: string;
  description: string;
  url: string;
  image: string | null;
  total: number | null;
  tracks: { name: string; artists: string }[];
};

// playlists change rarely; refresh hourly
export const revalidate = 3600;

const FIELDS =
  "name,description,external_urls(spotify),images(url),tracks(total,items(track(name,artists(name))))";

async function viaApi(id: string, token: string): Promise<PlaylistInfo> {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${id}?fields=${encodeURIComponent(FIELDS)}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`playlist ${res.status}`);
  const j = (await res.json()) as {
    name: string;
    description?: string;
    external_urls: { spotify: string };
    images?: { url: string }[];
    tracks: { total: number; items: { track: { name: string; artists: { name: string }[] } | null }[] };
  };
  return {
    id,
    name: j.name,
    description: (j.description ?? "").replace(/<[^>]+>/g, ""),
    url: j.external_urls.spotify,
    image: j.images?.[0]?.url ?? null,
    total: j.tracks.total,
    tracks: j.tracks.items
      .filter((i) => i.track)
      .slice(0, 8)
      .map((i) => ({ name: i.track!.name, artists: i.track!.artists.map((a) => a.name).join(", ") })),
  };
}

/* no credentials: Spotify's public oEmbed still gives a name and cover */
async function viaOembed(id: string): Promise<PlaylistInfo> {
  const url = `https://open.spotify.com/playlist/${id}`;
  const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`, { next: { revalidate } });
  const j = res.ok ? ((await res.json()) as { title?: string; thumbnail_url?: string }) : {};
  return { id, name: j.title ?? "Playlist", description: "", url, image: j.thumbnail_url ?? null, total: null, tracks: [] };
}

export async function GET() {
  const creds = spotifyCreds();
  let token: string | null = null;
  if (creds) {
    try {
      token = await accessToken(creds.id, creds.secret, creds.refresh);
    } catch (err) {
      console.error("[spotify playlists] token", err);
    }
  }
  const bare = (id: string, i: number): PlaylistInfo => ({
    id,
    name: `Playlist ${i + 1}`,
    description: "",
    url: `https://open.spotify.com/playlist/${id}`,
    image: null,
    total: null,
    tracks: [],
  });
  const out = await Promise.all(
    playlists.map(async ({ id }, i) => {
      try {
        return token ? await viaApi(id, token) : await viaOembed(id);
      } catch {
        // Spotify unreachable: still list it, so it can be opened
        return viaOembed(id).catch(() => bare(id, i));
      }
    })
  );
  return NextResponse.json({ playlists: out });
}
