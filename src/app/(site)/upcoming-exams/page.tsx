import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/seo";
import { CalendarDays, FileText, Info } from "lucide-react";
import UpcomingCountdown from "@/components/site/UpcomingCountdown";
import { ExamRow } from "@/components/site/UpcomingExamRow";
import {
  ALL_UPCOMING_EXAMS,
  UPCOMING_EXAM_MONTHS,
} from "@/data/upcoming-exams";
import { siteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const url = `${siteUrl()}/upcoming-exams`;
  // Search title in English — the visible H1 stays Malayalam.
  const title = "Kerala PSC Upcoming Exams 2026–27 — Dates";
  const description =
    "കേരള പി.എസ്.സി വരാനിരിക്കുന്ന പരീക്ഷകൾ — നവംബർ, ഡിസംബർ 2026, ജനുവരി 2027 പരീക്ഷാ തീയതികൾ, കാറ്റഗറി നമ്പർ, കൺഫർമേഷൻ, അഡ്മിറ്റ് കാർഡ് വിവരങ്ങൾ.";
  return {
    title: { absolute: title },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Upcoming Exams" },
            ])
          ),
        }}
      />
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
          <Link
            href={`/exam-calendar/${month.id}`}
            className="mt-1 inline-block text-sm font-bold text-indigo-600 hover:text-indigo-800"
          >
            {month.title} മാസത്തെ പരീക്ഷകൾ പ്രത്യേക പേജിൽ കാണൂ →
          </Link>
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
