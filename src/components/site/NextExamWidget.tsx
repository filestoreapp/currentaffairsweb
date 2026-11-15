"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import {
  ALL_UPCOMING_EXAMS,
  istDateOf,
  pickNextExam,
} from "@/data/upcoming-exams";

/**
 * Small "next exam" countdown card for the homepage.
 *
 * Reads the same static programme data as /upcoming-exams — no admin
 * data entry, no database. The next exam is picked on every tick from
 * the exam's end instant (IST), so once an exam is over the card flips
 * to the following exam by itself, even without a page reload. The
 * initial pick is server-rendered, so crawlers and no-JS visitors see
 * the exam name and date in the HTML.
 */
export default function NextExamWidget() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const next = pickNextExam(ALL_UPCOMING_EXAMS, now);

  if (!next) {
    return (
      <section className="mt-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center sm:p-5">
          <p className="text-sm font-semibold text-slate-600">
            വരാനിരിക്കുന്ന പരീക്ഷകളൊന്നും പട്ടികയിൽ ഇല്ല — ഉടൻ പരിശോധിക്കുക.
          </p>
          <Link
            href="/upcoming-exams"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
          >
            എല്ലാ പരീക്ഷകളും കാണുക
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    );
  }

  const { exam, window } = next;
  const isToday = istDateOf(now) === exam.date;
  const inProgress = now >= window.startMs && now < window.endMs;
  const diff = window.startMs - now;
  const days = Math.max(0, Math.floor(diff / 86400000));
  const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const secs = Math.max(0, Math.floor((diff % 60000) / 1000));
  const cells: [number, string][] = [
    [days, "ദിവസം"],
    [hours, "മണിക്കൂർ"],
    [mins, "മിനിറ്റ്"],
    [secs, "സെക്കൻഡ്"],
  ];

  return (
    <section className="mt-6">
      <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
              <CalendarClock size={14} />
              അടുത്ത പരീക്ഷ
              {isToday && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
                  ഇന്ന്
                </span>
              )}
            </p>
            <h2 className="mt-1.5 text-lg font-extrabold leading-snug tracking-tight text-slate-900 sm:text-xl">
              {exam.posts}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              കാറ്റഗറി {exam.categories} • {exam.dateLabel}
              {exam.time
                ? ` • ${exam.time}`
                : " • സമയം അഡ്മിറ്റ് കാർഡിൽ പരിശോധിക്കുക"}
            </p>
            <Link
              href="/upcoming-exams"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
            >
              എല്ലാ പരീക്ഷകളും കാണുക
              <ArrowRight size={15} />
            </Link>
          </div>

          {inProgress ? (
            <div className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-center text-white shadow">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100">
                പരീക്ഷ
              </p>
              <p className="mt-0.5 text-lg font-extrabold">
                ഇപ്പോൾ നടക്കുന്നു
              </p>
            </div>
          ) : (
            <div className="shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 px-4 py-3 text-center text-white shadow">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-200">
                തുടങ്ങാൻ ഇനി
              </p>
              <div className="mt-1.5 flex items-center justify-center gap-1.5">
                {cells.map(([v, label], i) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="min-w-[2.9rem] rounded-lg bg-white/10 px-1.5 py-1 backdrop-blur">
                      <p className="text-xl font-black tabular-nums">
                        {String(v).padStart(2, "0")}
                      </p>
                      <p className="text-[10px] font-semibold text-indigo-200">
                        {label}
                      </p>
                    </div>
                    {i < cells.length - 1 && (
                      <span className="text-base font-black text-indigo-300">
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
