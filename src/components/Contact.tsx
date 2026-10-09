import { site } from "@/data/site";
import { Reveal } from "./Reveal";
import { ZoomTitle } from "./ZoomTitle";

export function Contact() {
  return (
    <>
    <ZoomTitle id="contact" eyebrow="Contact">
      Reach out to chat.
    </ZoomTitle>
    <section className="relative overflow-hidden bg-white pb-24 text-center md:pb-28">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[60%] bg-gradient-to-t from-forest-wash to-transparent" />
      <div className="mx-auto max-w-2xl px-5">
        <Reveal variant="blur">
          <p className="text-lg text-zinc-600 md:text-xl">
            Always happy to talk infra, security, or whatever you&rsquo;re building.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${site.email}`}
              className="rounded-full bg-forest px-6 py-3 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-forest-soft"
            >
              Contact me
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-300 px-6 py-3 text-[15px] font-medium text-ink transition-colors duration-200 hover:border-forest hover:text-forest"
            >
              LinkedIn
            </a>
          </div>
        </Reveal>
      </div>
    </section>
    </>
  );
}
