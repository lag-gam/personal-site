"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { site } from "@/data/site";
import { usePinProgress } from "./usePinProgress";

const chips = ["Stanford", "Infrastructure & Security", "CS × Mathematics"];
const EASE = [0.16, 1, 0.3, 1] as const;

/*
  Pinned hero. Face and name sit side by side as one lockup, the photo sized to
  match the two lines of the name. Scroll timeline (0 → 1):
  0.00 – 0.40  push in: the lockup grows and the photo zooms toward the face
  0.40 – 0.65  settle: the lockup eases back down and lifts, chips and buttons rise in
  0.65 – 1.00  hold, then the page continues
  The name never fades out.
*/

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

function Lockup({ photoScale }: { photoScale?: MotionValue<number> }) {
  const [first, ...rest] = site.name.split(" ");
  return (
    <div className="flex flex-col items-center gap-[0.3em] text-[clamp(2.75rem,8vw,7rem)] md:flex-row md:gap-[0.32em]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative h-[1.9em] w-[1.9em] shrink-0 overflow-hidden rounded-full ring-1 ring-zinc-200"
      >
        <motion.div style={photoScale ? { scale: photoScale } : undefined} className="absolute inset-0 origin-[50%_48%]">
          <Image
            src="/headshot.jpg"
            alt={site.name}
            fill
            priority
            sizes="(max-width: 768px) 40vw, 260px"
            className="object-cover"
          />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.12, ease: EASE }}
        className="text-center font-semibold leading-[0.95] tracking-[-0.035em] text-ink md:text-left"
      >
        <span className="block">{first}</span>
        <span className="block">{rest.join(" ")}</span>
      </motion.h1>
    </div>
  );
}

function StaticHero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[92vh] w-full flex-col items-center justify-center bg-white px-5 pt-24 pb-20"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%] bg-gradient-to-b from-forest-wash to-transparent" />
      <Lockup />
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        <Chips />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Buttons />
      </div>
    </section>
  );
}

export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const p = usePinProgress(ref, "pin");

  const lockScale = useTransform(p, [0, 0.4, 0.65], [1, 1.18, 0.82]);
  const lockY = useTransform(p, [0.4, 0.65], ["0vh", "-9vh"]);
  const photoScale = useTransform(p, [0, 0.4, 0.65], [1, 1.45, 1.08]);

  const chipsOpacity = useTransform(p, [0.48, 0.58], [0, 1]);
  const chipsY = useTransform(p, [0.48, 0.58], [24, 0]);
  const btnOpacity = useTransform(p, [0.55, 0.65], [0, 1]);
  const btnY = useTransform(p, [0.55, 0.65], [24, 0]);
  const hintOpacity = useTransform(p, [0, 0.08], [1, 0]);

  if (reduced) return <StaticHero />;

  return (
    <section ref={ref} id="top" className="relative h-[260vh] w-full bg-white">
      <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-forest-wash to-transparent" />

        <motion.div style={{ scale: lockScale, y: lockY }} className="relative will-change-transform">
          <Lockup photoScale={photoScale} />
        </motion.div>

        {/* chips and buttons sit in the space the lockup lifts out of */}
        <div className="absolute inset-x-0 bottom-[14svh] flex flex-col items-center gap-6 px-5">
          <motion.div style={{ opacity: chipsOpacity, y: chipsY }} className="flex flex-wrap justify-center gap-2">
            <Chips />
          </motion.div>
          <motion.div style={{ opacity: btnOpacity, y: btnY }} className="flex flex-wrap justify-center gap-3">
            <Buttons />
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Scroll</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="block h-6 w-px bg-zinc-400"
          />
        </motion.div>
      </div>
    </section>
  );
}
