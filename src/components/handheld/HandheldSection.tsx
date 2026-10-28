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

function MenuLinks({
  onNavigate,
  className = "",
  dark = false,
}: {
  onNavigate: (href: string) => void;
  className?: string;
  dark?: boolean;
}) {
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
          className={`rounded-full border px-4 py-1.5 text-[13px] backdrop-blur transition-colors ${dark ? "border-white/15 bg-white/5 text-zinc-300 hover:border-white/40 hover:text-white" : "border-zinc-200 bg-white/80 text-zinc-600 hover:border-forest hover:text-forest"}`}
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

  // function form opts out of motion's accelerated scroll path, which lagged
  const introOpacity = useTransform(scrollYProgress, (v) => 1 - Math.min(1, v / 0.1));
  const introY = useTransform(scrollYProgress, [0, 0.1], [0, 12]);

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
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_38%,#2a2c2f_0%,#141517_55%,#0a0a0b_100%)]">
        <h1 className="sr-only">Agam Iheanyi-Igwe</h1>
        <motion.div
          style={reduced ? { opacity: 0 } : { opacity: introOpacity, y: introY }}
          className="pointer-events-none absolute inset-x-0 bottom-[6vh] z-10 flex flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500"
        >
          Scroll to open
          <span className="h-8 w-px animate-pulse bg-zinc-600" />
        </motion.div>

        <div className="absolute inset-0">{gl && <Scene progress={progress} onNavigate={navigate} reduced={!!reduced} />}</div>

        {/* screen readers and keyboard users still get plain links */}
        <MenuLinks onNavigate={navigate} dark className="sr-only" />
      </div>
    </section>
  );
}
