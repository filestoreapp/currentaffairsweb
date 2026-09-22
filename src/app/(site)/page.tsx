import Link from "next/link";
import { getPublishedPosts, getAllCategories } from "@/lib/posts";
import { getLatestPscUpdates } from "@/lib/psc-updates";
import { getPublishedMocks, getPublishedPyqs, getPublishedQuizzes } from "@/lib/quizzes";
import { PSC_SOURCES } from "@/lib/psc-scraper/sources";
import type { PscSourceKey } from "@/lib/types";
import PostCard from "@/components/site/PostCard";
import PscUpdateCard from "@/components/site/PscUpdateCard";
import {
  ClipboardList,
  ScrollText,
  ListChecks,
  Trophy,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const PER_PAGE = 9;

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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ pscSource?: string; page?: string }>;
}) {
  const params = await searchParams;
  const activePscSource = PSC_SOURCES.find((s) => s.key === params.pscSource)?.key as
    | PscSourceKey
    | undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const [{ posts, count }, categories, pscUpdates, mocks, pyqs, quizzes] =
    await Promise.all([
      getPublishedPosts({ page, perPage: PER_PAGE }),
      getAllCategories(),
      getLatestPscUpdates({ source: activePscSource, limit: 6 }),
      getPublishedMocks(),
      getPublishedPyqs(),
      getPublishedQuizzes(),
    ]);
  const totalPages = Math.max(1, Math.ceil(count / PER_PAGE));

  const heroStats = [
    { value: mocks.length, label: "Mock Tests" },
    { value: pyqs.length, label: "PYQ Papers" },
    { value: quizzes.length, label: "Practice Quizzes" },
    { value: count, label: "Study Notes" },
  ];

  // Preserve the psc-updates filter (if any) when paginating the posts
  // section, so switching pages doesn't reset the other section.
  const pageHref = (p: number) =>
    `/?page=${p}${activePscSource ? `&pscSource=${activePscSource}` : ""}`;

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

      {posts.length === 0 ? (
        <p className="mt-6 text-slate-500">
          No posts published yet. Log in to /admin to create your first
          post.
        </p>
      ) : (
        <>
          {posts[0] && (
            <Link
              href={`/current-affairs/${posts[0].slug}`}
              className="card-hover group mt-6 grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-2"
            >
              <div className="relative min-h-56 overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 sm:min-h-72">
                {posts[0].cover_image ? (
                  <img
                    src={posts[0].cover_image}
                    alt={posts[0].title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-8">
                    <span className="text-6xl font-extrabold text-white/25">
                      PSC
                    </span>
                  </div>
                )}
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700 backdrop-blur">
                  Latest
                </span>
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                {posts[0].category && (
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    {posts[0].category.name}
                  </span>
                )}
                <h3 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 group-hover:text-indigo-700 sm:text-3xl">
                  {posts[0].title}
                </h3>
                {posts[0].excerpt && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500">
                    {posts[0].excerpt}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600">
                  Read the full story
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(1).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                p === page
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}

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

        <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-2">
          <Link
            href="/#psc-updates"
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
              !activePscSource
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            All
          </Link>
          {PSC_SOURCES.map((s) => (
            <Link
              key={s.key}
              href={`/?pscSource=${s.key}#psc-updates`}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
                activePscSource === s.key
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {pscUpdates.length === 0 ? (
          <p className="mt-6 text-slate-500">
            No updates yet for this category — the scraper hasn&apos;t run,
            or hasn&apos;t found anything new.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pscUpdates.map((u) => (
              <PscUpdateCard key={u.id} update={u} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
