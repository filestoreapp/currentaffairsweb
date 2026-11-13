import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, FileText, Info, Ticket } from "lucide-react";
import UpcomingCountdown from "@/components/site/UpcomingCountdown";
import {
  ALL_UPCOMING_EXAMS,
  UPCOMING_EXAM_MONTHS,
  type ConfirmationInfo,
  type UpcomingExam,
} from "@/data/upcoming-exams";
import { siteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

const MALAYALAM_MONTHS = [
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

function confirmationBadge(c: ConfirmationInfo) {
  switch (c.kind) {
    case "finalized":
      return {
        cls: "border-sky-200 bg-sky-50 text-sky-700",
        label: "കൺഫർമേഷന് ശേഷം അന്തിമമാക്കി",
      };
    case "open":
      return {
        cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
        label: `കൺഫർമേഷൻ തുറന്നിരിക്കുന്നു — ${c.window}`,
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

function ExamRow({ exam }: { exam: UpcomingExam }) {
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

export async function generateMetadata(): Promise<Metadata> {
  const url = `${siteUrl()}/upcoming-exams`;
  const title = "വരാനിരിക്കുന്ന പരീക്ഷകൾ — കേരള പി.എസ്.സി പരീക്ഷാ തീയതികൾ 2026–27";
  const description =
    "കേരള പി.എസ്.സി വരാനിരിക്കുന്ന പരീക്ഷകൾ — നവംബർ, ഡിസംബർ 2026, ജനുവരി 2027 പരീക്ഷാ തീയതികൾ, കാറ്റഗറി നമ്പർ, കൺഫർമേഷൻ, അഡ്മിറ്റ് കാർഡ് വിവരങ്ങൾ.";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
  };
}

export default function UpcomingExamsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
        കേരള പി.എസ്.സി • 2026–27
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        വരാനിരിക്കുന്ന പരീക്ഷകൾ
      </h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        കേരള പബ്ലിക് സർവീസ് കമ്മീഷന്റെ ഔദ്യോഗിക പരീക്ഷാ പദ്ധതികൾ പ്രകാരം
        ഇനി നടക്കാനിരിക്കുന്ന പരീക്ഷകൾ — തീയതി, സമയം, കാറ്റഗറി നമ്പർ,
        കൺഫർമേഷൻ, അഡ്മിറ്റ് കാർഡ് വിവരങ്ങൾ സഹിതം.
      </p>

      <div className="mt-6">
        <UpcomingCountdown exams={ALL_UPCOMING_EXAMS} />
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Info size={17} className="mt-0.5 shrink-0" />
        <p>
          തീയതികൾ മാറാം. യാത്ര തീരുമാനിക്കുന്നതിന് മുൻപ്{" "}
          <a
            href="https://www.keralapsc.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            keralapsc.gov.in
          </a>{" "}
          -ൽ പരിശോധിക്കുക. സമയവും വേദിയും അഡ്മിറ്റ് കാർഡിൽ
          രേഖപ്പെടുത്തിയിരിക്കും.
        </p>
      </div>

      {UPCOMING_EXAM_MONTHS.map((month) => (
        <section key={month.id} className="mt-10">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <CalendarDays size={22} className="text-indigo-600" />
            {month.title}
          </h2>
          {month.note && (
            <p className="mt-2 max-w-2xl text-sm text-slate-500">{month.note}</p>
          )}
          <ol className="mt-5 space-y-4">
            {month.exams.map((exam) => (
              <ExamRow key={`${exam.date}-${exam.categories}`} exam={exam} />
            ))}
          </ol>
        </section>
      ))}

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-extrabold text-slate-900">
          കൺഫർമേഷൻ എന്നാൽ എന്ത്?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          പരീക്ഷ എഴുതാൻ താൽപര്യമുണ്ടെന്ന് ഉദ്യോഗാർത്ഥി മുൻകൂട്ടി
          അറിയിക്കുന്ന നടപടിയാണ് കൺഫർമേഷൻ. തുളസി പ്രൊഫൈലിൽ
          (thulasi.psc.kerala.gov.in) &ldquo;Confirmation for Written
          Exam&rdquo; എന്ന ഭാഗത്ത് കാറ്റഗറി തിരഞ്ഞെടുത്ത് സമർപ്പിക്കണം.
          നിശ്ചിത സമയപരിധിക്കുള്ളിൽ കൺഫർമേഷൻ നൽകാത്തവർക്ക് അഡ്മിറ്റ്
          കാർഡ് ലഭിക്കില്ല — പരീക്ഷ എഴുതാൻ കഴിയില്ല. മെയിൻ
          പരീക്ഷകൾക്ക് കൺഫർമേഷൻ ആവശ്യമില്ല; ഷോർട്ട്‌ലിസ്റ്റ്
          ചെയ്യപ്പെട്ടവർക്ക് അഡ്മിറ്റ് കാർഡ് നേരിട്ട് ലഭിക്കും.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          പരീക്ഷാ ഹാളിലേക്ക് അഡ്മിറ്റ് കാർഡിനൊപ്പം ഒറിജിനൽ ഫോട്ടോ
          തിരിച്ചറിയൽ രേഖ (ആധാർ, വോട്ടർ ഐഡി, പാൻ കാർഡ്, ഡ്രൈവിങ്
          ലൈസൻസ് തുടങ്ങിയവ) കരുതണം.
        </p>
      </section>

      <section className="mt-10 rounded-2xl bg-slate-900 p-6 text-slate-300 sm:p-8">
        <h2 className="text-lg font-extrabold text-white">
          പരീക്ഷാ പദ്ധതിയെക്കുറിച്ച് കൂടുതൽ വായിക്കാം
        </h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/current-affairs/november-2026-exam-plan"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500"
          >
            <FileText size={16} />
            നവംബർ 2026 പരീക്ഷാ പദ്ധതി
          </Link>
          <Link
            href="/current-affairs/december-2026-exam-plan"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20"
          >
            <FileText size={16} />
            ഡിസംബർ 2026 പരീക്ഷാ പദ്ധതി
          </Link>
          <Link
            href="/mock-tests"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20"
          >
            മോക്ക് ടെസ്റ്റുകൾ
          </Link>
        </div>
      </section>
    </div>
  );
}
