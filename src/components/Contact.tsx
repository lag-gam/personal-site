import { site } from "@/data/site";
import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-zinc-200 bg-white py-24 text-center md:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[60%] bg-gradient-to-t from-forest-wash to-transparent" />
      <div className="mx-auto max-w-2xl px-5">
        <Reveal variant="blur">
          <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Reach out to chat.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${site.email}`}
              className="rounded-full bg-forest px-6 py-3 text-[15px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-soft"
            >
              Contact me
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-300 px-6 py-3 text-[15px] font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-forest hover:text-forest"
            >
              LinkedIn
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
