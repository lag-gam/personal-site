"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gallery } from "@/data/site";

export function Carousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  const items = gallery.filter((g) => !broken[g.src]);

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[i] as HTMLElement | undefined;
    if (child) track.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  }, []);

  const go = useCallback(
    (dir: -1 | 1) => {
      const next = Math.min(Math.max(index + dir, 0), items.length - 1);
      setIndex(next);
      scrollTo(next);
    },
    [index, items.length, scrollTo]
  );

  // keep the dots honest when someone swipes or scrolls the track directly
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf: number | null = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const children = Array.from(track.children) as HTMLElement[];
        const mid = track.scrollLeft + track.clientWidth / 2;
        let closest = 0;
        let best = Infinity;
        children.forEach((c, i) => {
          const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - mid);
          if (d < best) {
            best = d;
            closest = i;
          }
        });
        setIndex(closest);
        raf = null;
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-sand text-center">
        <p className="max-w-xs px-6 text-[14px] leading-relaxed text-zinc-400">
          Drop photos and clips into <code className="font-mono">/public/out-of-office</code>{" "}
          and list them in <code className="font-mono">src/data/site.ts</code>.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Photos and clips"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      tabIndex={0}
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((m) => (
          <figure
            key={m.src}
            className="relative aspect-[16/10] w-full shrink-0 snap-center overflow-hidden rounded-3xl border border-zinc-200 bg-sand"
          >
            {m.type === "video" ? (
              <video
                src={m.src}
                poster={m.poster}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
                onError={() => setBroken((b) => ({ ...b, [m.src]: true }))}
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={m.src}
                alt={m.caption}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={() => setBroken((b) => ({ ...b, [m.src]: true }))}
              />
            )}
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-5 pb-4 pt-10 text-left text-white">
              <span className="text-[15px] font-medium">{m.caption}</span>
              {m.place && (
                <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/70">
                  {m.place}
                </span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {items.map((m, i) => (
              <button
                key={m.src}
                onClick={() => {
                  setIndex(i);
                  scrollTo(i);
                }}
                aria-label={`Go to ${m.caption}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-forest" : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label="Previous"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition-colors hover:border-forest hover:text-forest disabled:opacity-30 disabled:hover:border-zinc-300 disabled:hover:text-zinc-600"
            >
              ←
            </button>
            <button
              onClick={() => go(1)}
              disabled={index === items.length - 1}
              aria-label="Next"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition-colors hover:border-forest hover:text-forest disabled:opacity-30 disabled:hover:border-zinc-300 disabled:hover:text-zinc-600"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
