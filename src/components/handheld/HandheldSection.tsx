"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { buildApps, type App, type GalleryPhoto, type NowPlaying, type Playlist } from "./apps";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/* Everything on the device, as plain HTML. Hidden for sighted users with WebGL; it is the
   site for screen readers, search engines, and browsers without WebGL. */
function PlainSite({ apps, visible }: { apps: App[]; visible: boolean }) {
  return (
    <div className={visible ? "mx-auto max-w-3xl px-5 py-20 text-zinc-300" : "sr-only"}>
      <h1 className="text-4xl font-semibold text-white">Agam Iheanyi-Igwe</h1>
      {apps.map((app) => (
        <section key={app.id} className="mt-12">
          <h2 className="text-2xl font-semibold text-white">
            {app.kind === "link" && app.href ? (
              <a href={app.href} target="_blank" rel="noopener noreferrer" className="underline">
                {app.label}
              </a>
            ) : (
              app.label
            )}
          </h2>
          <ul className="mt-4 space-y-3">
            {app.items.map((it, i) => (
              <li key={`${it.title}-${i}`}>
                {it.href ? (
                  <a href={it.href} target="_blank" rel="noopener noreferrer" className="font-medium text-white underline">
                    {it.title}
                  </a>
                ) : (
                  <span className="font-medium text-white">{it.title}</span>
                )}
                {it.subtitle && <span>, {it.subtitle}</span>}
                {it.meta && <span className="text-zinc-500"> ({it.meta})</span>}
                {it.body?.map((b) => (
                  <p key={b} className="mt-1 text-sm">
                    {b}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/*
  The whole site. A tall section with a sticky stage; scroll progress opens the handheld,
  and from then on the device is the navigation.
*/
export function HandheldSection({ creative }: { creative: GalleryPhoto[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [gl, setGl] = useState<boolean | null>(null);
  useEffect(() => setGl(hasWebGL()), []);

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [now, setNow] = useState<NowPlaying>(null);
  const [musicLoaded, setMusicLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch("/api/spotify/playlists")
      .then((r) => r.json())
      .then((d: { playlists?: Playlist[] }) => alive && setPlaylists(d.playlists ?? []))
      .catch(() => {})
      .finally(() => alive && setMusicLoaded(true));
    const loadNow = () =>
      fetch("/api/spotify/now")
        .then((r) => r.json())
        .then((d: { track: NowPlaying }) => alive && setNow(d.track ?? null))
        .catch(() => {});
    loadNow();
    const id = setInterval(loadNow, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const apps = useMemo(() => buildApps({ creative, playlists, now, musicLoaded }), [creative, playlists, now, musicLoaded]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(1);
  const progress = reduced ? still : scrollYProgress;

  // function form opts out of motion's accelerated scroll path, which lagged
  const introOpacity = useTransform(scrollYProgress, (v) => 1 - Math.min(1, v / 0.1));
  const introY = useTransform(scrollYProgress, [0, 0.1], [0, 12]);

  const open = useCallback((href: string) => {
    if (href.startsWith("mailto:")) window.location.href = href;
    else window.open(href, "_blank", "noopener,noreferrer");
  }, []);

  if (gl === false) return <PlainSite apps={apps} visible />;

  return (
    <section ref={ref} aria-label="Agam Iheanyi-Igwe" className={reduced ? "relative h-screen" : "relative h-[260vh]"}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_38%,#24262a_0%,#111214_55%,#000000_100%)]">
        <motion.div
          style={reduced ? { opacity: 0 } : { opacity: introOpacity, y: introY }}
          className="pointer-events-none absolute inset-x-0 bottom-[6vh] z-10 flex flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500"
        >
          Scroll to open
          <span className="h-8 w-px animate-pulse bg-zinc-600" />
        </motion.div>

        <div className="absolute inset-0">{gl && <Scene progress={progress} apps={apps} onOpen={open} reduced={!!reduced} />}</div>
      </div>
      <PlainSite apps={apps} visible={false} />
    </section>
  );
}
