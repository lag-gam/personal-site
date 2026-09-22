"use client";

import { useEffect, useState } from "react";

type Track = {
  name: string;
  artists: string;
  album: string;
  url: string;
  image: string | null;
};

export function SpotifyTop() {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/spotify/top")
      .then((r) => r.json())
      .then((d: { configured: boolean; tracks: Track[] }) => {
        if (!alive) return;
        setConfigured(d.configured);
        setTracks(d.tracks ?? []);
      })
      .catch(() => alive && setTracks([]));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 md:p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-medium tracking-tight text-ink">On repeat</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
          Last 4 weeks
        </span>
      </div>

      {tracks === null && (
        <ul className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-zinc-100" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-2 w-1/3 animate-pulse rounded-full bg-zinc-100" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {tracks !== null && tracks.length === 0 && (
        <p className="mt-5 text-[14px] leading-relaxed text-zinc-400">
          {configured
            ? "Spotify didn't return anything just now."
            : "Not connected yet. Add the Spotify keys to .env.local and this fills in."}
        </p>
      )}

      {tracks !== null && tracks.length > 0 && (
        <ol className="mt-5 space-y-1">
          {tracks.map((t, i) => (
            <li key={t.url}>
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-sand"
              >
                <span className="w-4 shrink-0 font-mono text-[11px] text-zinc-300">
                  {i + 1}
                </span>
                {t.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={t.image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-ink group-hover:text-forest">
                    {t.name}
                  </span>
                  <span className="block truncate text-[12px] text-zinc-500">{t.artists}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
