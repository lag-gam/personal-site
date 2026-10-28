"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { menu } from "./menu";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function MenuLinks({ onNavigate, className = "" }: { onNavigate: (href: string) => void; className?: string }) {
  return (
    <nav aria-label="Sections" className={`flex flex-wrap justify-center gap-2 ${className}`}>
      {menu.map((m) => (
        <a
          key={m.href}
          href={m.href}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(m.href);
          }}
          className="rounded-full border border-zinc-200 bg-white/80 px-4 py-1.5 text-[13px] text-zinc-600 backdrop-blur transition-colors hover:border-forest hover:text-forest"
        >
          {m.label}
        </a>
      ))}
    </nav>
  );
}

/*
  The page's one scroll-driven scene. A tall section with a sticky stage; scroll
  progress through it opens the handheld. Reduced motion and no-WebGL both get
  the menu as plain links.
*/
export function HandheldSection() {
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const reduced = useReducedMotion();
  const [gl, setGl] = useState<boolean | null>(null);
  useEffect(() => setGl(hasWebGL()), []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(1);
  const progress = reduced ? still : scrollYProgress;

  const introOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.1], [0, 12]);
  const outroOpacity = useTransform(scrollYProgress, [0.68, 0.8], [0, 1]);
  const outroY = useTransform(scrollYProgress, [0.68, 0.8], [24, 0]);
  const outroPointer = useTransform(scrollYProgress, (v) => (v > 0.7 ? "auto" : "none"));

  const navigate = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      history.pushState(null, "", `#${id}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    } else {
      router.push(href);
    }
  };

  if (gl === false) {
    return (
      <section className="bg-white px-5 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-forest">Menu</p>
        <h2 className="mt-4 text-[clamp(2rem,4.5vw,3.5rem)] font-semibold tracking-[-0.03em] text-ink">
          Pick a section.
        </h2>
        <MenuLinks onNavigate={navigate} className="mt-8" />
      </section>
    );
  }

  return (
    <section ref={ref} aria-label="Menu" className={reduced ? "relative h-screen" : "relative h-[360vh]"}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-gradient-to-b from-white via-forest-wash to-white">
        <h1 className="sr-only">Agam Iheanyi-Igwe</h1>
        <motion.div
          style={reduced ? { opacity: 0 } : { opacity: introOpacity, y: introY }}
          className="pointer-events-none absolute inset-x-0 bottom-[6vh] z-10 flex flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400"
        >
          Scroll to open
          <span className="h-8 w-px animate-pulse bg-zinc-300" />
        </motion.div>

        <div className="absolute inset-0">{gl && <Scene progress={progress} onNavigate={navigate} reduced={!!reduced} />}</div>

        <motion.div
          style={reduced ? undefined : { opacity: outroOpacity, y: outroY, pointerEvents: outroPointer }}
          className="absolute inset-x-0 bottom-[7vh] z-10 px-5"
        >
          <p className="mb-3 text-center text-[13px] text-zinc-400">Tap a tile, or jump straight there.</p>
          <MenuLinks onNavigate={navigate} />
        </motion.div>
      </div>
    </section>
  );
}
