"use client";

import Countdown from "@/components/site/Countdown";
import type { UpcomingExam } from "@/data/upcoming-exams";

/**
 * Picks the next exam that has not happened yet (by local date) and shows
 * the live countdown to it. Once every listed exam is past, shows a
 * fallback line instead of a stale countdown.
 */
export default function UpcomingCountdown({ exams }: { exams: UpcomingExam[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = exams.find((e) => new Date(e.date + "T00:00:00") >= today);

  if (!next) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center">
        <p className="text-sm font-semibold text-slate-600">
          പട്ടികയിലെ എല്ലാ പരീക്ഷകളും പൂർത്തിയായി — പുതിയ പദ്ധതി വരുമ്പോൾ ഈ
          പേജ് പുതുക്കും.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-center text-sm font-semibold text-slate-600">
        അടുത്ത പരീക്ഷ: <span className="text-slate-900">{next.posts}</span>{" "}
        — {next.dateLabel}
      </p>
      <div className="mt-3">
        <Countdown
          targetDate={next.date}
          futureLabel="പരീക്ഷ തുടങ്ങാൻ ഇനി"
          pastLabel="പരീക്ഷ നടന്നത്"
        />
      </div>
    </div>
  );
}
