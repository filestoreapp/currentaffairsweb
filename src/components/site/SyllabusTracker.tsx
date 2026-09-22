"use client";

import { useEffect, useMemo, useState } from "react";
import { SYLLABUS, SYLLABUS_STORAGE_KEY } from "@/lib/syllabus";
import { CheckCircle2, Circle, RotateCcw } from "lucide-react";

function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(SYLLABUS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export default function SyllabusTracker() {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(SYLLABUS_STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress, ready]);

  function toggle(itemId: string) {
    setProgress((p) => ({ ...p, [itemId]: !p[itemId] }));
  }

  const totals = useMemo(() => {
    let done = 0;
    let total = 0;
    const perSection: Record<string, { done: number; total: number }> = {};
    for (const section of SYLLABUS) {
      let sDone = 0;
      let sTotal = 0;
      for (const topic of section.topics) {
        for (let i = 0; i < topic.items.length; i++) {
          const id = `${section.id}/${topic.id}/${i}`;
          total += 1;
          sTotal += 1;
          if (progress[id]) {
            done += 1;
            sDone += 1;
          }
        }
      }
      perSection[section.id] = { done: sDone, total: sTotal };
    }
    return { done, total, perSection };
  }, [progress]);

  const overallPct =
    totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0;

  if (!ready) {
    return <div className="mt-8 animate-pulse text-slate-400">Loading your progress…</div>;
  }

  return (
    <div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Overall syllabus coverage
            </p>
            <p className="text-3xl font-extrabold text-slate-900">
              {overallPct}
              <span className="text-lg text-slate-400">%</span>
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm("Reset all syllabus progress?")) setProgress({});
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {totals.done} of {totals.total} topics mastered · saved on this
          device
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {SYLLABUS.map((section) => {
          const s = totals.perSection[section.id] ?? { done: 0, total: 0 };
          const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
          return (
            <section
              key={section.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {section.title}
                    {section.titleMl && (
                      <span className="ml-2 text-sm font-semibold text-slate-400">
                        {section.titleMl}
                      </span>
                    )}
                  </h2>
                  <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                    {pct}%
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {section.description}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {section.topics.map((topic) => (
                  <div key={topic.id} className="p-5">
                    <h3 className="text-sm font-bold text-slate-800">
                      {topic.title}
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {topic.items.map((item, i) => {
                        const id = `${section.id}/${topic.id}/${i}`;
                        const done = !!progress[id];
                        return (
                          <li key={id}>
                            <button
                              onClick={() => toggle(id)}
                              className="flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-slate-50"
                            >
                              {done ? (
                                <CheckCircle2
                                  size={18}
                                  className="mt-0.5 shrink-0 text-emerald-500"
                                />
                              ) : (
                                <Circle
                                  size={18}
                                  className="mt-0.5 shrink-0 text-slate-300"
                                />
                              )}
                              <span
                                className={
                                  done
                                    ? "text-slate-400 line-through"
                                    : "text-slate-700"
                                }
                              >
                                {item}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
