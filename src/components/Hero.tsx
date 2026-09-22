"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { site } from "@/data/site";

const chips = ["Stanford", "Infrastructure & Security", "CS × Mathematics"];

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // settles back and fades as the next section comes up
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden bg-white px-5 pt-24 pb-20 text-center"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%] select-none bg-gradient-to-b from-forest-wash to-transparent" />

      <motion.div
        style={reduced ? undefined : { opacity, scale, y }}
        className="flex flex-col items-center"
      >
        <motion.div {...rise(0)}>
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
        </motion.div>

        <motion.h1
          {...rise(0.08)}
          className="mt-8 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl"
        >
          {site.name}
        </motion.h1>

        <motion.div {...rise(0.16)} className="mt-6 flex flex-wrap justify-center gap-2">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full border border-zinc-200 bg-sand px-3.5 py-1.5 text-[13px] text-zinc-600"
            >
              {c}
            </span>
          ))}
        </motion.div>

        <motion.div {...rise(0.24)} className="mt-8 flex flex-wrap justify-center gap-3">
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
        </motion.div>
      </motion.div>
    </section>
  );
}
