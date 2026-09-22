import Link from "next/link";
import {
  getTopPosts,
  getTotalPostViews,
  getVisitsOverTime,
  getContentCounts,
  getViewsByCategory,
  getTopPages,
  getPostsPublishedOverTime,
  getEngagementSummary,
} from "@/lib/stats";
import { getQuizStatsForAdmin } from "@/lib/quizzes";
import { getPscUpdateCountsBySource } from "@/lib/psc-updates";
import { PSC_SOURCES } from "@/lib/psc-scraper/sources";
import VisitsChart from "@/components/admin/VisitsChart";
import PostsPublishedChart from "@/components/admin/PostsPublishedChart";
import {
  Eye,
  ClipboardList,
  TrendingUp,
  Percent,
  FileText,
  FolderOpen,
  Megaphone,
  FilePenLine,
  BarChart3,
  Ban,
} from "lucide-react";

const RANGE_OPTIONS = [7, 30, 90];

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = RANGE_OPTIONS.includes(Number(params.range))
    ? Number(params.range)
    : 30;

  const [
    topPosts,
    totalViews,
    visits,
    quizStats,
    contentCounts,
    viewsByCategory,
    topPages,
    pscBySource,
    postsPublished,
    engagement,
  ] = await Promise.all([
    getTopPosts(5),
    getTotalPostViews(),
    getVisitsOverTime(range),
    getQuizStatsForAdmin(),
    getContentCounts(),
    getViewsByCategory(),
    getTopPages(range, 8),
    getPscUpdateCountsBySource(),
    getPostsPublishedOverTime(range),
    getEngagementSummary(),
  ]);

  const totalVisitsRange = visits.reduce((sum, v) => sum + v.visits, 0);
  const avgScoreAcrossQuizzes = quizStats.perQuiz.length
    ? Math.round(
        quizStats.perQuiz.reduce((s, q) => s + q.avgScorePct, 0) /
          quizStats.perQuiz.length
      )
    : 0;
  const maxCategoryViews = Math.max(1, ...viewsByCategory.map((c) => c.views));
  const maxPageViews = Math.max(1, ...topPages.map((p) => p.views));

  const cards = [
    { label: "Total Post Views", value: totalViews, icon: Eye, color: "bg-indigo-100 text-indigo-700" },
    { label: `Visits (${range}d)`, value: totalVisitsRange, icon: TrendingUp, color: "bg-blue-100 text-blue-700" },
    { label: "Quiz Attempts", value: quizStats.totalAttempts, icon: ClipboardList, color: "bg-amber-100 text-amber-700" },
    { label: "Avg Quiz Score", value: `${avgScoreAcrossQuizzes}%`, icon: Percent, color: "bg-green-100 text-green-700" },
  ];

  const contentCards = [
    { label: "Published Posts", value: contentCounts.publishedPosts, icon: FileText, color: "bg-emerald-100 text-emerald-700" },
    { label: "Draft Posts", value: contentCounts.draftPosts, icon: FilePenLine, color: "bg-slate-100 text-slate-700" },
    { label: "Categories", value: contentCounts.categories, icon: FolderOpen, color: "bg-purple-100 text-purple-700" },
    { label: "PSC Updates Tracked", value: contentCounts.pscUpdates, icon: Megaphone, color: "bg-rose-100 text-rose-700" },
  ];

  const engagementCards = [
    { label: "Avg Views / Post", value: engagement.avgViewsPerPost, icon: BarChart3, color: "bg-cyan-100 text-cyan-700" },
    { label: "Posts With Views", value: engagement.postsWithViews, icon: Eye, color: "bg-teal-100 text-teal-700" },
    { label: "Posts With No Views", value: engagement.postsWithNoViews, icon: Ban, color: "bg-orange-100 text-orange-700" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Statistics</h1>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((r) => (
            <Link
              key={r}
              href={`/admin/statistics?range=${r}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                r === range
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {r}d
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className={`inline-flex rounded-lg p-2 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-800">
            Site visits — last {range} days
          </h2>
          <div className="mt-4">
            <VisitsChart data={visits} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-800">
            Posts published — last {range} days
          </h2>
          <div className="mt-4">
            <PostsPublishedChart data={postsPublished} />
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-slate-400">
        Content overview
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {contentCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className={`inline-flex rounded-lg p-2 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-slate-400">
        Engagement
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {engagementCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className={`inline-flex rounded-lg p-2 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-800">
            Most Popular Posts
          </h2>
          <div className="mt-3 divide-y divide-slate-100">
            {topPosts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}/edit`}
                className="flex items-center justify-between py-2.5 hover:bg-slate-50"
              >
                <span className="truncate text-sm font-medium text-slate-700">
                  {post.title}
                </span>
                <span className="ml-3 flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-500">
                  <Eye size={13} /> {post.views}
                </span>
              </Link>
            ))}
            {topPosts.length === 0 && (
              <p className="py-4 text-sm text-slate-400">No views yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-800">Quiz Performance</h2>
          <div className="mt-3 divide-y divide-slate-100">
            {quizStats.perQuiz.map((q) => (
              <div
                key={q.quizId}
                className="flex items-center justify-between py-2.5"
              >
                <span className="truncate text-sm font-medium text-slate-700">
                  {q.title}
                </span>
                <span className="ml-3 shrink-0 text-xs font-semibold text-slate-500">
                  {q.attempts} attempts · {q.avgScorePct}% avg
                </span>
              </div>
            ))}
            {quizStats.perQuiz.length === 0 && (
              <p className="py-4 text-sm text-slate-400">
                No quiz attempts yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-800">
            Views by Category
          </h2>
          <div className="mt-4 space-y-3">
            {viewsByCategory.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    {c.name}{" "}
                    <span className="text-slate-400">
                      ({c.posts} post{c.posts === 1 ? "" : "s"})
                    </span>
                  </span>
                  <span className="font-semibold text-slate-500">{c.views}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${(c.views / maxCategoryViews) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {viewsByCategory.length === 0 && (
              <p className="py-4 text-sm text-slate-400">No published posts yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-800">
            Top Pages — last {range} days
          </h2>
          <div className="mt-4 space-y-3">
            {topPages.map((p) => (
              <div key={p.path}>
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate font-medium text-slate-700">{p.path}</span>
                  <span className="ml-2 shrink-0 font-semibold text-slate-500">
                    {p.views}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(p.views / maxPageViews) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {topPages.length === 0 && (
              <p className="py-4 text-sm text-slate-400">No traffic recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-800">
          PSC Updates by Source
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PSC_SOURCES.map((s) => (
            <div key={s.key} className="rounded-xl bg-slate-50 p-3">
              <p className="text-lg font-bold text-slate-800">
                {pscBySource[s.key] ?? 0}
              </p>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
