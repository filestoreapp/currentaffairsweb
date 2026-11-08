"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, BookOpen, Clock } from "lucide-react";

export interface StudyNotesIndexTopic {
  slug: string;
  topic: string;
  topicMalayalam: string;
  hasContent: boolean;
}

export interface StudyNotesIndexSubject {
  subject: string;
  subjectMalayalam: string;
  topics: StudyNotesIndexTopic[];
}

function matches(t: StudyNotesIndexTopic, s: StudyNotesIndexSubject, q: string) {
  const hay = [t.topic, t.topicMalayalam, s.subject, s.subjectMalayalam]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export default function StudyNotesIndex({
  subjects,
}: {
  subjects: StudyNotesIndexSubject[];
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return subjects
      .map((s) => ({
        ...s,
        topics: s.topics.filter((t) => !q || matches(t, s, q)),
      }))
      .filter((s) => s.topics.length > 0);
  }, [subjects, q]);

  const totalTopics = subjects.reduce((n, s) => n + s.topics.length, 0);
  const totalShown = filtered.reduce((n, s) => n + s.topics.length, 0);
  const totalLive = subjects.reduce(
    (n, s) => n + s.topics.filter((t) => t.hasContent).length,
    0
  );

  return (
    <div>
      <div className="relative">
        <Search
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="വിഷയം മലയാളത്തിലോ ഇംഗ്ലീഷിലോ തിരയാം…"
          aria-label="Search study notes"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {q ? (
          <>
            <span className="font-bold text-slate-800">{totalShown}</span>{" "}
            വിഷയങ്ങൾ കണ്ടെത്തി
            {totalShown === 0 && " — മറ്റൊരു പേര് പരീക്ഷിക്കൂ."}
          </>
        ) : (
          <>
            <span className="font-bold text-slate-800">{totalTopics}</span>{" "}
            വിഷയങ്ങൾ —{" "}
            <span className="font-bold text-slate-800">{totalLive}</span>{" "}
            എണ്ണത്തിന്റെ കുറിപ്പുകൾ തയ്യാർ, ബാക്കിയുള്ളവ വരുന്നതേയുള്ളൂ
          </>
        )}
      </p>

      {filtered.length === 0 && q && (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          ഈ തിരച്ചിലിന് വിഷയങ്ങളൊന്നും കിട്ടിയില്ല. മറ്റൊരു പേര് പരീക്ഷിക്കൂ.
        </p>
      )}

      {filtered.map((s) => (
        <section key={s.subject} className="mt-8">
          <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <BookOpen size={16} />
            </span>
            {s.subjectMalayalam}
            <span className="text-sm font-bold text-slate-400">
              {s.topics.length} വിഷയങ്ങൾ
            </span>
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {s.topics.map((t) =>
              t.hasContent ? (
                <Link
                  key={t.slug}
                  href={`/study-notes/${t.slug}`}
                  className="group flex items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
                >
                  <span>
                    <span className="block font-semibold text-slate-800 group-hover:text-indigo-700">
                      {t.topicMalayalam}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {t.topic}
                    </span>
                  </span>
                  <span className="mt-1 shrink-0 text-xs font-bold text-indigo-600">
                    വായിക്കാം →
                  </span>
                </Link>
              ) : (
                <div
                  key={t.slug}
                  className="flex items-start justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <span>
                    <span className="block font-semibold text-slate-500">
                      {t.topicMalayalam}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {t.topic}
                    </span>
                  </span>
                  <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                    <Clock size={11} /> വരുന്നതേയുള്ളൂ
                  </span>
                </div>
              )
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
