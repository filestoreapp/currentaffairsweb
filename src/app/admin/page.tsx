import Link from "next/link";
import { getAllPostsForAdmin } from "@/lib/posts";
import { getAllQuizzesForAdmin, getRecentQuizAttempts } from "@/lib/quizzes";
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
} from "lucide-react";

export default async function AdminDashboard() {
  const [posts, quizzes, pscUpdateCount, recentAttempts] = await Promise.all([
    getAllPostsForAdmin(),
    getAllQuizzesForAdmin(),
    getPscUpdateTotalCount(),
    getRecentQuizAttempts(6),
  ]);

  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.filter((p) => p.status === "draft").length;
  const scheduled = posts.filter(
    (p) =>
      p.status === "scheduled" &&
      (!p.published_at || new Date(p.published_at) > new Date())
  ).length;
  const publishedQuizzes = quizzes.filter((q) => q.status === "published").length;

  const stats = [
    { label: "Total Posts", value: posts.length, icon: FileText, color: "bg-indigo-100 text-indigo-700" },
    { label: "Published", value: published, icon: CheckCircle2, color: "bg-green-100 text-green-700" },
    { label: "Drafts", value: drafts, icon: FileText, color: "bg-amber-100 text-amber-700" },
    { label: "Scheduled", value: scheduled, icon: Clock, color: "bg-blue-100 text-blue-700" },
  ];

  const secondaryStats = [
    { label: "Quizzes Published", value: publishedQuizzes, icon: ClipboardList, color: "bg-violet-100 text-violet-700" },
    { label: "PSC Updates Tracked", value: pscUpdateCount, icon: Bell, color: "bg-rose-100 text-rose-700" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <PlusCircle size={16} /> New Post
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className={`inline-flex rounded-lg p-2 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {secondaryStats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className={`inline-flex rounded-lg p-2 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold">Recent Posts</h2>
          <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {posts.slice(0, 6).map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}/edit`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
              >
                <span className="truncate text-sm font-medium text-slate-800">
                  {post.title}
                </span>
                <span
                  className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    post.status === "published"
                      ? "bg-green-100 text-green-700"
                      : post.status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {post.status}
                </span>
              </Link>
            ))}
            {posts.length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-400">
                No posts yet — create your first one!
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Trophy size={18} className="text-amber-500" /> Recent Quiz Attempts
          </h2>
          <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {recentAttempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {a.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {a.quiz?.title ?? "Deleted quiz"} ·{" "}
                    {format(new Date(a.created_at), "dd MMM, hh:mm a")}
                  </p>
                </div>
                <span className="ml-3 shrink-0 text-sm font-semibold text-indigo-600">
                  {a.score}/{a.total}
                </span>
              </div>
            ))}
            {recentAttempts.length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-400">
                No quiz attempts yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
