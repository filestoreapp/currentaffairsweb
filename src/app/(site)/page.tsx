import { Suspense } from "react";
import Link from "next/link";
import { getPublishedPosts, getAllCategories } from "@/lib/posts";
import { getPublishedMocks, getPublishedPyqs, getPublishedQuizzes } from "@/lib/quizzes";
import HomeLatestPosts from "@/components/site/HomeLatestPosts";
import HomePscUpdates from "@/components/site/HomePscUpdates";
import {
  ClipboardList,
  ScrollText,
  ListChecks,
  Trophy,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Cache the homepage shell for 5 minutes. The searchParams-dependent
// sections (post pagination, PSC source filter) live in Suspense-wrapped
// islands below, so they stay dynamic without forcing the whole page
// to re-query Supabase on every visit.
export const revalidate = 300;

const FEATURES = [
  {
    href: "/mock-tests",
    icon: ClipboardList,
    title: "Mock Tests",
    titleMl: "മോക്ക് ടെസ്റ്റ്",
    desc: "Full-length exam-style tests with timer, negative marking and live leaderboards.",
    accent: "bg-indigo-600",
    soft: "bg-indigo-50 text-indigo-600",
  },
  {
    href: "/pyqs",
    icon: ScrollText,
    title: "PYQ Papers",
    titleMl: "പഴയ ചോദ്യപേപ്പറുകൾ",
    desc: "Real Kerala PSC previous year papers, playable like the actual exam.",
    accent: "bg-amber-600",
    soft: "bg-amber-50 text-amber-600",
  },
  {
    href: "/quiz",
    icon: Trophy,
    title: "Daily Quizzes",
    titleMl: "ദിവസേന ക്വിസ്",
    desc: "Bite-sized quizzes on daily current affairs — quick revision, instant feedback.",
    accent: "bg-emerald-600",
    soft: "bg-emerald-50 text-emerald-600",
  },
  {
    href: "/syllabus",
    icon: ListChecks,
    title: "Syllabus Tracker",
    titleMl: "സിലബസ് ട്രാക്കർ",
    desc: "Tick off every Kerala PSC syllabus topic and watch your coverage grow.",
    accent: "bg-violet-600",
    soft: "bg-violet-50 text-violet-600",
  },
];

function SectionSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ pscSource?: string; page?: string }>;
}) {
  // NOTE: searchParams is intentionally NOT awaited here — it's passed
  // straight through to the Suspense islands so this shell stays static.
  const [categories, mocks, pyqs, quizzes, { count }] = await Promise.all([
    getAllCategories(),
    getPublishedMocks(),
    getPublishedPyqs(),
    getPublishedQuizzes(),
    getPublishedPosts({ page: 1, perPage: 1 }),
  ]);

  const heroStats = [
    { value: mocks.length, label: "Mock Tests" },
    { value: pyqs.length, label: "PYQ Papers" },
    { value: quizzes.length, label: "Practice Quizzes" },
    { value: count, label: "Study Notes" },
  ];

  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-white sm:px-12 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/40 blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="absolute left-1/2 top-0 h-40 w-[36rem] -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-200">
            <Sparkles size={14} />
            കേരള PSC പരീക്ഷയ്ക്കുള്ള സൗജന്യ പഠനവേദി
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Crack Kerala PSC,
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
              {" "}one day at a time.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-slate-300">
            Daily current affairs, full-length mock tests, previous year
            papers and a syllabus tracker — everything an aspirant needs,
            free forever.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/mock-tests"
              className="group inline-flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3 font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              Take a Free Mock Test
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/current-affairs"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Today&apos;s Current Affairs
            </Link>
          </div>

          <dl className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4">
            {heroStats.map((s) => (
              <div key={s.label}>
                <dt className="order-2 mt-1 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  {s.label}
                </dt>
                <dd className="order-1 text-3xl font-extrabold text-white">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Your exam toolkit
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Four free tools, one goal — your name on the rank list.
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ href, icon: Icon, title, titleMl, desc, soft }) => (
            <Link
              key={href}
              href={href}
              className="card-hover group rounded-2xl border border-slate-200 bg-white p-5"
            >
              <span
                className={`inline-flex rounded-xl p-2.5 ${soft}`}
              >
                <Icon size={22} />
              </span>
              <span className="mt-4 block text-base font-bold text-slate-900 group-hover:text-indigo-600">
                {title}
                <span className="ml-2 text-xs font-semibold text-slate-400">
                  {titleMl}
                </span>
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-slate-500">
                {desc}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
                Start now
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-10 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Fresh off the press
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            Latest Updates
          </h2>
        </div>
        <Link
          href="/current-affairs"
          className="group inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
        >
          View all
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <Suspense fallback={<SectionSkeleton />}>
        <HomeLatestPosts searchParams={searchParams} />
      </Suspense>

      <section id="psc-updates" className="mt-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Official alerts
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              PSC Notifications &amp; Updates
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Auto-pulled from the official keralapsc.gov.in — pick a category
              to see just that.
            </p>
          </div>
          <Link
            href="/psc-updates"
            className="group hidden shrink-0 items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline sm:inline-flex"
          >
            View all
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <Suspense fallback={<SectionSkeleton />}>
          <HomePscUpdates searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
