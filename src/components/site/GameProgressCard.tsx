"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Lock, Star, Trophy } from "lucide-react";
import {
  BADGES,
  earnedBadges,
  loadProgress,
  type GameStats,
} from "@/lib/game-progress";

/**
 * The visitor's own progress — points, streak, badges — read from
 * localStorage (no account). Rendered only after mount so the
 * server-rendered HTML never guesses at browser-only state.
 */
export default function GameProgressCard() {
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => {
    setStats(loadProgress());
  }, []);

  if (!stats) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-4 w-64 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  const earned = new Set(earnedBadges(stats).map((b) => b.id));
  const played = stats.quizzesCompleted + stats.mocksCompleted;

  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-6">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <Trophy size={16} className="text-amber-500" /> എന്റെ പുരോഗതി
        <span className="text-xs font-medium text-slate-400">
          (this device)
        </span>
      </h3>

      {played === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          ഒരു ക്വിസോ മോക്ക് ടെസ്റ്റോ പൂർത്തിയാക്കൂ — പോയിന്റുകളും സ്ട്രീക്കും
          ബാഡ്ജുകളും ഇവിടെ കാണാം. ലോഗിൻ വേണ്ട.
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="flex items-center justify-center gap-1 text-lg font-extrabold text-amber-700">
                <Star size={16} /> {stats.points}
              </p>
              <p className="text-xs text-amber-600">Points</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-3">
              <p className="flex items-center justify-center gap-1 text-lg font-extrabold text-orange-700">
                <Flame size={16} /> {stats.streak}
              </p>
              <p className="text-xs text-orange-600">
                Day streak{stats.streak !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3">
              <p className="text-lg font-extrabold text-indigo-700">
                {stats.bestPct}%
              </p>
              <p className="text-xs text-indigo-600">Best score</p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">
            {stats.quizzesCompleted} quiz
            {stats.quizzesCompleted !== 1 ? "zes" : ""} •{" "}
            {stats.mocksCompleted} mock
            {stats.mocksCompleted !== 1 ? "s" : ""} completed
            {stats.longestStreak > 1 &&
              ` • Longest streak ${stats.longestStreak} days`}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {BADGES.map((b) => {
              const has = earned.has(b.id);
              return (
                <span
                  key={b.id}
                  title={b.desc}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    has
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {has ? <Trophy size={12} /> : <Lock size={12} />}
                  {b.label}
                </span>
              );
            })}
          </div>
        </>
      )}

      <Link
        href="/mock-tests"
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
      >
        See the streak leaderboard →
      </Link>
    </div>
  );
}
