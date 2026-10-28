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
  tracks: { name: string; artists: string; album: string; image: string | null; url: string; duration_ms: number }[];
};

/** where the data came from, so a missing key or a Spotify change is visible at /api/spotify/playlists */
type Source = "api" | "oembed" | "none";

export const dynamic = "force-dynamic";
const revalidate = 3600;

type RawTrack = {
  name: string;
  duration_ms: number;
  external_urls: { spotify: string };
  artists: { name: string }[];
  album: { name: string; images?: { url: string }[] };
} | null;

/*
  Spotify's February 2026 Web API update renamed a playlist's `tracks` to `items`, and each
  entry's `track` to `item`. Read either shape so this keeps working on old and new responses.
  Contents only come back for playlists the account owns or collaborates on.
*/
async function viaApi(id: string, token: string): Promise<PlaylistInfo> {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`playlist ${res.status}`);
  const j = (await res.json()) as {
    name: string;
    description?: string;
    external_urls: { spotify: string };
    images?: { url: string }[] | null;
    items?: { total?: number; items?: { item?: RawTrack; track?: RawTrack }[] };
    tracks?: { total?: number; items?: { item?: RawTrack; track?: RawTrack }[] };
  };
  const list = j.items ?? j.tracks;
  const entries = (list?.items ?? []).map((e) => e.item ?? e.track ?? null).filter((t): t is NonNullable<RawTrack> => !!t);
  return {
    id,
    name: j.name,
    description: (j.description ?? "").replace(/<[^>]+>/g, ""),
    url: j.external_urls.spotify,
    image: j.images?.[0]?.url ?? null,
    total: list?.total ?? null,
    tracks: entries.slice(0, 50).map((t) => ({
      name: t.name,
      artists: t.artists.map((a) => a.name).join(", "),
      album: t.album.name,
      image: t.album.images?.at(-1)?.url ?? t.album.images?.[0]?.url ?? null,
      url: t.external_urls.spotify,
      duration_ms: t.duration_ms,
    })),
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
  const problems: string[] = [];
  let token: string | null = null;
  if (!creds) problems.push("Spotify keys are not set on this deployment");
  else {
    try {
      token = await accessToken(creds.id, creds.secret, creds.refresh);
    } catch (err) {
      problems.push(`sign-in failed (${(err as Error).message})`);
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

  let source: Source = token ? "api" : "oembed";
  const out = await Promise.all(
    playlists.map(async ({ id }, i) => {
      if (token) {
        try {
          return await viaApi(id, token);
        } catch (err) {
          problems.push(`${id}: ${(err as Error).message}`);
          source = "oembed";
        }
      }
      return viaOembed(id).catch(() => {
        source = "none";
        return bare(id, i);
      });
    })
  );

  // a good answer is cached at the edge for an hour; a degraded one only briefly, so a fix shows up fast
  const ok = source === "api" && problems.length === 0;
  return NextResponse.json(
    { playlists: out, source, problems },
    {
      headers: {
        "Cache-Control": ok
          ? "public, s-maxage=3600, stale-while-revalidate=86400"
          : "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
