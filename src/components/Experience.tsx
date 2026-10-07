import { roles } from "@/data/site";
import { Logo } from "./Logo";
import { SlideIn } from "./ScrollScene";
import { ZoomTitle } from "./ZoomTitle";

export function Experience() {
  return (
    <>
    <ZoomTitle id="experience" eyebrow="Experience">
      Where I&rsquo;ve worked.
    </ZoomTitle>
    <section className="bg-white pb-24 md:pb-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <div className="border-t border-zinc-200">
          {roles.map((r, i) => (
            <SlideIn key={`${r.org}-${r.when}`} from="left" distance={70}>
              <div className="grid grid-cols-1 gap-4 border-b border-zinc-200 py-8 transition-colors duration-300 hover:bg-sand md:grid-cols-[200px_1fr] md:gap-10 md:px-4">
                <div className="flex items-start gap-3">
                  <Logo src={r.logo} name={r.org} />
                  <div className="pt-1 font-mono text-[12px] leading-snug text-zinc-500">
                    {r.when}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium tracking-tight text-ink md:text-xl">
                    {r.title}{" "}
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 underline-offset-4 transition-colors hover:text-forest hover:underline"
                      >
                        · {r.org}
                      </a>
                    ) : (
                      <span className="text-zinc-400">· {r.org}</span>
                    )}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {r.bullets.map((b) => (
                      <li
                        key={b}
                        className="relative pl-4 text-[15px] leading-relaxed text-zinc-600 before:absolute before:left-0 before:top-[0.65em] before:h-1 before:w-1 before:rounded-full before:bg-forest/50"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
