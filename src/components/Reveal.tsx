"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Variant = "rise" | "blur" | "scale";

const variants = {
  rise: { from: { opacity: 0, y: 28 }, to: { opacity: 1, y: 0 } },
  blur: { from: { opacity: 0, y: 24, filter: "blur(10px)" }, to: { opacity: 1, y: 0, filter: "blur(0px)" } },
  scale: { from: { opacity: 0, scale: 0.965, y: 20 }, to: { opacity: 1, scale: 1, y: 0 } },
};

export function Reveal({
  children,
  delay = 0,
  className = "",
  variant = "rise",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: Variant;
}) {
  const reduced = useReducedMotion();
  const v = variants[variant];

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial={v.from}
      whileInView={v.to}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.85, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
