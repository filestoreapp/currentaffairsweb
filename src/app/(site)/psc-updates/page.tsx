import Link from "next/link";
import { getLatestPscUpdates } from "@/lib/psc-updates";
import type { PscSourceKey } from "@/lib/types";
import { PSC_SOURCES } from "@/lib/psc-scraper/sources";
import PscUpdateCard from "@/components/site/PscUpdateCard";

export const metadata = {
  title: "PSC Notifications & Updates",
};

export const revalidate = 900; // 15 min - these come from a scraper, not live traffic

export default async function PscUpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const params = await searchParams;
  const activeSource = PSC_SOURCES.find((s) => s.key === params.source)?.key as
    | PscSourceKey
    | undefined;

  const updates = await getLatestPscUpdates({ source: activeSource, limit: 40 });

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">PSC Notifications &amp; Updates</h1>
      <p className="mt-2 text-slate-500">
        Auto-pulled from the official{" "}
        <a
          href="https://www.keralapsc.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-indigo-600"
        >
          keralapsc.gov.in
        </a>{" "}
        — notifications, syllabus, exam programme, results and more, refreshed
        automatically. Always verify against the official site before acting on
        any deadline.
      </p>

      <div className="scrollbar-hide mt-6 flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/psc-updates"
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
            !activeSource
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          All
        </Link>
        {PSC_SOURCES.map((s) => (
          <Link
            key={s.key}
            href={`/psc-updates?source=${s.key}`}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
              activeSource === s.key
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {updates.length === 0 ? (
        <p className="mt-10 text-slate-500">
          No updates yet — the scraper hasn&apos;t run, or hasn&apos;t found
          anything new for this section.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {updates.map((u) => (
            <PscUpdateCard key={u.id} update={u} />
          ))}
        </div>
      )}
    </div>
  );
}
