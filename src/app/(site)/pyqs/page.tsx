import Link from "next/link";
import { getPublishedPyqs, getPyqYears } from "@/lib/quizzes";
import { ScrollText, Clock, Users, Landmark } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerala PSC Previous Year Question Papers",
  description:
    "Practice real Kerala PSC previous year question papers free — exam-style timer, marking scheme and live leaderboards.",
};

export const revalidate = 300;

export default async function PyqPapersPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const [papers, years] = await Promise.all([getPublishedPyqs(), getPyqYears()]);
  const activeYear = year ? Number(year) : null;
  const visible =
    activeYear != null && !Number.isNaN(activeYear)
      ? papers.filter((p) => p.exam_year === activeYear)
      : papers;

  return (
    <div>
      <h1 className="text-3xl font-extrabold">PYQ Papers</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Real Kerala PSC previous year question papers, playable like the
        actual exam — timer, marking scheme and a live leaderboard. Free
        forever, no login needed.
      </p>

      {years.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/pyqs"
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              activeYear == null
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-300"
            }`}
          >
            All years
          </Link>
          {years.map((y) => (
            <Link
              key={y}
              href={`/pyqs?year=${y}`}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                activeYear === y
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-300"
              }`}
            >
              {y}
            </Link>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No PYQ papers published yet. Check back soon — papers are added
          regularly.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((paper) => (
            <Link
              key={paper.id}
              href={`/pyqs/${paper.slug}`}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <ScrollText size={20} />
              </span>
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="block font-bold text-slate-900">
                    {paper.title}
                  </span>
                  <span className="rounded-full bg-amber-600 px-2 py-0.5 text-xs font-bold text-white">
                    PYQ
                  </span>
                </span>
                {(paper.exam_name || paper.exam_year) && (
                  <span className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-600">
                    <Landmark size={14} className="text-slate-400" />
                    {[paper.exam_name, paper.exam_year]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
                {paper.description && (
                  <span className="mt-1 block text-sm text-slate-500">
                    {paper.description}
                  </span>
                )}
                <span className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400">
                  {paper.time_limit_seconds && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />{" "}
                      {Math.round(paper.time_limit_seconds / 60)} min
                    </span>
                  )}
                  {Number(paper.negative_marking) > 0 && (
                    <span>−{Number(paper.negative_marking)} negative</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {paper.attempt_count ?? 0} attempts
                  </span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
