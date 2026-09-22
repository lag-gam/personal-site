"use client";

import { useEffect, useState } from "react";

type Track = {
  playing: boolean;
  name: string;
  artists: string;
  album: string;
  url: string;
  image: string | null;
  progress_ms: number | null;
  duration_ms: number;
};

export function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/spotify/now")
        .then((r) => r.json())
        .then((d: { track: Track | null }) => {
          if (!alive) return;
          setTrack(d.track);
          setLoaded(true);
        })
        .catch(() => alive && setLoaded(true));

    load();
    const id = setInterval(load, 30_000); // poll while the tab is open
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const pct =
    track?.progress_ms && track.duration_ms
      ? Math.min(100, (track.progress_ms / track.duration_ms) * 100)
      : 0;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 md:p-6">
      <div className="flex items-center gap-2">
        {track?.playing ? (
          <span className="flex h-2 w-2">
            <span className="absolute h-2 w-2 animate-ping rounded-full bg-forest/60" />
            <span className="h-2 w-2 rounded-full bg-forest" />
          </span>
        ) : (
          <span className="h-2 w-2 rounded-full bg-zinc-300" />
        )}
        <h3 className="text-lg font-medium tracking-tight text-ink">
          {track?.playing ? "Playing now" : "Last played"}
        </h3>
      </div>

      {!loaded && (
        <div className="mt-5 flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-xl bg-zinc-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-zinc-100" />
            <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-zinc-100" />
          </div>
        </div>
      )}

      {loaded && !track && (
        <p className="mt-5 text-[14px] leading-relaxed text-zinc-400">
          Nothing playing right now.
        </p>
      )}

      {loaded && track && (
        <a
          href={track.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-5 block"
        >
          <div className="flex items-center gap-4">
            {track.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={track.image}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-100" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-ink group-hover:text-forest">
                {track.name}
              </p>
              <p className="truncate text-[13px] text-zinc-500">{track.artists}</p>
              <p className="truncate text-[12px] text-zinc-400">{track.album}</p>
            </div>
          </div>

          {track.playing && (
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-forest transition-[width] duration-1000 ease-linear"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </a>
      )}
    </div>
  );
}
