import Link from "next/link";
import { getPublishedExams } from "@/lib/exams";
import { GraduationCap, ChevronRight } from "lucide-react";
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
            One hub per exam — exam codes, syllabus, dates, documents, mocks and notifications.
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
                <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-bold">Exam</th>
                <th className="px-4 py-3 font-bold">Exam Code</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.map((exam) => (
                <tr key={exam.id} className="relative transition hover:bg-indigo-50/50">
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/exams/${exam.slug}`}
                      className="before:absolute before:inset-0"
                      aria-label={`${exam.name} — open exam hub`}
                    >
                      <span className="mr-2 inline-flex rounded-lg bg-indigo-100 px-2 py-0.5 align-middle text-xs font-extrabold tracking-wide text-indigo-700">
                        {exam.short_name}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {exam.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    {exam.question_paper_code ? (
                      <span className="font-mono text-[13px] font-semibold text-slate-700">
                        {exam.question_paper_code}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLE[exam.status] ?? STATUS_STYLE.upcoming}`}
                    >
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <ChevronRight size={16} className="ml-auto text-slate-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
