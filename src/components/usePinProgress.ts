"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react";

/**
 * 0 → 1 progress for a tall wrapper, computed from window scroll and the
 * wrapper's measured position. Deliberately avoids `useScroll({ target })`,
 * which can hand off to the browser's native scroll timeline and resolve
 * "end end" ranges inconsistently for pinned (sticky) sections.
 *
 * mode "pin":   0 when the wrapper top hits the viewport top, 1 when its bottom hits the viewport bottom.
 * mode "enter": 0 when the wrapper top enters at the viewport bottom, 1 when its bottom hits the viewport bottom.
 */
export function usePinProgress(
  ref: RefObject<HTMLElement | null>,
  mode: "pin" | "enter" = "pin",
): MotionValue<number> {
  const { scrollY } = useScroll();
  // kept in a motion value so the transform below always sees fresh geometry
  const box = useMotionValue({ top: 0, height: 1, vh: 1 });

  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      box.set({ top: r.top + window.scrollY, height: r.height, vh: window.innerHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref, box]);

  return useTransform(() => {
    const y = scrollY.get();
    const { top, height, vh } = box.get();
    const start = mode === "pin" ? top : top - vh;
    const end = top + height - vh;
    const t = (y - start) / Math.max(1, end - start);
    return Math.min(1, Math.max(0, t));
  });
}
