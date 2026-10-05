import Link from "next/link";
import { getPublishedExams } from "@/lib/exams";
import { getPublishedPyqs, getPyqYears } from "@/lib/quizzes";
import { getLatestPscAnnouncements } from "@/lib/psc-latest";
import type { Quiz } from "@/lib/types";
import {
  GraduationCap,
  ChevronRight,
  Building2,
  ScrollText,
  Clock,
  Users,
  Landmark,
  Megaphone,
  Download,
} from "lucide-react";
import type { Metadata } from "next";
import ExamHubPapers from "@/components/site/ExamHubPapers";

export const metadata: Metadata = {
  title: "Kerala PSC Exams & PYQ Papers",
  description:
    "Kerala PSC exam hubs: syllabus, important dates, mock tests and previous year question papers for LDC, LGS, University Assistant and more.",
};

export const revalidate = 300;

const STATUS_STYLE: Record<string, string> = {
  upcoming: "bg-amber-100 text-amber-700",
  ongoing: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-200 text-slate-600",
};

function PyqPaperCard({ paper }: { paper: Quiz }) {
  return (
    <Link
      href={`/pyqs/${paper.slug}`}
      className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <ScrollText size={20} />
      </span>
      <span className="flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="block font-bold text-slate-900">{paper.title}</span>
          <span className="rounded-full bg-amber-600 px-2 py-0.5 text-xs font-bold text-white">
            PYQ
          </span>
        </span>
        {(paper.exam_name || paper.exam_year) && (
          <span className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-600">
            <Landmark size={14} className="text-slate-400" />
            {[paper.exam_name, paper.exam_year].filter(Boolean).join(" · ")}
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
              <Clock size={12} /> {Math.round(paper.time_limit_seconds / 60)}{" "}
              min
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
  );
}

export default async function ExamsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const [exams, papers, years, announcements] = await Promise.all([
    getPublishedExams(),
    getPublishedPyqs(),
    getPyqYears(),
    getLatestPscAnnouncements(),
  ]);

  const hubSlugs = new Set(exams.map((e) => e.slug));
  const papersByHub = new Map<string, Quiz[]>();
  const otherPapers: Quiz[] = [];
  for (const p of papers) {
    if (p.exam_slug && hubSlugs.has(p.exam_slug)) {
      const arr = papersByHub.get(p.exam_slug) ?? [];
      arr.push(p);
      papersByHub.set(p.exam_slug, arr);
    } else {
      otherPapers.push(p);
    }
  }

  const activeYear = year ? Number(year) : null;
  const visibleOthers =
    activeYear != null && !Number.isNaN(activeYear)
      ? otherPapers.filter((p) => p.exam_year === activeYear)
      : otherPapers;

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <GraduationCap size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Kerala PSC Exams
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            One hub per exam — syllabus, dates, mocks and previous year
            papers.
          </p>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-700">No exam hubs yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Run the exams migration in Supabase and add exams from Admin →
            Exams.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-300 hover:shadow-lg"
            >
              <Link href={`/exams/${exam.slug}`} className="block p-5 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-extrabold tracking-wide text-indigo-700">
                    {exam.short_name}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLE[exam.status] ?? STATUS_STYLE.upcoming}`}
                  >
                    {exam.status}
                  </span>
                </div>
                <h2 className="mt-3 font-bold text-slate-900 group-hover:text-indigo-700">
                  {exam.name}
                </h2>
                {exam.department && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2 size={12} /> {exam.department}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  {exam.qualification && <span>🎓 {exam.qualification}</span>}
                  {exam.exam_date && (
                    <span>
                      📅{" "}
                      {new Date(exam.exam_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
                  Open exam hub <ChevronRight size={15} />
                </span>
              </Link>
              <div className="mt-auto">
                <ExamHubPapers papers={papersByHub.get(exam.slug) ?? []} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Latest announcements from keralapsc.gov.in */}
      {announcements.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Megaphone size={22} />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Latest from Kerala PSC
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Fresh announcements from keralapsc.gov.in — ranked lists,
                short lists, admission tickets and more.
              </p>
            </div>
          </div>
          <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {announcements.map((a, i) => (
              <div
                key={`${a.sl}-${i}`}
                className="flex items-start gap-3 px-4 py-3.5"
              >
                <span
                  className={`mt-0.5 inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    a.type.toLowerCase().includes("ranked")
                      ? "bg-emerald-100 text-emerald-700"
                      : a.type.toLowerCase().includes("short")
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {a.type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {a.title}
                  </p>
                  {a.details && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                      {a.details}
                    </p>
                  )}
                </div>
                {a.fileUrl && (
                  <a
                    href={a.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-indigo-100 hover:text-indigo-700"
                  >
                    <Download size={12} /> PDF
                  </a>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Source: keralapsc.gov.in/latest · refreshed hourly
          </p>
        </section>
      )}

      {/* Papers not linked to any exam hub */}
      <section id="pyq-papers" className="mt-14 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-600 text-white">
            <ScrollText size={22} />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              More PYQ Papers
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Previous year papers not linked to an exam hub above — playable
              like the actual exam, with timer and leaderboard.
            </p>
          </div>
        </div>

        {years.length > 0 && otherPapers.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/exams#pyq-papers"
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
                href={`/exams?year=${y}#pyq-papers`}
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

        {visibleOthers.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            {otherPapers.length === 0
              ? "Every paper is linked to its exam hub above."
              : "No papers for this year yet."}
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visibleOthers.map((paper) => (
              <PyqPaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
