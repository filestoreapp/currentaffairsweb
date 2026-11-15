import {
  getPublishedMockCount,
  getPublishedQuizCount,
  getPublishedQuestionCount,
} from "@/lib/quizzes";
import { getPscUpdateTotalCount } from "@/lib/psc-updates";
import { STUDY_TOPICS_WITH_CONTENT } from "@/data/study-notes";
import { getTelegramMemberCount } from "@/lib/telegram";

// Homepage hero stats — LIVE counts, server-rendered (2026-11-15 fix).
// The old version was a client component with hardcoded numbers and a
// count-up starting from useState(0), so crawlers and slow connections
// saw literal <dd>0</dd> in the server HTML. Every number here comes from
// the real data source at render time (5 min ISR cache); nothing is
// hardcoded. The count-up animation is gone — the real value is in the
// HTML from the first byte.
//   Mock Tests: published mock quizzes in the DB.
//   PSC Updates: rows in psc_updates.
//   Practice Quizzes: published non-mock, non-PYQ quizzes.
//   Study Notes: study-note topics with content.
//   Practice Questions: questions inside published quizzes.
//   Telegram Members: Bot API getChatMemberCount — omitted (not faked)
//     if that call fails.
// If a database count fails, the whole block is hidden rather than
// 500-ing the homepage.
export default async function HeroStats() {
  let stats: { value: number; label: string }[];
  try {
    const [mocks, quizzes, updates, questions, members] = await Promise.all([
      getPublishedMockCount(),
      getPublishedQuizCount(),
      getPscUpdateTotalCount(),
      getPublishedQuestionCount(),
      getTelegramMemberCount(),
    ]);
    stats = [
      { value: mocks, label: "Mock Tests" },
      { value: updates, label: "PSC Updates" },
      { value: quizzes, label: "Practice Quizzes" },
      { value: STUDY_TOPICS_WITH_CONTENT.length, label: "Study Notes" },
      { value: questions, label: "Practice Questions" },
      ...(members !== null
        ? [{ value: members, label: "Telegram Members" }]
        : []),
    ];
  } catch (err) {
    console.error("HeroStats: failed to load counts", err);
    return null;
  }

  return (
    <dl className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-x-4 gap-y-6 sm:mt-10 sm:max-w-3xl sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col">
          <dd className="order-1 text-3xl font-extrabold tabular-nums text-white">
            {s.value.toLocaleString("en-IN")}
          </dd>
          <dt className="order-2 mt-1 block text-xs font-medium uppercase tracking-wider text-slate-400">
            {s.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
