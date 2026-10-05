import type { PaperSection } from "@/lib/types";

/**
 * Shared display for question-paper / answer-key sections.
 * downloadHref(sectionIndex, kind) builds the download URL — the PYQ page
 * and the PSC category page each pass their own route.
 */
export default function PaperSectionsList({
  sections,
  downloadHref,
}: {
  sections: PaperSection[];
  downloadHref: (sectionIndex: number, kind: "question" | "answer") => string;
}) {
  const visible = sections.filter((s) => s.question_key || s.answer_key);
  if (visible.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
        Question Papers &amp; Answer Keys
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {visible.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
          >
            <p className="font-bold text-slate-800">
              {s.label || `Section ${String.fromCharCode(65 + i)}`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.question_key && (
                <a
                  href={downloadHref(i, "question")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
                >
                  Question paper
                </a>
              )}
              {s.answer_key && (
                <a
                  href={downloadHref(i, "answer")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                >
                  Answer key
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
