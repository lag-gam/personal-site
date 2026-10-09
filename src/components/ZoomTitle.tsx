import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/*
  Section heading. Previously a pinned, full-screen zooming chapter card; now a
  normal heading in the page flow that fades in once.
*/
export function ZoomTitle({
  id,
  eyebrow,
  children,
  tone = "white",
}: {
  id?: string;
  eyebrow?: string;
  children: ReactNode;
  tone?: "white" | "sand";
}) {
  const bg = tone === "sand" ? "bg-sand" : "bg-white";

  return (
    <div id={id} className={`${bg} scroll-mt-20 pt-24 pb-10 md:pt-32 md:pb-14`}>
      <Reveal className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        {eyebrow && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-forest md:text-[12px]">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-4 max-w-[20ch] text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink">
          {children}
        </h2>
      </Reveal>
    </div>
  );
}
