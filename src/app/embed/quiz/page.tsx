import Link from "next/link";
import type { Metadata } from "next";
import QuizPlayer from "@/components/site/QuizPlayer";
import EmbedPoweredBy from "@/components/site/EmbedPoweredBy";
import {
  getLeaderboard,
  getPublishedQuizzes,
  getQuizBySlug,
} from "@/lib/quizzes";
import { siteUrl } from "@/lib/seo";

/**
 * Embeddable daily quiz — a playable quiz in an iframe for other sites.
 * No site chrome, no auth, no user data: the visitor just takes today's
 * quiz (name entry + leaderboard submit work exactly as on the site).
 * Widget endpoints are noindex (they duplicate the canonical quiz page);
 * the /embed hub page is the discoverable one.
 */

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Daily Quiz — Kerala PSC Current Affairs",
  robots: { index: false, follow: false },
};

function istDate(daysAgo = 0): string {
  const d = new Date(Date.now() - daysAgo * 86400000);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export default async function EmbedQuizPage() {
  // Today's digest quiz first, yesterday's as fallback (before the 08:30
  // digest), then the latest published quiz, then a link card.
  let quiz = await getQuizBySlug(
    `daily-current-affairs-quiz-${istDate(0)}`
  );
  if (!quiz || (quiz.questions ?? []).length === 0) {
    quiz = await getQuizBySlug(`daily-current-affairs-quiz-${istDate(1)}`);
  }
  if (!quiz || (quiz.questions ?? []).length === 0) {
    const latest = await getPublishedQuizzes();
    if (latest.length > 0) {
      quiz = await getQuizBySlug(latest[0].slug);
    }
  }

  if (!quiz || (quiz.questions ?? []).length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <main className="flex flex-1 items-center justify-center p-6 text-center">
          <div>
            <p className="text-lg font-bold text-slate-800">
              ഇന്നത്തെ ക്വിസ് ഇതുവരെ തയ്യാറായിട്ടില്ല
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Today&apos;s quiz isn&apos;t ready yet — take the latest quizzes
              on the site.
            </p>
            <Link
              href="/quiz"
              target="_blank"
              rel="noopener"
              className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white"
            >
              Browse quizzes
            </Link>
          </div>
        </main>
        <EmbedPoweredBy href={`${siteUrl()}/quiz`} />
      </div>
    );
  }

  const leaderboard = await getLeaderboard(quiz.id);
  const quizUrl = `${siteUrl()}/quiz/${quiz.slug}`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <p className="text-center text-sm font-bold text-slate-800">
          🧠 ഇന്നത്തെ ക്വിസ് — {quiz.title}
        </p>
      </header>
      <main className="flex-1 px-3 py-4">
        <QuizPlayer quiz={quiz} initialLeaderboard={leaderboard} />
      </main>
      <EmbedPoweredBy href={quizUrl} />
    </div>
  );
}
