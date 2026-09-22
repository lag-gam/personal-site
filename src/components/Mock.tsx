/* Placeholder frames shown until a real screenshot lands in /public/projects. */

const bar = "h-2 rounded-full bg-zinc-200";

export function Mock({ kind }: { kind: "terminal" | "phone" | "desk" | "bar" }) {
  if (kind === "terminal") {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center gap-1.5 border-b border-zinc-200 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="ml-3 font-mono text-[10px] text-zinc-400">job trace</span>
        </div>
        <div className="flex-1 space-y-2 p-4 font-mono text-[10px] leading-relaxed text-zinc-500">
          {[
            "12:04:11  job accepted",
            "12:04:13  queued",
            "12:04:29  preprocessing complete",
            "12:05:02  status → running",
            "12:05:44  warn: retry 1/3",
            "12:06:10  artifact written",
          ].map((t) => (
            <div key={t} className="truncate">
              <span className="text-forest">$</span> {t}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "desk") {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-2.5 w-24 rounded-full bg-zinc-200" />
          <div className="h-2.5 w-12 rounded-full bg-forest/35" />
        </div>
        <div className="flex flex-1 items-end gap-1.5">
          {[38, 52, 44, 67, 58, 74, 63, 81, 72, 90, 84, 96].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className={`flex-1 rounded-sm ${i > 8 ? "bg-forest/60" : "bg-zinc-200"}`}
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["out-of-sample", "cost sweep", "luck test"].map((t) => (
            <div key={t} className="rounded-lg border border-zinc-200 px-2 py-2">
              <div className="font-mono text-[8px] text-zinc-400">{t}</div>
              <div className="mt-1 h-1.5 w-8 rounded-full bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "bar") {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-3 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="mb-1 flex items-center justify-between">
          <div className="h-2 w-16 rounded-full bg-zinc-200" />
          <div className="h-2 w-8 rounded-full bg-forest/30" />
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-sand px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-forest/70" />
          <div className="h-2 flex-1 rounded-full bg-zinc-200" />
          <div className="h-4 w-px animate-pulse bg-zinc-400" />
        </div>
        <div className="space-y-2 px-1 pt-2">
          <div className={`${bar} w-3/4`} />
          <div className={`${bar} w-full`} />
          <div className={`${bar} w-2/3`} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 px-1">
          {["saved", "recalled", "answered"].map((t) => (
            <span
              key={t}
              className="rounded-full border border-zinc-200 px-2.5 py-1 font-mono text-[9px] text-zinc-400"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-2 space-y-2 px-1">
          <div className={`${bar} w-5/6`} />
          <div className={`${bar} w-1/2`} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="aspect-[9/17] h-full max-h-full w-auto overflow-hidden rounded-[1.6rem] border border-zinc-200 bg-sand p-3">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-200" />
        <div className="space-y-2">
          <div className="h-16 rounded-lg bg-zinc-200" />
          <div className={`${bar} w-2/3`} />
          <div className={`${bar} w-full`} />
          <div className={`${bar} w-1/2`} />
          <div className="mt-3 h-7 rounded-lg bg-forest/25" />
        </div>
      </div>
    </div>
  );
}
