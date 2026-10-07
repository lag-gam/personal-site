"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { site } from "@/data/site";

const chips = ["Stanford", "Infrastructure & Security", "CS × Mathematics"];

/*
  Scroll timeline for the pinned hero (0 → 1 across the tall wrapper):
  0.00 – 0.38  push into the face: card rounds into a circle, photo zooms
  0.38 – 0.62  circle shrinks and lifts into the avatar slot
  0.55 – 0.80  name types in letter by letter, then chips and buttons rise
  0.80 – 1.00  hold, then release into the page
*/
const ZOOM_END = 0.38;
const SETTLE_END = 0.62;

function Letter({
  char,
  i,
  total,
  progress,
}: {
  char: string;
  i: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = 0.55 + (i / total) * 0.16;
  const end = start + 0.07;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], ["0.45em", "0em"]);
  const blur = useTransform(progress, [start, end], [8, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  return (
    <motion.span style={{ opacity, y, filter }} className="inline-block whitespace-pre">
      {char}
    </motion.span>
  );
}

function Rise({
  progress,
  at,
  children,
  className = "",
}: {
  progress: MotionValue<number>;
  at: number;
  children: React.ReactNode;
  className?: string;
}) {
  const opacity = useTransform(progress, [at, at + 0.08], [0, 1]);
  const y = useTransform(progress, [at, at + 0.08], [22, 0]);
  return (
    <motion.div style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

function Buttons() {
  return (
    <>
      <Link
        href="/projects"
        className="rounded-full bg-forest px-6 py-3 text-[15px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-soft"
      >
        View Projects
      </Link>
      <a
        href={site.resume}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-zinc-300 px-6 py-3 text-[15px] font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-forest hover:text-forest"
      >
        View Resume
      </a>
    </>
  );
}

function Chips() {
  return (
    <>
      {chips.map((c) => (
        <span
          key={c}
          className="rounded-full border border-zinc-200 bg-sand px-3.5 py-1.5 text-[13px] text-zinc-600"
        >
          {c}
        </span>
      ))}
    </>
  );
}

/** Reduced-motion version: the original static hero. */
function StaticHero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden bg-white px-5 pt-24 pb-20 text-center"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%] bg-gradient-to-b from-forest-wash to-transparent" />
      <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full ring-1 ring-zinc-200 md:h-40 md:w-40">
        <Image
          src="/headshot.jpg"
          alt="Agam Iheanyi-Igwe"
          fill
          priority
          sizes="160px"
          className="scale-[1.06] object-cover object-[50%_42%]"
        />
      </div>
      <h1 className="mt-8 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
        {site.name}
      </h1>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Chips />
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Buttons />
      </div>
    </section>
  );
}

export function Hero() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  // where the big card has to travel to land in the avatar slot
  const [geo, setGeo] = useState({ scale: 0.25, dy: -160 });

  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      const card = cardRef.current;
      const slot = slotRef.current;
      if (!stage || !card || !slot) return;
      const s = stage.getBoundingClientRect();
      const sl = slot.getBoundingClientRect();
      const cardSize = card.offsetWidth;
      setGeo({
        scale: sl.width / cardSize,
        dy: sl.top + sl.height / 2 - (s.top + s.height / 2),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [reduced]);

  const { scrollYProgress: p } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  // card: rounded square → circle → avatar
  const radius = useTransform(p, [0, ZOOM_END * 0.8], ["8%", "50%"]);
  const cardScale = useTransform(p, [ZOOM_END, SETTLE_END], [1, geo.scale]);
  const cardY = useTransform(p, [ZOOM_END, SETTLE_END], [0, geo.dy]);
  const ring = useTransform(p, [SETTLE_END - 0.05, SETTLE_END], [0, 1]);

  // photo inside the card pushes in toward the face, then eases back for the avatar crop
  const photoScale = useTransform(p, [0, ZOOM_END, SETTLE_END], [1, 1.55, 1.12]);

  // intro copy shown over the full portrait
  const introOpacity = useTransform(p, [0, 0.12], [1, 0]);
  const introY = useTransform(p, [0, 0.12], [0, -24]);
  const washOpacity = useTransform(p, [ZOOM_END, SETTLE_END], [0, 1]);

  // release: the whole stage drifts up and fades a touch as the next section arrives
  const stageOpacity = useTransform(p, [0.92, 1], [1, 0.85]);

  if (reduced) return <StaticHero />;

  const name = site.name;

  return (
    <section ref={wrapRef} id="top" className="relative h-[300vh] w-full bg-white">
      <motion.div
        ref={stageRef}
        style={{ opacity: stageOpacity }}
        className="sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-5 text-center"
      >
        <motion.div
          style={{ opacity: washOpacity }}
          className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-forest-wash to-transparent"
        />

        {/* final layout; the avatar slot is an invisible target the card flies into */}
        <div className="relative z-10 flex flex-col items-center pt-10">
          <div ref={slotRef} className="h-32 w-32 md:h-40 md:w-40" aria-hidden />

          <h1
            aria-label={name}
            className="mt-8 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl"
          >
            {Array.from(name).map((ch, i) => (
              <Letter key={i} char={ch} i={i} total={name.length} progress={p} />
            ))}
          </h1>

          <Rise progress={p} at={0.7} className="mt-6 flex flex-wrap justify-center gap-2">
            <Chips />
          </Rise>
          <Rise progress={p} at={0.76} className="mt-8 flex flex-wrap justify-center gap-3">
            <Buttons />
          </Rise>
        </div>

        {/* the portrait card */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <motion.div
            ref={cardRef}
            style={{ scale: cardScale, y: cardY, borderRadius: radius }}
            className="relative aspect-square w-[min(72svh,86vw)] overflow-hidden bg-zinc-100 will-change-transform"
          >
            <motion.div style={{ scale: photoScale }} className="absolute inset-0 origin-[50%_48%]">
              <Image
                src="/headshot.jpg"
                alt="Agam Iheanyi-Igwe"
                fill
                priority
                sizes="(max-width: 768px) 86vw, 72vh"
                className="object-cover"
              />
            </motion.div>
            <motion.div
              style={{ opacity: ring }}
              className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-zinc-200"
            />
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            Scroll
          </span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="block h-6 w-px bg-zinc-400"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
