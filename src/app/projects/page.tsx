import type { Metadata } from "next";
import Link from "next/link";
import { Projects } from "@/components/Projects";
import { Reveal } from "@/components/Reveal";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Projects — Agam Iheanyi-Igwe",
  description:
    "Prediction Desk, Omni, Godela Diagnostics, Neon and AskDolph — what each one does, what it's built on, and where the code lives.",
};

export default function ProjectsPage() {
  return (
    <main className="w-full bg-white">
      <section className="relative overflow-hidden px-5 pt-32 pb-12 md:px-8 md:pt-40 md:pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-gradient-to-b from-forest-wash to-transparent" />
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <Link
              href="/"
              className="group inline-flex items-center text-[13px] text-zinc-500 hover:text-forest"
            >
              <span className="mr-1.5 inline-block transition-transform group-hover:-translate-x-1">
                ←
              </span>
              Home
            </Link>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-forest">
              Projects
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-ink md:text-6xl">
              Things I&rsquo;ve built.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600">
              Personal work, client work and internship work. Where the code is mine and
              public, the repo is linked.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 pb-24 md:px-8 md:pb-32">
        <Projects />
      </section>

      <section className="border-t border-zinc-200 bg-sand py-20 text-center">
        <div className="mx-auto max-w-xl px-5">
          <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Want the one-page version?
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={site.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-forest px-6 py-3 text-[15px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-soft"
            >
              View Resume
            </a>
            <Link
              href="/#contact"
              className="rounded-full border border-zinc-300 px-6 py-3 text-[15px] font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-forest hover:text-forest"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
