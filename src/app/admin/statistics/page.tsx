import Link from "next/link";
import { getTopPosts, getTotalPostViews, getVisitsOverTime } from "@/lib/stats";
import { getQuizStatsForAdmin } from "@/lib/quizzes";
import VisitsChart from "@/components/admin/VisitsChart";
import { Eye, ClipboardList, TrendingUp, Percent } from "lucide-react";

export default async function StatisticsPage() {
  const [topPosts, totalViews, visits, quizStats] = await Promise.all([
    getTopPosts(5),
    getTotalPostViews(),
    getVisitsOverTime(30),
    getQuizStatsForAdmin(),
  ]);

  const totalVisits30d = visits.reduce((sum, v) => sum + v.visits, 0);
  const avgScoreAcrossQuizzes = quizStats.perQuiz.length
    ? Math.round(
        quizStats.perQuiz.reduce((s, q) => s + q.avgScorePct, 0) /
          quizStats.perQuiz.length
      )
    : 0;

  const cards = [
    { label: "Total Post Views", value: totalViews, icon: Eye, color: "bg-indigo-100 text-indigo-700" },
    { label: "Visits (30 days)", value: totalVisits30d, icon: TrendingUp, color: "bg-blue-100 text-blue-700" },
    { label: "Quiz Attempts", value: quizStats.totalAttempts, icon: ClipboardList, color: "bg-amber-100 text-amber-700" },
    { label: "Avg Quiz Score", value: `${avgScoreAcrossQuizzes}%`, icon: Percent, color: "bg-green-100 text-green-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Statistics</h1>

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

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-800">
          Site visits — last 30 days
        </h2>
        <div className="mt-4">
          <VisitsChart data={visits} />
        </div>
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
    </div>
  );
}
