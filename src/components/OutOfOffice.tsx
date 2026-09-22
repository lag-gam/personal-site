import { involvements, interests, site } from "@/data/site";
import { Carousel } from "./Carousel";
import { NowPlaying } from "./NowPlaying";
import { Playlists } from "./Playlists";
import { Reveal } from "./Reveal";

export function OutOfOffice() {
  return (
    <section id="out-of-office" className="border-t border-zinc-200 bg-sand py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-forest">
            Out of Office
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            What I&rsquo;m doing when I&rsquo;m not doing this.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
          <Reveal>
            <Carousel />
            {site.instagram && (
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-4 inline-flex items-center text-[14px] text-zinc-500 hover:text-forest"
              >
                More on Instagram
                <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            )}
          </Reveal>

          <Reveal delay={0.08}>
            <NowPlaying />
          </Reveal>
        </div>

        <div className="mt-6">
          <Reveal>
            <Playlists />
          </Reveal>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
          <Reveal>
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 md:p-6">
              <h3 className="text-lg font-medium tracking-tight text-ink">On campus</h3>
              <ul className="mt-5 divide-y divide-zinc-100">
                {involvements.map((inv) => (
                  <li
                    key={`${inv.role}-${inv.org}`}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="text-[15px] text-ink">
                      <span className="font-medium">{inv.role}</span>
                      <span className="text-zinc-400">, {inv.org}</span>
                    </span>
                    {inv.when && (
                      <span className="font-mono text-[11px] text-zinc-400">{inv.when}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 md:p-6">
              <h3 className="text-lg font-medium tracking-tight text-ink">Otherwise</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {interests.map((i) => (
                  <span
                    key={i}
                    className="rounded-full border border-zinc-200 bg-sand px-3 py-1.5 text-[13px] text-zinc-600"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
