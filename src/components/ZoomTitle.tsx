"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/*
  A full-screen chapter card. The title rises in small, settles at full size,
  then zooms toward the viewer and dissolves as you scroll through it into the
  section below. Same "push in" feel as the hero.

  Progress runs from the wrapper's top hitting the bottom of the viewport (0)
  to its bottom hitting the bottom of the viewport (1). With a 240vh wrapper the
  stage is pinned from ~0.42 to 1.
*/
export function ZoomTitle({
  id,
  eyebrow,
  children,
  tone = "white",
}: {
  id?: string;
  eyebrow?: string;
  children: ReactNode;
  tone?: "white" | "sand";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const scale = useTransform(p, [0, 0.42, 0.62, 1], [0.55, 1, 1, 6]);
  const opacity = useTransform(p, [0.05, 0.38, 0.72, 0.92], [0, 1, 1, 0]);
  const blurPx = useTransform(p, [0.05, 0.36, 0.7, 0.95], [14, 0, 0, 18]);
  const filter = useTransform(blurPx, (b) => `blur(${b}px)`);
  const eyebrowOpacity = useTransform(p, [0.3, 0.42, 0.6, 0.68], [0, 1, 1, 0]);
  const eyebrowY = useTransform(p, [0.3, 0.42], [12, 0]);

  const bg = tone === "sand" ? "bg-sand" : "bg-white";

  if (reduced) {
    return (
      <div id={id} className={`${bg} pt-24 md:pt-32`}>
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
          {eyebrow && (
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-forest">{eyebrow}</p>
          )}
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink md:text-4xl">{children}</h2>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} id={id} className={`relative h-[240vh] ${bg}`}>
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden px-5">
        <div className="flex flex-col items-center text-center">
          {eyebrow && (
            <motion.p
              style={{ opacity: eyebrowOpacity, y: eyebrowY }}
              className="mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-forest md:text-[12px]"
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h2
            style={{ scale, opacity, filter }}
            className="pointer-events-none max-w-[14ch] text-[clamp(2.75rem,10vw,9rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-ink will-change-transform"
          >
            {children}
          </motion.h2>
        </div>
      </div>
    </div>
  );
}
