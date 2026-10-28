"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-white/15 bg-white/10 px-1.5 font-sans text-[11px] font-semibold text-white">
      {children}
    </kbd>
  );
}

function Row({ keys, does }: { keys: React.ReactNode; does: string }) {
  return (
    <li className="flex items-center justify-between gap-6 py-1.5">
      <span className="flex items-center gap-1">{keys}</span>
      <span className="text-zinc-400">{does}</span>
    </li>
  );
}

/* How to drive the device. Starts as a small pill; opens on click. */
export function Controls() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div className="absolute right-4 bottom-4 z-20 text-[13px] sm:right-6 sm:bottom-6">
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Controls"
            className="w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-zinc-900/55 p-4 shadow-2xl backdrop-blur-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-white">Controls</p>
              <button
                type="button"
                onClick={close}
                aria-label="Hide controls"
                className="rounded-full px-2 py-0.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                Hide
              </button>
            </div>
            <ul className="divide-y divide-white/5">
              <Row keys={<span className="text-zinc-300">Scroll</span>} does="Open the device" />
              <Row keys={<span className="text-zinc-300">Drag</span>} does="Rotate it" />
              <Row keys={<span className="text-zinc-300">Double-click</span>} does="Reset the view" />
              <Row
                keys={
                  <>
                    <Key>&larr;</Key>
                    <Key>&uarr;</Key>
                    <Key>&darr;</Key>
                    <Key>&rarr;</Key>
                  </>
                }
                does="Move"
              />
              <Row
                keys={
                  <>
                    <Key>Enter</Key>
                    <span className="text-zinc-500">or</span>
                    <Key>A</Key>
                  </>
                }
                does="Open"
              />
              <Row
                keys={
                  <>
                    <Key>Esc</Key>
                    <span className="text-zinc-500">or</span>
                    <Key>B</Key>
                  </>
                }
                does="Back"
              />
              <Row
                keys={
                  <>
                    <Key>&larr;</Key>
                    <Key>&rarr;</Key>
                  </>
                }
                does="Turn pages"
              />
            </ul>
            <p className="mt-3 text-[12px] leading-snug text-zinc-500">
              You can also click the d-pad and the A and B buttons on the device.
            </p>
          </motion.div>
        ) : (
          <motion.button
            key="pill"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(true)}
            aria-label="Show controls"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/45 px-3.5 py-2 text-zinc-300 backdrop-blur-md transition-colors hover:text-white"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold">?</span>
            Controls
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
