// Shown by Next.js while the translations page is fetching. Mirrors the real layout
// (same wrapper, heading and row grid) so nothing jumps when the content arrives.

const COLS = "md:grid-cols-[152px_minmax(0,1fr)_minmax(0,1fr)_120px]";

const bar = "rounded-full bg-[#FFB86B]/15 motion-safe:animate-pulse";

// Varied widths so the skeleton looks like real text
const rows = [
  { source: "w-4/5", translation: "w-3/4" },
  { source: "w-2/3", translation: "w-4/5" },
  { source: "w-full", translation: "w-2/3" },
  { source: "w-3/5", translation: "w-3/5" },
  { source: "w-3/4", translation: "w-full" },
  { source: "w-1/2", translation: "w-2/3" },
];

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#FFB86B] text-white">
      <main
        role="status"
        aria-busy="true"
        className="mx-2 min-h-[calc(100vh-72px)] bg-[#4A2208] px-4 pb-16 pt-10 sm:px-8"
      >
        <span className="sr-only">Loading translations…</span>

        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-normal sm:text-5xl">Translations</h1>
              <div className={`${bar} mt-4 h-4 w-64 max-w-full`} />
            </div>
            <div className={`${bar} h-10 w-36`} />
          </div>

          <ul className="mt-10 space-y-2" aria-hidden="true">
            {rows.map((row, i) => (
              <li
                key={i}
                className="rounded-xl border border-[#B85C1E]/60 bg-[#3A1A06]"
              >
                <div
                  className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-4 py-4 ${COLS}`}
                >
                  <div className={`${bar} order-1 h-6 w-28 md:order-none`} />
                  <div
                    className={`${bar} order-3 col-span-2 h-4 md:order-none md:col-span-1 ${row.source}`}
                  />
                  <div
                    className={`${bar} order-4 col-span-2 h-4 md:order-none md:col-span-1 ${row.translation}`}
                  />
                  <div
                    className={`${bar} order-2 h-3 w-20 justify-self-end md:order-none`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}