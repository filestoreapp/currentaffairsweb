import Link from "next/link";
import { getPublishedExams } from "@/lib/exams";
import { GraduationCap, ChevronRight, Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerala PSC Exams",
  description:
    "Kerala PSC exam hubs: syllabus, important dates, mock tests, previous year papers, quizzes and latest notifications for LDC, LGS, University Assistant and more.",
};

export const revalidate = 300;

const STATUS_STYLE: Record<string, string> = {
  upcoming: "bg-amber-100 text-amber-700",
  ongoing: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-200 text-slate-600",
};

export default async function ExamsIndexPage() {
  const exams = await getPublishedExams();

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
            One hub per exam — syllabus, dates, mocks, PYQs and notifications.
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
            <Link
              key={exam.id}
              href={`/exams/${exam.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg"
            >
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
          ))}
        </div>
      )}
    </div>
  );
}
