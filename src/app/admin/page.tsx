import Link from "next/link";
import { getAllPostsForAdmin } from "@/lib/posts";
import {
  getAllQuizzesForAdmin,
  getRecentQuizAttempts,
  getQuizStatsForAdmin,
} from "@/lib/quizzes";
import { getPscUpdateTotalCount } from "@/lib/psc-updates";
import { format } from "date-fns";
import {
  FileText,
  CheckCircle2,
  Clock,
  PlusCircle,
  ClipboardList,
  Bell,
  Trophy,
  Pencil,
  ArrowRight,
  Users,
  ScrollText,
  ListPlus,
} from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-sky-100 text-sky-700",
  draft: "bg-amber-100 text-amber-700",
};

export default async function AdminDashboard() {
  const [posts, quizzes, pscUpdateCount, recentAttempts, quizStats] =
    await Promise.all([
      getAllPostsForAdmin(),
      getAllQuizzesForAdmin(),
      getPscUpdateTotalCount(),
      getRecentQuizAttempts(6),
      getQuizStatsForAdmin(),
    ]);

  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.filter((p) => p.status === "draft").length;
  const scheduled = posts.filter(
    (p) =>
      p.status === "scheduled" &&
      (!p.published_at || new Date(p.published_at) > new Date())
  ).length;
  const publishedQuizzes = quizzes.filter(
    (q) => q.status === "published" && !q.is_mock && !q.is_pyq
  ).length;
  const publishedMocks = quizzes.filter(
    (q) => q.status === "published" && q.is_mock
  ).length;
  const publishedPyqs = quizzes.filter(
    (q) => q.status === "published" && q.is_pyq
  ).length;

  const today = format(new Date(), "EEEE, d MMMM yyyy");

  const stats = [
    {
      label: "Published Posts",
      value: published,
      sub: `${drafts} drafts · ${scheduled} scheduled`,
      icon: FileText,
      iconBg: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Live Quizzes",
      value: publishedQuizzes + publishedMocks + publishedPyqs,
      sub: `${publishedMocks} mocks · ${publishedPyqs} PYQs`,
      icon: ClipboardList,
      iconBg: "bg-violet-100 text-violet-600",
    },
    {
      label: "Quiz Attempts",
      value: quizStats.totalAttempts,
      sub: "all time, no login needed",
      icon: Users,
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "PSC Updates",
      value: pscUpdateCount,
      sub: "auto-tracked from keralapsc.gov.in",
      icon: Bell,
      iconBg: "bg-rose-100 text-rose-600",
    },
  ];

  const quickActions = [
    {
      href: "/admin/posts/new",
      icon: Pencil,
      label: "New Post",
      desc: "Write a current-affairs update",
      accent: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      href: "/admin/quizzes/new",
      icon: ListPlus,
      label: "New Quiz",
      desc: "Quiz, mock test or PYQ paper",
      accent: "bg-violet-600 hover:bg-violet-700",
    },
    {
      href: "/admin/psc-updates",
      icon: Bell,
      label: "PSC Updates",
      desc: "Review scraped notifications",
      accent: "bg-rose-600 hover:bg-rose-700",
    },
  ];

  const pipelineTotal = Math.max(1, posts.length);
  const pipeline = [
    { label: "Published", value: published, bar: "bg-emerald-500", text: "text-emerald-700" },
    { label: "Scheduled", value: scheduled, bar: "bg-sky-500", text: "text-sky-700" },
    { label: "Drafts", value: drafts, bar: "bg-amber-400", text: "text-amber-700" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{today}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Good to see you 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening on your site today.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
        >
          <PlusCircle size={16} /> New Post
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, iconBg }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <span className={`inline-flex rounded-xl p-2.5 ${iconBg}`}>
                <Icon size={20} />
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
              {value}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-700">{label}</p>
            <p className="mt-0.5 truncate text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickActions.map(({ href, icon: Icon, label, desc, accent }) => (
          <Link
            key={href}
            href={href}
            className={`group flex items-center gap-4 rounded-2xl ${accent} p-4 text-white shadow-sm transition`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Icon size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{label}</span>
              <span className="block truncate text-xs text-white/75">{desc}</span>
            </span>
            <ArrowRight
              size={18}
              className="shrink-0 opacity-60 transition-transform group-hover:translate-x-1"
            />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">
            Content pipeline
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Where your {posts.length} posts stand right now
          </p>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
            {pipeline.map((s) => (
              <div
                key={s.label}
                className={s.bar}
                style={{ width: `${(s.value / pipelineTotal) * 100}%` }}
                title={`${s.label}: ${s.value}`}
              />
            ))}
          </div>
          <ul className="mt-4 space-y-2.5">
            {pipeline.map((s) => (
              <li
                key={s.label}
                className="flex items-center justify-between text-sm"
              >
                <span className={`font-semibold ${s.text}`}>{s.label}</span>
                <span className="font-bold text-slate-900">{s.value}</span>
              </li>
            ))}
          </ul>
          {drafts > 0 && (
            <Link
              href="/admin/posts"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
            >
              Review {drafts} draft{drafts !== 1 ? "s" : ""} <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent posts</h2>
            <Link
              href="/admin/posts"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-3 -mx-1 divide-y divide-slate-100">
            {posts.slice(0, 5).map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}/edit`}
                className="flex items-center justify-between gap-3 rounded-lg px-1 py-2.5 hover:bg-slate-50"
              >
                <span className="min-w-0 truncate text-sm font-medium text-slate-800">
                  {post.title}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                    STATUS_STYLE[post.status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {post.status}
                </span>
              </Link>
            ))}
            {posts.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">
                No posts yet — create your first one!
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-base font-bold text-slate-900">
              <Trophy size={16} className="text-amber-500" /> Latest attempts
            </h2>
            <Link
              href="/admin/statistics"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Statistics
            </Link>
          </div>
          <div className="mt-3 -mx-1 divide-y divide-slate-100">
            {recentAttempts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 px-1 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {a.name}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {a.quiz?.title ?? "Deleted quiz"} ·{" "}
                    {format(new Date(a.created_at), "dd MMM, hh:mm a")}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-bold text-indigo-700">
                  {a.score}/{a.total}
                </span>
              </div>
            ))}
            {recentAttempts.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">
                No quiz attempts yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {quizStats.perQuiz.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <ScrollText size={16} className="text-violet-500" /> Top quizzes by
              attempts
            </h2>
            <Link
              href="/admin/quizzes"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Manage quizzes
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quizStats.perQuiz
              .sort((a, b) => b.attempts - a.attempts)
              .slice(0, 6)
              .map((q) => (
                <div
                  key={q.quizId}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                >
                  <p className="truncate text-sm font-bold text-slate-800">
                    {q.title}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">
                      {q.attempts} attempt{q.attempts !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-emerald-600">
                      <CheckCircle2 size={13} /> {q.avgScorePct}% avg
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
