"use client";

import { useEffect, useState } from "react";
import { fallbackPlaylists } from "@/data/site";

type Playlist = { id: string; name: string; description?: string; tracks?: number };

export function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/spotify/playlists")
      .then((r) => r.json())
      .then((d: { playlists: Playlist[] }) => {
        if (!alive) return;
        setPlaylists(d.playlists?.length ? d.playlists : fallbackPlaylists);
      })
      .catch(() => alive && setPlaylists(fallbackPlaylists));
    return () => {
      alive = false;
    };
  }, []);

  const shown = (playlists ?? []).slice(0, 4);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-medium tracking-tight text-ink">What I&rsquo;m listening to rn</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
          Public playlists
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {playlists === null
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-[352px] animate-pulse rounded-xl bg-zinc-100" />
            ))
          : shown.map((p) => (
              <iframe
                key={p.id}
                title={p.name || "Spotify playlist"}
                src={`https://open.spotify.com/embed/playlist/${p.id}?utm_source=generator`}
                width="100%"
                height={352}
                style={{ borderRadius: 12 }}
                frameBorder={0}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            ))}
      </div>
    </div>
  );
}
