"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { site } from "@/data/site";

const chips = ["Stanford", "Infrastructure & Security", "CS × Mathematics"];

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
        className="rounded-full bg-forest px-6 py-3 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-forest-soft"
      >
        View Projects
      </Link>
      <a
        href={site.resume}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-zinc-300 px-6 py-3 text-[15px] font-medium text-ink transition-colors duration-200 hover:border-forest hover:text-forest"
      >
        View Resume
      </a>
    </>
  );
}

function Lockup() {
  const [first, ...rest] = site.name.split(" ");
  return (
    <div className="flex flex-col items-center gap-[0.3em] text-[clamp(2.75rem,8vw,7rem)] md:flex-row md:gap-[0.32em]">
      <div className="relative h-[1.9em] w-[1.9em] shrink-0 overflow-hidden rounded-full ring-1 ring-zinc-200">
        <Image
          src="/headshot.jpg"
          alt={site.name}
          fill
          priority
          sizes="(max-width: 768px) 40vw, 260px"
          className="object-cover"
        />
      </div>

      <h1 className="text-center font-semibold leading-[0.95] tracking-[-0.035em] text-ink md:text-left">
        <span className="block">{first}</span>
        <span className="block">{rest.join(" ")}</span>
      </h1>
    </div>
  );
}

/*
  Static hero: face and name lockup, chips and buttons beneath. The whole block
  fades in once on load and then stays put.
*/
export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section
      id="top"
      className="relative flex min-h-[92vh] w-full flex-col items-center justify-center bg-white px-5 pt-24 pb-20"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-forest-wash to-transparent" />
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex flex-col items-center"
      >
        <Lockup />
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <Chips />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Buttons />
        </div>
      </motion.div>
    </section>
  );
}
