// Shown by Next.js while /auth-dashboard fetches the session.
// Mirrors the real page (same wrapper, cards and spacing) so nothing jumps when it loads.

const bar = "rounded bg-gray-200 motion-safe:animate-pulse";

export default function Loading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="min-h-[calc(100vh-4rem)] flex flex-col p-6 bg-gray-50"
    >
      <span className="sr-only">Loading your dashboard…</span>

      <div className="flex-1 space-y-8" aria-hidden="true">
        {/* Header card */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-6 rounded-2xl shadow">
          <div className="space-y-3">
            <div className={`${bar} h-7 w-72 max-w-full`} />
            <div className={`${bar} h-4 w-48`} />
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="h-12 w-12 rounded-full bg-gray-200 motion-safe:animate-pulse" />
            <div className="space-y-2">
              <div className={`${bar} h-4 w-28`} />
              <div className={`${bar} h-3 w-40`} />
            </div>
            <div className={`${bar} h-10 w-24 rounded-lg`} />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5 space-y-3">
              <div className={`${bar} h-3 w-24`} />
              <div className={`${bar} h-6 w-32`} />
            </div>
          ))}
        </div>

        {/* User data card */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-3">
            <div className={`${bar} h-6 w-28`} />
            <div className={`${bar} h-8 w-24 rounded-lg`} />
          </div>
          <div className="h-40 rounded-lg bg-gray-100 motion-safe:animate-pulse" />
        </div>

        {/* Getting started card */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-3">
          <div className="h-5 w-40 rounded bg-indigo-100 motion-safe:animate-pulse" />
          <div className="h-4 w-full rounded bg-indigo-100 motion-safe:animate-pulse" />
          <div className="h-4 w-4/5 rounded bg-indigo-100 motion-safe:animate-pulse" />
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-between mt-8" aria-hidden="true">
        <div className={`${bar} h-10 w-36 rounded-lg`} />
        <div className={`${bar} h-10 w-40 rounded-lg`} />
      </div>
    </div>
  );
}