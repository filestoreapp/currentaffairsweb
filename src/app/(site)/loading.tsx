/**
 * Instant skeleton shown while navigating between pages in the site
 * group. Next.js renders this the moment a link is tapped, so visitors
 * get immediate visual feedback instead of a frozen-looking page.
 */
export default function SiteLoading() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="h-9 w-2/3 max-w-md rounded-lg bg-slate-200" />
      <div className="mt-3 h-4 w-1/3 max-w-xs rounded bg-slate-100" />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="h-44 bg-gradient-to-br from-indigo-100 via-violet-100 to-fuchsia-100" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-1/4 rounded bg-slate-100" />
              <div className="h-5 w-11/12 rounded bg-slate-200" />
              <div className="h-5 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
