"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useTransform } from "motion/react";
import { usePinProgress } from "./usePinProgress";

/*
  A full-screen chapter card. The title rises in small and blurred, then zooms
  up to full size as you scroll and stays put until the page carries it away.

  Progress runs from the wrapper's top entering at the bottom of the viewport (0)
  to its bottom reaching the bottom of the viewport (1). With a 200vh wrapper the
  stage is pinned from 0.5 to 1.
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
  const p = usePinProgress(ref, "enter");

  const scale = useTransform(p, [0.1, 0.85], [0.45, 1]);
  const opacity = useTransform(p, [0.1, 0.4], [0, 1]);
  const blurPx = useTransform(p, [0.1, 0.5], [12, 0]);
  const filter = useTransform(blurPx, (b) => `blur(${b}px)`);
  const eyebrowOpacity = useTransform(p, [0.45, 0.6], [0, 1]);
  const eyebrowY = useTransform(p, [0.45, 0.6], [12, 0]);

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
    <div ref={ref} id={id} className={`relative h-[200vh] ${bg}`}>
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
