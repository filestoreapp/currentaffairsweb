import Link from "next/link";
import { getLatestPscUpdates } from "@/lib/psc-updates";
import { PSC_SOURCES } from "@/lib/psc-scraper/sources";
import type { PscSourceKey } from "@/lib/types";
import PscUpdateCard from "@/components/site/PscUpdateCard";

/**
 * Dynamic island of the homepage: reads the `pscSource` search param, so
 * it streams in inside a <Suspense> boundary while the rest of the page
 * serves from the ISR cache.
 */
export default async function HomePscUpdates({
  searchParams,
}: {
  searchParams: Promise<{ pscSource?: string }>;
}) {
  const params = await searchParams;
  const activePscSource = PSC_SOURCES.find((s) => s.key === params.pscSource)
    ?.key as PscSourceKey | undefined;

  const pscUpdates = await getLatestPscUpdates({
    source: activePscSource,
    limit: 6,
  });

  return (
    <>
      <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/#psc-updates"
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
            !activePscSource
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          All
        </Link>
        {PSC_SOURCES.map((s) => (
          <Link
            key={s.key}
            href={`/?pscSource=${s.key}#psc-updates`}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
              activePscSource === s.key
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {pscUpdates.length === 0 ? (
        <p className="mt-6 text-slate-500">
          No updates yet for this category — the scraper hasn&apos;t run,
          or hasn&apos;t found anything new.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pscUpdates.map((u) => (
            <PscUpdateCard key={u.id} update={u} />
          ))}
        </div>
      )}
    </>
  );
}
