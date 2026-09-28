import Link from "next/link";
import { notFound } from "next/navigation";
import { getExamBySlug, getExamRelatedContent } from "@/lib/exams";
import type { Exam, Quiz, PscUpdate } from "@/lib/types";
import {
  ChevronRight,
  GraduationCap,
  CalendarDays,
  BookOpen,
  Bell,
  FileText,
  ClipboardList,
  Target,
} from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);
  if (!exam) return { title: "Exam not found" };
  const desc = exam.description
    ? exam.description.slice(0, 155)
    : `${exam.name} (${exam.short_name}) — syllabus, important dates, mock tests, PYQ papers and latest Kerala PSC notifications.`;
  return {
    title: `${exam.short_name} – ${exam.name}`,
    description: desc,
  };
}

const STATUS_STYLE: Record<string, string> = {
  upcoming: "bg-amber-100 text-amber-700",
  ongoing: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-200 text-slate-600",
};

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800">
        {value || <span className="font-normal text-slate-400">To be announced</span>}
      </p>
    </div>
  );
}

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function QuizCard({ quiz, icon: Icon }: { quiz: Quiz; icon: typeof FileText }) {
  return (
    <Link
      href={`/${quiz.is_mock ? "mock-tests" : quiz.is_pyq ? "pyqs" : "quiz"}/${quiz.slug}`}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
        <Icon size={17} />
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

function SectionTitle({ icon: Icon, children }: { icon: typeof Bell; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <Icon size={16} />
      </span>
      {children}
    </h2>
  );
}

export default async function ExamHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exam: Exam | null = await getExamBySlug(slug);
  if (!exam) notFound();

  const related = await getExamRelatedContent(exam);

  const dates: { label: string; value: string | null }[] = [
    { label: "Notification", value: fmtDate(exam.notification_date) },
    { label: "Admit Card", value: fmtDate(exam.admit_card_date) },
    { label: "Exam Date", value: fmtDate(exam.exam_date) },
    { label: "Result", value: fmtDate(exam.result_date) },
  ].filter((d) => d.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${exam.short_name} – ${exam.name}`,
    description: exam.description ?? undefined,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "/" },
        { "@type": "ListItem", position: 2, name: "Exams", item: "/exams" },
        {
          "@type": "ListItem",
          position: 3,
          name: exam.short_name,
          item: `/exams/${exam.slug}`,
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
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <ChevronRight size={12} />
        <Link href="/exams" className="hover:text-indigo-600">Exams</Link>
        <ChevronRight size={12} />
        <span className="font-semibold text-slate-700">{exam.short_name}</span>
      </nav>

      {/* Header */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-lg bg-white/20 px-2.5 py-1 text-xs font-extrabold tracking-wide">
            {exam.short_name}
          </span>
          <span
            className={`inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
              exam.status === "ongoing"
                ? "text-emerald-700"
                : exam.status === "completed"
                  ? "text-slate-600"
                  : "text-amber-700"
            }`}
          >
            {exam.status}
          </span>
          {exam.category_no && (
            <span className="inline-flex rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold">
              Category No. {exam.category_no}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {exam.name}
        </h1>
        {exam.department && (
          <p className="mt-1 text-sm text-indigo-100">{exam.department}</p>
        )}
        {exam.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-indigo-50">
            {exam.description}
          </p>
        )}
      </div>

      {/* Key facts */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Fact label="Qualification" value={exam.qualification} />
        <Fact label="Age Limit" value={exam.age_limit} />
        <Fact label="Pay Scale" value={exam.pay_scale} />
        <Fact label="Vacancy" value={exam.vacancy} />
        <Fact label="Category No" value={exam.category_no} />
        <Fact label="Department" value={exam.department} />
      </div>

      {/* Important dates */}
      {dates.length > 0 && (
        <section className="mt-10">
          <SectionTitle icon={CalendarDays}>Important Dates</SectionTitle>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {dates.map((d) => (
              <div
                key={d.label}
                className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                  {d.label}
                </p>
                <p className="mt-1 font-bold text-slate-800">{d.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Syllabus */}
      {exam.syllabus.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <SectionTitle icon={BookOpen}>Syllabus</SectionTitle>
            <Link
              href="/syllabus"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Full syllabus tracker →
            </Link>
          </div>
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

      {/* Notifications */}
      {related.updates.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <SectionTitle icon={Bell}>Notifications & Updates</SectionTitle>
            <Link
              href="/psc-updates"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              All PSC updates →
            </Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {related.updates.map((u: PscUpdate) => (
              <Link
                key={u.id}
                href={`/psc-updates/${u.id}`}
                className="block px-4 py-3 transition hover:bg-indigo-50/50"
              >
                <p className="text-sm font-semibold text-slate-800">
                  {u.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {u.category_number ? `Category ${u.category_number} · ` : ""}
                  {u.source}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Mock tests */}
      {related.mocks.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <SectionTitle icon={ClipboardList}>Mock Tests</SectionTitle>
            <Link
              href="/mock-tests"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              All mock tests →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.mocks.map((m) => (
              <QuizCard key={m.id} quiz={m} icon={ClipboardList} />
            ))}
          </div>
        </section>
      )}

      {/* PYQ papers */}
      {related.pyqs.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <SectionTitle icon={FileText}>Previous Year Papers</SectionTitle>
            <Link
              href="/pyqs"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              All PYQ papers →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.pyqs.map((p) => (
              <QuizCard key={p.id} quiz={p} icon={FileText} />
            ))}
          </div>
        </section>
      )}

      {/* Practice quizzes */}
      {related.quizzes.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <SectionTitle icon={Target}>Practice Quizzes</SectionTitle>
            <Link
              href="/quiz"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              All quizzes →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.quizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} icon={Target} />
            ))}
          </div>
        </section>
      )}

      {/* Telegram CTA */}
      <div className="mt-10 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 text-center">
        <p className="flex items-center justify-center gap-2 font-extrabold text-slate-800">
          <GraduationCap size={18} className="text-indigo-600" />
          Preparing for {exam.short_name}?
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Get daily current affairs quizzes in Malayalam on Telegram.
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
