import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, FileText, Info } from "lucide-react";
import UpcomingCountdown from "@/components/site/UpcomingCountdown";
import { ExamRow } from "@/components/site/UpcomingExamRow";
import { UPCOMING_EXAM_MONTHS } from "@/data/upcoming-exams";
import { siteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  return UPCOMING_EXAM_MONTHS.map((m) => ({ month: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ month: string }>;
}): Promise<Metadata> {
  const { month } = await params;
  const data = UPCOMING_EXAM_MONTHS.find((m) => m.id === month);
  if (!data) return { title: "പരീക്ഷാ കലണ്ടർ" };
  const url = `${siteUrl()}/exam-calendar/${data.id}`;
  const title = `${data.title} പരീക്ഷകൾ — കേരള പി.എസ്.സി പരീക്ഷാ തീയതികൾ`;
  const description =
    `കേരള പി.എസ്.സി ${data.title} പരീക്ഷകൾ — ${data.exams.length} പരീക്ഷകൾ, ` +
    `തീയതി, സമയം, കാറ്റഗറി നമ്പർ, കൺഫർമേഷൻ, അഡ്മിറ്റ് കാർഡ് വിവരങ്ങൾ.`;
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

export default async function ExamMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  const data = UPCOMING_EXAM_MONTHS.find((m) => m.id === month);
  if (!data) notFound();

  const others = UPCOMING_EXAM_MONTHS.filter((m) => m.id !== data.id);
  const first = data.exams[0];
  const last = data.exams[data.exams.length - 1];

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
        പരീക്ഷാ കലണ്ടർ • കേരള പി.എസ്.സി
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {data.title} പരീക്ഷകൾ
      </h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        {data.title} മാസം നടക്കുന്ന കേരള പി.എസ്.സി പരീക്ഷകൾ — ആകെ{" "}
        {data.exams.length} പരീക്ഷകൾ
        {first && last
          ? `, ${first.dateLabel} മുതൽ ${last.dateLabel} വരെ`
          : ""}
        . തീയതി, സമയം, കാറ്റഗറി നമ്പർ, കൺഫർമേഷൻ, അഡ്മിറ്റ് കാർഡ്
        വിവരങ്ങൾ സഹിതം.
      </p>

      <div className="mt-6">
        <UpcomingCountdown exams={data.exams} />
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
          -ൽ പരിശോധിക്കുക. ജനുവരി പരീക്ഷകളുടെ സമയം പ്രസിദ്ധീകരിച്ചിട്ടില്ല
          — അത് അഡ്മിറ്റ് കാർഡിൽ കാണാം.
        </p>
      </div>

      {data.note && (
        <p className="mt-5 max-w-2xl text-sm text-slate-500">{data.note}</p>
      )}

      <ol className="mt-5 space-y-4">
        {data.exams.map((exam) => (
          <ExamRow key={`${exam.date}-${exam.categories}`} exam={exam} />
        ))}
      </ol>

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
          കാർഡ് ലഭിക്കില്ല. മെയിൻ പരീക്ഷകൾക്ക് കൺഫർമേഷൻ ആവശ്യമില്ല.
        </p>
      </section>

      <section className="mt-10 rounded-2xl bg-slate-900 p-6 text-slate-300 sm:p-8">
        <h2 className="text-lg font-extrabold text-white">
          ഈ മാസത്തെ പരീക്ഷയ്ക്ക് തയ്യാറെടുക്കുക
        </h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/mock-tests"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500"
          >
            <FileText size={16} />
            മോക്ക് ടെസ്റ്റുകൾ
          </Link>
          <Link
            href="/pyqs"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20"
          >
            പഴയ ചോദ്യപേപ്പറുകൾ
          </Link>
          <Link
            href="/syllabus"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20"
          >
            സിലബസ്
          </Link>
        </div>
      </section>

      <nav className="mt-10 flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5 font-bold text-slate-700">
          <CalendarDays size={16} className="text-indigo-600" />
          മറ്റ് മാസങ്ങൾ:
        </span>
        {others.map((m) => (
          <Link
            key={m.id}
            href={`/exam-calendar/${m.id}`}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 font-semibold text-indigo-600 hover:border-indigo-300"
          >
            {m.title}
          </Link>
        ))}
        <Link
          href="/upcoming-exams"
          className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 font-semibold text-indigo-600 hover:border-indigo-300"
        >
          എല്ലാ മാസങ്ങളും →
        </Link>
      </nav>
    </div>
  );
}
