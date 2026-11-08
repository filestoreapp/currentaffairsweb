import Link from "next/link";
import { notFound } from "next/navigation";
import { getExamBySlug, getExamRelatedContent } from "@/lib/exams";
import { EXAM_SYLLABI } from "@/data/exam-syllabi";
import type { Exam, Quiz } from "@/lib/types";
import {
  ChevronRight,
  BookOpen,
  Clock,
  Languages,
  Target,
  FileText,
  Download,
  ClipboardList,
  HelpCircle,
  GraduationCap,
  ExternalLink,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = EXAM_SYLLABI[slug];
  if (!data) return { title: "Syllabus not found" };
  return { title: data.seoTitle, description: data.seoDescription };
}

function PatternFact({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
      {note && <p className="mt-1 text-xs leading-relaxed text-amber-700">{note}</p>}
    </div>
  );
}

function MarksTable({
  rows,
  total,
}: {
  rows: { section: string; marks: number }[];
  total: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left">
            <th className="px-4 py-3 font-bold text-slate-700">വിഭാഗം</th>
            <th className="w-24 px-4 py-3 text-right font-bold text-slate-700">
              മാർക്ക്
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.section} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3 font-medium text-slate-800">{r.section}</td>
              <td className="px-4 py-3 text-right font-bold text-indigo-700">
                {r.marks}
              </td>
            </tr>
          ))}
          <tr className="bg-indigo-50/60">
            <td className="px-4 py-3 font-extrabold text-slate-900">ആകെ</td>
            <td className="px-4 py-3 text-right font-extrabold text-indigo-700">
              {total}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof BookOpen;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <Icon size={16} />
      </span>
      {children}
    </h2>
  );
}

function QuizLink({ quiz }: { quiz: Quiz }) {
  return (
    <Link
      href={`/${quiz.is_mock ? "mock-tests" : quiz.is_pyq ? "pyqs" : "quiz"}/${quiz.slug}`}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
        <ClipboardList size={17} />
      </span>
      <span>
        <span className="block font-semibold text-slate-800 group-hover:text-indigo-700">
          {quiz.title}
        </span>
        {quiz.description && (
          <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500">
            {quiz.description}
          </span>
        )}
      </span>
    </Link>
  );
}

