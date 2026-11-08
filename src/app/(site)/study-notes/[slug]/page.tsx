import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getStudyTopic,
  STUDY_TOPICS_WITH_CONTENT,
} from "@/data/study-notes";
import { EXAM_SYLLABI, type ExamSyllabusPattern } from "@/data/exam-syllabi";
import {
  ChevronRight,
  BookOpen,
  GraduationCap,
  FileText,
  AlertTriangle,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  return STUDY_TOPICS_WITH_CONTENT.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getStudyTopic(slug);
  if (!topic || !topic.content) return { title: "കുറിപ്പ് കണ്ടെത്തിയില്ല" };
  const firstPara = topic.content.intro[0] ?? "";
  return {
    title: `${topic.topicMalayalam} | കേരള പിഎസ്‌സി പഠന കുറിപ്പുകൾ`,
    description:
      firstPara.length > 155 ? firstPara.slice(0, 152) + "…" : firstPara,
  };
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

export default async function StudyNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getStudyTopic(slug);
  if (!topic || !topic.content) notFound();
  const content = topic.content;

  const examLinks = topic.exams
    .map((e) => ({ slug: e, syllabus: EXAM_SYLLABI[e] }))
    .filter(
      (x): x is { slug: string; syllabus: ExamSyllabusPattern } =>
        Boolean(x.syllabus)
    );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${topic.topicMalayalam} — കേരള പിഎസ്‌സി പഠന കുറിപ്പ്`,
    description: content.intro[0] ?? "",
    inLanguage: "ml",
    author: {
      "@type": "Organization",
      name: "Kerala PSC Current Affairs",
      url: "https://www.psccurrentaffairs.online",
    },
    about: topic.subjectMalayalam,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "/" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Study Notes",
          item: "/study-notes",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: topic.topicMalayalam,
          item: `/study-notes/${slug}`,
        },
      ],
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
        <Link href="/study-notes" className="hover:text-indigo-600">
          പഠന കുറിപ്പുകൾ
        </Link>
        <ChevronRight size={12} />
        <span className="font-semibold text-slate-700">
          {topic.topicMalayalam}
        </span>
      </nav>

      {/* Header */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-lg bg-white/20 px-2.5 py-1 text-xs font-extrabold tracking-wide">
            {topic.subjectMalayalam}
          </span>
          {examLinks.map(({ slug: e, syllabus }) => (
            <Link
              key={e}
              href={`/exams/${e}/syllabus`}
              className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-50"
            >
              {syllabus.shortName} സിലബസ്
            </Link>
          ))}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {topic.topicMalayalam}
        </h1>
        <p className="mt-1 text-sm text-indigo-100">{topic.topic}</p>
        {content.intro.map((p, i) => (
          <p
            key={i}
            className="mt-3 max-w-3xl text-sm leading-relaxed text-indigo-50"
          >
            {p}
          </p>
        ))}
        {topic.subtopics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {topic.subtopics.map((s) => (
              <span
                key={s}
                className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-indigo-50"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sections */}
      {content.sections.map((sec, i) => (
        <section key={i} className="mt-10">
          <SectionTitle icon={i % 2 === 0 ? BookOpen : FileText}>
            {sec.heading}
          </SectionTitle>
          <div className="mt-4 space-y-3">
            {sec.paragraphs.map((p, j) => (
              <p
                key={j}
                className="text-sm leading-relaxed text-slate-700 sm:text-base"
              >
                {p}
              </p>
            ))}
          </div>
          {sec.bullets && sec.bullets.length > 0 && (
            <ul className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-white p-4">
              {sec.bullets.map((b, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2 text-sm leading-relaxed text-slate-700"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  {b}
                </li>
              ))}
            </ul>
          )}
          {sec.table && (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    {sec.table.headers.map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 font-bold text-slate-700"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sec.table.rows.map((row, j) => (
                    <tr
                      key={j}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {row[0]}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}

      {/* Revision points */}
      <section className="mt-10">
        <SectionTitle icon={ListChecks}>റിവിഷൻ പോയിന്റുകൾ</SectionTitle>
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <ul className="space-y-2">
            {content.revisionPoints.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm leading-relaxed text-emerald-900"
              >
                <Lightbulb
                  size={15}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="mt-6 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500">
        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" />
        ഈ കുറിപ്പ് പഠനസഹായത്തിനുള്ള ചുരുക്കമാണ് — പരീക്ഷയുടെ ഔദ്യോഗിക
        സിലബസും വിജ്ഞാപനവും keralapsc.gov.in-ൽ ഉറപ്പുവരുത്തുക.
      </p>

      {/* Related */}
      <section className="mt-10">
        <SectionTitle icon={GraduationCap}>തയ്യാറെടുപ്പ്</SectionTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {examLinks.map(({ slug: e, syllabus }) => (
            <Link
              key={e}
              href={`/exams/${e}/syllabus`}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <BookOpen size={18} />
              </span>
              <span>
                <span className="block font-semibold text-slate-800 group-hover:text-indigo-700">
                  {syllabus.shortName} സിലബസ്
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  ഈ വിഷയം വരുന്ന പരീക്ഷയുടെ സിലബസ്
                </span>
              </span>
            </Link>
          ))}
          <Link
            href="/study-notes"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <BookOpen size={18} />
            </span>
            <span>
              <span className="block font-semibold text-slate-800 group-hover:text-indigo-700">
                എല്ലാ കുറിപ്പുകളും
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                21 വിഷയങ്ങളിലായി 256 വിഷയങ്ങൾ
              </span>
            </span>
          </Link>
          <Link
            href="/mock-tests"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <FileText size={18} />
            </span>
            <span>
              <span className="block font-semibold text-slate-800 group-hover:text-indigo-700">
                മോക്ക് ടെസ്റ്റുകൾ
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                പഠിച്ചത് പരീക്ഷിച്ച് നോക്കാം
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* Back links */}
      <div className="mt-10 flex items-center gap-2 text-sm">
        <Link
          href="/study-notes"
          className="font-semibold text-indigo-600 hover:text-indigo-800"
        >
          ← എല്ലാ കുറിപ്പുകളിലേക്ക്
        </Link>
        <span className="text-slate-300">·</span>
        <Link
          href="/exams"
          className="font-semibold text-indigo-600 hover:text-indigo-800"
        >
          എല്ലാ പരീക്ഷകളും
        </Link>
      </div>

      {/* Telegram CTA */}
      <div className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 text-center">
        <p className="flex items-center justify-center gap-2 font-extrabold text-slate-800">
          <GraduationCap size={18} className="text-indigo-600" />
          ദിവസവും പഠിക്കാം
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
