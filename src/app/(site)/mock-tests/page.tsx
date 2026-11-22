import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/seo";
import {
  getPublishedMocks,
  getGlobalMockLeaderboard,
  getTopStreaks,
} from "@/lib/quizzes";
import { ClipboardList, Clock, Trophy, Users, Medal, Flame } from "lucide-react";
import GameProgressCard from "@/components/site/GameProgressCard";
import HubFaq from "@/components/site/HubFaq";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute:
      "Kerala PSC Mock Test — Free Online Mock Tests 2026 | കേരള പിഎസ്‌സി മോക്ക് ടെസ്റ്റ്",
  },
  description:
    "Kerala PSC mock test practice for free — full-length mock tests for LDC, LGS, University Assistant and Police Constable with a 75-minute timer, −0.33 negative marking and live leaderboards, plus 438 quizzes and 7,512 practice questions. No login needed.",
  alternates: {
    canonical: "https://www.psccurrentaffairs.online/mock-tests",
  },
};

export const revalidate = 300;

const RANK_STYLE = ["text-amber-500", "text-slate-400", "text-amber-700"];

export default async function MockTestsPage() {
  const [mocks, globalBoard, streaks] = await Promise.all([
    getPublishedMocks(),
    getGlobalMockLeaderboard(),
    getTopStreaks(),
  ]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Mock Tests" },
            ])
          ),
        }}
      />
      <h1 className="text-3xl font-extrabold tracking-tight">Kerala PSC Mock Test — സൗജന്യ മോക്ക് ടെസ്റ്റുകൾ</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Full-length Kerala PSC mock tests for LDC, LGS, University Assistant
        and Police Constable — exam-style timer, negative marking, and a live
        leaderboard. Free forever, no login needed. Enter your name, take the
        test, and see where you rank.
      </p>
      <p className="mt-3 max-w-2xl text-slate-500">
        Every Kerala PSC mock test here follows the real exam pattern, so you
        practise with the same pressure you will face in the hall. The mock
        tests are part of a larger practice bank on this site — 438 quizzes
        and 7,512 questions in total — and new tests are added regularly. ഒരു
        പരീക്ഷയ്ക്ക് മുമ്പ് മോക്ക് ടെസ്റ്റ് എഴുതി പരിശീലിക്കുന്നത് സമയ
        മാനേജ്‌മെന്റും ആത്മവിശ്വാസവും വർദ്ധിപ്പിക്കും.
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
      {streaks.length > 0 && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <Flame size={20} className="text-orange-500" /> Daily Streaks
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Consecutive days with at least one quiz, mock or PYQ attempt.
            Keep the fire alive.
          </p>
          <ol className="mt-4 space-y-2">
            {streaks.map((entry, i) => (
              <li
                key={entry.name + i}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <Medal size={16} className={RANK_STYLE[i] ?? "text-slate-300"} />
                  {i + 1}. {entry.name}
                </span>
                <span className="flex items-center gap-1 font-semibold text-orange-600">
                  <Flame size={15} />
                  {entry.streak} day{entry.streak !== 1 ? "s" : ""}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="mt-8">
        <GameProgressCard />
      </div>

      <HubFaq
        faqs={[
          {
            q: "Are these Kerala PSC mock tests really free?",
            a: "Yes. Every Kerala PSC mock test on this page is completely free — no login, no payment and no sign-up. Just enter your name, start the test and check your score and rank on the leaderboard.",
          },
          {
            q: "Do the mock tests follow the real Kerala PSC exam pattern?",
            a: "Yes. The mock tests mirror the actual exam format — a 100-mark paper with a 75-minute timer and −0.33 negative marking for wrong answers, so your practice score is a realistic estimate of your exam readiness.",
          },
          {
            q: "Which exams do the Kerala PSC mock tests cover?",
            a: "Mock tests are available for popular exams such as LDC, LGS, University Assistant and Police Constable, and the collection keeps growing. For shorter practice, the site also has 438 quizzes with 7,512 questions across topics.",
          },
          {
            q: "മോക്ക് ടെസ്റ്റുകൾ മലയാളത്തിൽ ലഭ്യമാണോ? (Are the mock tests available in Malayalam?)",
            a: "അതെ, മിക്ക മോക്ക് ടെസ്റ്റുകളും മലയാളത്തിലാണ് തയ്യാറാക്കിയിരിക്കുന്നത്. Yes — the mock tests are prepared for Malayalam-medium aspirants, matching the language style of Kerala PSC exams.",
          },
          {
            q: "How does the mock test leaderboard work?",
            a: "The overall leaderboard ranks you by your average best score across all the mock tests you attempt, and daily streaks reward you for practising every day. Consistency across tests matters more than one lucky score.",
          },
        ]}
      />
    </div>
  );
}
