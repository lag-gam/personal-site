"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GalleryCategory } from "@/data/site";

export type GalleryImage = { src: string; caption: string; place?: string };

const LABEL: Record<GalleryCategory, string> = {
  creative: "Creative Works",
  technical: "Technical Works",
};

function Grid({ items, onOpen }: { items: GalleryImage[]; onOpen: (i: number) => void }) {
  if (!items.length) {
    return (
      <p className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center text-[14px] text-zinc-400">
        Nothing here yet. Drop images into this tab&rsquo;s folder under /public/gallery.
      </p>
    );
  }
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
      {items.map((img, i) => (
        <button
          key={img.src}
          type="button"
          onClick={() => onOpen(i)}
          className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl bg-zinc-100 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.place ? `${img.caption}, ${img.place}` : img.caption}
            loading="lazy"
            decoding="async"
            className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pt-10 pb-3 text-[13px] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <span className="font-medium">{img.caption}</span>
            {img.place && <span className="text-white/70">, {img.place}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

export function GalleryTabs({
  creative,
  technical,
  defaultTab,
}: {
  creative: GalleryImage[];
  technical: GalleryImage[];
  defaultTab: GalleryCategory;
}) {
  const [tab, setTab] = useState<GalleryCategory>(defaultTab);
  const [open, setOpen] = useState<number | null>(null);
  const items = tab === "creative" ? creative : technical;

  // the handheld menu links to #creative / #technical; follow the hash
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.slice(1);
      if (h === "creative" || h === "technical") setTab(h);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const step = useCallback(
    (d: 1 | -1) => setOpen((o) => (o === null ? o : (o + d + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const current = open === null ? null : items[open];

  return (
    <>
      {/* anchors so #creative and #technical land here */}
      <span id="creative" className="block scroll-mt-24" />
      <span id="technical" className="block scroll-mt-24" />
      <Tabs value={tab} onValueChange={(v) => setTab(v as GalleryCategory)}>
        <TabsList aria-label="Gallery">
          {(Object.keys(LABEL) as GalleryCategory[]).map((k) => (
            <TabsTrigger key={k} value={k}>
              {LABEL[k]}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="creative">
          <Grid items={creative} onOpen={setOpen} />
        </TabsContent>
        <TabsContent value="technical">
          <Grid items={technical} onOpen={setOpen} />
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {current && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.caption}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          >
            <motion.figure
              key={current.src}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex max-h-full flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.src}
                alt={current.caption}
                className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain"
              />
              <figcaption className="mt-4 text-[14px] text-white/80">
                {current.caption}
                {current.place && <span className="text-white/50">, {current.place}</span>}
              </figcaption>
            </motion.figure>
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={(e) => (e.stopPropagation(), step(-1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-white hover:bg-white/20"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={(e) => (e.stopPropagation(), step(1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-white hover:bg-white/20"
                >
                  →
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
