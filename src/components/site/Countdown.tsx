"use client";

import { useEffect, useState } from "react";

/**
 * Live countdown to a target date. Once the date passes it flips to a
 * "held on" state. targetDate is an ISO date string (YYYY-MM-DD).
 */
export default function Countdown({
  targetDate,
  futureLabel = "Exam starts in",
  pastLabel = "Exam held on",
}: {
  targetDate: string;
  futureLabel?: string;
  pastLabel?: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(targetDate + "T00:00:00").getTime();
  const diff = target - now;

  const pretty = new Date(targetDate + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (diff <= 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {pastLabel}
        </p>
        <p className="mt-1 text-xl font-extrabold text-slate-800">{pretty}</p>
      </div>
    );
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const cells: [number, string][] = [
    [days, "Days"],
    [hours, "Hours"],
    [mins, "Mins"],
    [secs, "Secs"],
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 px-5 py-4 text-center text-white shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">
        {futureLabel}
      </p>
      <div className="mt-2 flex items-center justify-center gap-2 sm:gap-3">
        {cells.map(([v, label], i) => (
          <div key={label} className="flex items-center gap-2 sm:gap-3">
            <div className="min-w-[3.25rem] rounded-xl bg-white/10 px-2 py-1.5 backdrop-blur">
              <p className="text-2xl font-black tabular-nums">
                {String(v).padStart(2, "0")}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-200">
                {label}
              </p>
            </div>
            {i < cells.length - 1 && (
              <span className="text-xl font-black text-indigo-300">:</span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm font-medium text-indigo-100">{pretty}</p>
    </div>
  );
}
