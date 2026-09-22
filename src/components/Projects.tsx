import Image from "next/image";
import { projects } from "@/data/site";
import { Mock } from "./Mock";
import { Reveal } from "./Reveal";

export function Projects() {
  return (
    <div className="space-y-6 md:space-y-8">
      {projects.map((p, i) => (
        <Reveal key={p.slug} delay={i === 0 ? 0 : 0.04}>
          <article className="group grid grid-cols-1 gap-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 transition-all duration-500 hover:border-forest/40 hover:shadow-[0_18px_50px_-30px_rgba(20,83,45,0.35)] md:grid-cols-2 md:gap-10 md:p-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-sand">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={`${p.title} screenshot`}
                  fill
                  sizes="(max-width: 768px) 100vw, 560px"
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              ) : (
                <div className="h-full w-full p-3 transition-transform duration-700 ease-out group-hover:scale-[1.015]">
                  <Mock kind={p.mock} />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center py-2 md:py-6 md:pr-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-forest">
                {p.kicker}
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                {p.title}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-zinc-700">{p.summary}</p>
              {p.detail && (
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">{p.detail}</p>
              )}

              <div className="mt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                  Built with
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-zinc-200 bg-sand px-3 py-1 font-mono text-[11px] text-zinc-600"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {p.github ? (
                <div className="mt-6">
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center font-medium text-forest hover:underline"
                  >
                    GitHub
                    <span className="ml-1 inline-block transition-transform group-hover/link:translate-x-1">
                      →
                    </span>
                  </a>
                </div>
              ) : (
                <p className="mt-6 text-[13px] text-zinc-400">
                  Private — company or client codebase.
                </p>
              )}
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
