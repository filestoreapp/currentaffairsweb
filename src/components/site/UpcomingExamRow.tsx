import { Ticket } from "lucide-react";
import type { ConfirmationInfo, UpcomingExam } from "@/data/upcoming-exams";

export const MALAYALAM_MONTHS = [
  "ജനു",
  "ഫെബ്രു",
  "മാർ",
  "ഏപ്രി",
  "മേയ്",
  "ജൂൺ",
  "ജൂലൈ",
  "ഓഗ",
  "സെപ്റ്റം",
  "ഒക്ടോ",
  "നവം",
  "ഡിസം",
];

/** End date (YYYY-MM-DD) of a "26/10–14/11/2026" style window, or null. */
function windowEndISO(window: string): string | null {
  const parts = window.split("–");
  const end = parts[parts.length - 1]?.trim() ?? "";
  const m = end.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/** Today's date in IST (YYYY-MM-DD). */
function todayIST(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export function confirmationBadge(c: ConfirmationInfo) {
  // An "open" window whose end date has passed is shown as closed — the
  // data file is not edited every day, so the rendering stays honest.
  if (c.kind === "open") {
    const end = windowEndISO(c.window);
    if (end && end < todayIST()) {
      return {
        cls: "border-amber-200 bg-amber-50 text-amber-800",
        label: `കൺഫർമേഷൻ അവസാനിച്ചു — ${c.window}`,
      };
    }
    return {
      cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
      label: `കൺഫർമേഷൻ തുറന്നിരിക്കുന്നു — ${c.window}`,
    };
  }
  switch (c.kind) {
    case "finalized":
      return {
        cls: "border-sky-200 bg-sky-50 text-sky-700",
        label: "കൺഫർമേഷന് ശേഷം അന്തിമമാക്കി",
      };
    case "closed":
      return {
        cls: "border-amber-200 bg-amber-50 text-amber-800",
        label: `കൺഫർമേഷൻ അവസാനിച്ചു — ${c.window}`,
      };
    case "not-required":
      return {
        cls: "border-slate-200 bg-slate-100 text-slate-600",
        label: "കൺഫർമേഷൻ ആവശ്യമില്ല",
      };
  }
}

export function ExamRow({ exam }: { exam: UpcomingExam }) {
  const badge = confirmationBadge(exam.confirmation);
  const [year, month, day] = exam.date.split("-").map(Number);
  return (
    <li
      className={`flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow sm:flex-row ${
        exam.highlight
          ? "border-indigo-300 ring-1 ring-indigo-200"
          : "border-slate-200 hover:border-indigo-200"
      }`}
    >
      <div
        className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl text-white ${
          exam.highlight
            ? "bg-gradient-to-br from-indigo-600 to-violet-600"
            : "bg-gradient-to-br from-slate-600 to-slate-800"
        }`}
      >
        <span className="text-xl font-black leading-none">{day}</span>
        <span className="mt-1 text-[10px] font-bold leading-tight">
          {MALAYALAM_MONTHS[month - 1]} &apos;{String(year).slice(2)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          {exam.dateLabel}
        </p>
        <h3 className="mt-0.5 font-bold text-slate-900">{exam.posts}</h3>
        <p className="mt-1 text-sm text-slate-600">
          കാറ്റഗറി: {exam.categories} · {exam.scope}
        </p>
        <p className="mt-0.5 text-sm text-slate-600">
          സമയം: {exam.time ?? "അഡ്മിറ്റ് കാർഡിൽ കാണാം"}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
          <Ticket size={14} className="shrink-0 text-slate-400" />
          അഡ്മിറ്റ് കാർഡ് {exam.admitFrom}
        </p>
        {exam.note && (
          <p className="mt-2 text-sm text-slate-500">{exam.note}</p>
        )}
      </div>
      <span
        className={`inline-flex h-fit shrink-0 items-center rounded-full border px-3 py-1.5 text-center text-xs font-bold ${badge.cls}`}
      >
        {badge.label}
      </span>
    </li>
  );
}
