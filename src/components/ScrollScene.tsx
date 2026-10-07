"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef, type ReactNode } from "react";

const SPRING = { stiffness: 120, damping: 24, mass: 0.6 };

/**
 * Scroll-scrubbed slide. The element tracks scroll position the whole way in
 * rather than firing once, so movement follows the wheel instead of a timer.
 */
export function SlideIn({
  children,
  from = "left",
  distance = 90,
  rotate = 0,
  className = "",
}: {
  children: ReactNode;
  from?: "left" | "right" | "bottom";
  distance?: number;
  rotate?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const p = useSpring(scrollYProgress, SPRING);
  const sign = from === "right" ? 1 : -1;

  const x = useTransform(p, [0, 1], [from === "bottom" ? 0 : sign * distance, 0]);
  const y = useTransform(p, [0, 1], [from === "bottom" ? distance : 0, 0]);
  const rot = useTransform(p, [0, 1], [rotate, 0]);
  const opacity = useTransform(p, [0, 0.55], [0, 1]);
  const scale = useTransform(p, [0, 1], [0.94, 1]);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ x, y, rotate: rot, opacity, scale }}>{children}</motion.div>
    </div>
  );
}

/** Mask wipe: the block is revealed by a moving clip edge as it scrolls in. */
export function Wipe({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center 70%"],
  });
  const p = useSpring(scrollYProgress, SPRING);
  const clip = useTransform(p, [0, 1], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const x = useTransform(p, [0, 1], [-40, 0]);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ clipPath: clip, x }}>{children}</motion.div>
    </div>
  );
}

/**
 * Skews its children by how fast you're scrolling, then springs back to flat.
 * Never wrap anything containing a fixed or sticky element in this: a transformed
 * ancestor becomes the containing block and breaks them.
 */
export function VelocitySkew({
  children,
  max = 2.5,
  className = "",
}: {
  children: ReactNode;
  max?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 90, damping: 30, mass: 0.5 });
  const skew = useTransform(smooth, [-2500, 0, 2500], [max, 0, -max], { clamp: true });

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div style={{ skewY: skew }} className={className}>
      {children}
    </motion.div>
  );
}
