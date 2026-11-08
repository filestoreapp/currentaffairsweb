import Link from "next/link";
import SyllabusTracker from "@/components/site/SyllabusTracker";
import { EXAM_SYLLABI } from "@/data/exam-syllabi";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerala PSC Syllabus Tracker",
  description:
    "Track your Kerala PSC syllabus coverage topic by topic for LDC, LGS, University Assistant and degree-level exams — tick off what you've mastered, no login needed.",
};

export default function SyllabusPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Kerala PSC Syllabus Tracker</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        The Kerala PSC syllabus, broken into checkable topics. Tick off each
        topic as you master it — your progress is saved on this device, no
        login needed.
      </p>
      <SyllabusTracker />

      <section className="mt-12">
        <h2 className="text-xl font-extrabold tracking-tight">
          Per-exam syllabus pages
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Detailed syllabus, exam pattern and section-wise marks for each
          major Kerala PSC exam.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.values(EXAM_SYLLABI).map((s) => (
            <Link
              key={s.slug}
              href={`/exams/${s.slug}/syllabus`}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
            >
              <span className="block font-semibold text-slate-800 group-hover:text-indigo-700">
                {s.examName} Syllabus
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {s.shortName} · {s.totalMarks} marks · {s.duration}
                {s.syllabusStatus === "expected" ? " · Expected syllabus" : ""}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
