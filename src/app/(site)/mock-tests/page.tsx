import Link from "next/link";
import {
  getPublishedMocks,
  getGlobalMockLeaderboard,
} from "@/lib/quizzes";
import { ClipboardList, Clock, Trophy, Users, Medal } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Kerala PSC Mock Tests",
  description:
    "Free full-length Kerala PSC mock tests with negative marking, timer and live leaderboards. Practice like the real exam.",
};

export const revalidate = 300;

const RANK_STYLE = ["text-amber-500", "text-slate-400", "text-amber-700"];

export default async function MockTestsPage() {
  const [mocks, globalBoard] = await Promise.all([
    getPublishedMocks(),
    getGlobalMockLeaderboard(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Free Mock Tests</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Full-length Kerala PSC mock tests — exam-style timer, negative
        marking, and a live leaderboard. Free forever, no login needed.
        Enter your name, take the test, and see where you rank.
      </p>

      {mocks.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No mock tests published yet. Check back soon — new tests drop
          regularly.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mocks.map((mock) => (
            <Link
              key={mock.id}
              href={`/mock-tests/${mock.slug}`}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <ClipboardList size={20} />
              </span>
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="block font-bold text-slate-900">
                    {mock.title}
                  </span>
                  <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
                    MOCK
                  </span>
                </span>
                {mock.description && (
                  <span className="mt-1 block text-sm text-slate-500">
                    {mock.description}
                  </span>
                )}
                <span className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400">
                  {mock.time_limit_seconds && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />{" "}
                      {Math.round(mock.time_limit_seconds / 60)} min
                    </span>
                  )}
                  {Number(mock.negative_marking) > 0 && (
                    <span>−{Number(mock.negative_marking)} negative</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {mock.attempt_count ?? 0} attempts
                  </span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}

      {globalBoard.length > 0 && (
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <Trophy size={20} className="text-amber-500" /> Overall Leaderboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Ranked by average best score across all mock tests. Consistency
            wins.
          </p>
          <ol className="mt-4 space-y-2">
            {globalBoard.map((entry, i) => (
              <li
                key={entry.name + i}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <Medal size={16} className={RANK_STYLE[i] ?? "text-slate-300"} />
                  {i + 1}. {entry.name}
                  <span className="text-xs text-slate-400">
                    {entry.mocks_attempted} test
                    {entry.mocks_attempted !== 1 ? "s" : ""}
                  </span>
                </span>
                <span className="font-semibold text-indigo-600">
                  {entry.avg_score_pct}%
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    best {entry.best_score_pct}%
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