export default async function ExamSyllabusPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = EXAM_SYLLABI[slug];
  if (!data) notFound();

  // DB is a bonus: name/description, syllabus topics and related content.
  // The page renders from static data even if the exam row is missing.
  const exam: Exam | null = await getExamBySlug(slug);
  const related = exam ? await getExamRelatedContent(exam) : null;

  const displayName = exam?.name ?? data.examName;
  const displayShort = exam?.short_name ?? data.shortName;
  const marksTotal = data.sections.reduce((s, r) => s + r.marks, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.seoTitle,
    description: data.seoDescription,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "/" },
        { "@type": "ListItem", position: 2, name: "Exams", item: "/exams" },
        {
          "@type": "ListItem",
          position: 3,
          name: displayShort,
          item: `/exams/${slug}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Syllabus",
          item: `/exams/${slug}/syllabus`,
        },
      ],
    },
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: data.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>
        <ChevronRight size={12} />
        <Link href="/exams" className="hover:text-indigo-600">
          Exams
        </Link>
        <ChevronRight size={12} />
        <Link href={`/exams/${slug}`} className="hover:text-indigo-600">
          {displayShort}
        </Link>
        <ChevronRight size={12} />
        <span className="font-semibold text-slate-700">സിലബസ്</span>
      </nav>

      {/* Header */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-lg bg-white/20 px-2.5 py-1 text-xs font-extrabold tracking-wide">
            {displayShort}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold ${
              data.syllabusStatus === "official"
                ? "text-emerald-700"
                : "text-amber-700"
            }`}
          >
            {data.syllabusStatus === "official" ? (
              <BadgeCheck size={12} />
            ) : (
              <AlertTriangle size={12} />
            )}
            {data.syllabusStatus === "official"
              ? "ഔദ്യോഗിക സിലബസ്"
              : "പ്രതീക്ഷിത സിലബസ്"}
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {data.malayalamTitle}
        </h1>
        <p className="mt-1 text-sm text-indigo-100">{data.malayalamSubtitle}</p>
        {data.intro.map((p, i) => (
          <p key={i} className="mt-3 max-w-3xl text-sm leading-relaxed text-indigo-50">
            {p}
          </p>
        ))}
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-indigo-200">
          {data.statusNote}
        </p>
      </div>

      {/* Exam pattern */}
      <section className="mt-10">
        <SectionTitle icon={Target}>പരീക്ഷാ പാറ്റേൺ</SectionTitle>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <PatternFact label="ആകെ മാർക്ക്" value={`${data.totalMarks} മാർക്ക്`} />
          <PatternFact label="സമയം" value={data.duration} note={data.durationNote} />
          <PatternFact label="മാധ്യമം" value={data.medium} />
          <PatternFact
            label="നെഗറ്റീവ് മാർക്കിങ്"
            value={data.negativeMarking}
            note={data.negativeMarkingNote}
          />
          <PatternFact label="തലം" value={data.level} />
          <PatternFact
            label="നില"
            value={
              data.syllabusStatus === "official"
                ? "ഔദ്യോഗികം"
                : "പ്രതീക്ഷിതം"
            }
          />
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500">
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" />
          ഈ പേജിലെ വിവരങ്ങൾ പരീക്ഷാ വിജ്ഞാപനത്തിനും ഔദ്യോഗിക സിലബസിനും
          അനുസരിച്ച് മാറാം — പരീക്ഷ എഴുതുന്നതിന് മുമ്പ് keralapsc.gov.in-ൽ
          ഉറപ്പുവരുത്തുക.
        </p>
      </section>

      {/* Marks distribution */}
      <section className="mt-10">
        <SectionTitle icon={FileText}>മാർക്ക് വിതരണം</SectionTitle>
        <div className="mt-4">
          <MarksTable rows={data.sections} total={marksTotal} />
        </div>
        {data.marksNote && (
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            {data.marksNote}
          </p>
        )}
        {data.prelims && (
          <div className="mt-8">
            <h3 className="text-base font-extrabold text-slate-800">
              {data.prelims.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{data.prelims.note}</p>
            <div className="mt-3">
              <MarksTable
                rows={data.prelims.sections}
                total={data.prelims.sections.reduce((s, r) => s + r.marks, 0)}
              />
            </div>
          </div>
        )}
      </section>

      {/* Official PDF */}
      {(data.officialPdfUrl || data.officialIndexUrl) && (
        <section className="mt-10">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <FileText size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-slate-800">
                {data.officialPdfUrl
                  ? "ഔദ്യോഗിക സിലബസ് PDF"
                  : "ഔദ്യോഗിക സിലബസ് സൂചിക"}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {data.officialPdfUrl
                  ? "കേരള പിഎസ്‌സിയുടെ ഔദ്യോഗിക സൈറ്റിലുള്ള സിലബസ് — നേരിട്ട് ഡൗൺലോഡ് ചെയ്യാം"
                  : "ഈ പരീക്ഷയുടെ നേരിട്ടുള്ള സിലബസ് PDF ലഭ്യമല്ല — ഔദ്യോഗിക സിലബസ് സൂചികയിൽ നോക്കാം"}
              </span>
            </span>
            <a
              href={data.officialPdfUrl ?? data.officialIndexUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              {data.officialPdfUrl ? (
                <>
                  <Download size={15} /> PDF ഡൗൺലോഡ്
                </>
              ) : (
                <>
                  <ExternalLink size={15} /> സിലബസ് സൂചിക
                </>
              )}
            </a>
          </div>
        </section>
      )}

      {/* Syllabus topics from the DB */}
      {exam && exam.syllabus.length > 0 && (
        <section className="mt-10">
          <SectionTitle icon={BookOpen}>സിലബസ് വിഷയങ്ങൾ</SectionTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {exam.syllabus.map((s, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="font-bold text-slate-800">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-xs font-extrabold text-indigo-700">
                    {i + 1}
                  </span>
                  {s.section}
                </p>
                {s.topics.length > 0 && (
                  <ul className="mt-2 space-y-1 pl-8 text-sm text-slate-600">
                    {s.topics.map((t, j) => (
                      <li key={j} className="list-disc">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mt-10">
        <SectionTitle icon={HelpCircle}>പതിവുചോദ്യങ്ങൾ</SectionTitle>
        <div className="mt-4 space-y-3">
          {data.faqs.map((f, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="font-bold text-slate-800">{f.q}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Preparation links */}
      <section className="mt-10">
        <SectionTitle icon={GraduationCap}>തയ്യാറെടുപ്പ്</SectionTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link
            href="/mock-tests"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <ClipboardList size={18} />
            </span>
            <span>
              <span className="block font-semibold text-slate-800 group-hover:text-indigo-700">
                മോക്ക് ടെസ്റ്റുകൾ
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {displayShort} മോക്ക് ടെസ്റ്റുകൾ പരിശീലിക്കാം
              </span>
            </span>
          </Link>
          <Link
            href="/pyqs"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <FileText size={18} />
            </span>
            <span>
              <span className="block font-semibold text-slate-800 group-hover:text-indigo-700">
                മുൻവർഷ ചോദ്യപേപ്പറുകൾ
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                2025–2026 PYQ ഡയറക്ടറി
              </span>
            </span>
          </Link>
          <Link
            href={`/exams/${slug}`}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <BookOpen size={18} />
            </span>
            <span>
              <span className="block font-semibold text-slate-800 group-hover:text-indigo-700">
                പരീക്ഷാ ഹബ്
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                തീയതികൾ, അറിയിപ്പുകൾ, ക്വിസുകൾ
              </span>
            </span>
          </Link>
        </div>

        {related && related.mocks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-extrabold text-slate-800">
              ഈ പരീക്ഷയുടെ മോക്ക് ടെസ്റ്റുകൾ
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {related.mocks.slice(0, 4).map((m) => (
                <QuizLink key={m.id} quiz={m} />
              ))}
            </div>
          </div>
        )}
        {related && related.pyqs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-extrabold text-slate-800">
              ഈ പരീക്ഷയുടെ മുൻവർഷ പേപ്പറുകൾ
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {related.pyqs.slice(0, 4).map((p) => (
                <QuizLink key={p.id} quiz={p} />
              ))}
            </div>
          </div>
        )}
        {related && related.quizzes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-extrabold text-slate-800">
              പ്രാക്ടീസ് ക്വിസുകൾ
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {related.quizzes.slice(0, 4).map((q) => (
                <QuizLink key={q.id} quiz={q} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Back to hub */}
      <div className="mt-10 flex items-center gap-2 text-sm">
        <Link
          href={`/exams/${slug}`}
          className="font-semibold text-indigo-600 hover:text-indigo-800"
        >
          ← {displayShort} പരീക്ഷാ ഹബിലേക്ക് മടങ്ങാം
        </Link>
        <span className="text-slate-300">·</span>
        <Link href="/exams" className="font-semibold text-indigo-600 hover:text-indigo-800">
          എല്ലാ പരീക്ഷകളും
        </Link>
      </div>

      {/* Telegram CTA */}
      <div className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 text-center">
        <p className="flex items-center justify-center gap-2 font-extrabold text-slate-800">
          <GraduationCap size={18} className="text-indigo-600" />
          {displayShort} തയ്യാറെടുപ്പ് ദിവസവും
        </p>
        <p className="mt-1 text-sm text-slate-600">
          മലയാളത്തിൽ ദിവസേനയുള്ള കറന്റ് അഫയേഴ്സ് ക്വിസുകൾ ടെലിഗ്രാമിൽ നേടാം.
        </p>
        <a
          href="https://t.me/Daily_CurrentAffairs_Malayalam"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          Join @Daily_CurrentAffairs_Malayalam
        </a>
      </div>
    </div>
  );
}
