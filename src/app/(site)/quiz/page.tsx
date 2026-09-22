import Link from "next/link";
import { getPublishedQuizzes } from "@/lib/quizzes";
import { getAllCategories } from "@/lib/posts";
import { ClipboardList, Clock, ArrowRight } from "lucide-react";

export const metadata = { title: "Quiz" };

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-rose-100 text-rose-700",
};

export default async function QuizListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [quizzes, categories] = await Promise.all([
    getPublishedQuizzes({ categorySlug: category }),
    getAllCategories(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Practice Quizzes</h1>
      <p className="mt-2 text-slate-500">
        Test your knowledge of Kerala PSC current affairs. Enter your name,
        answer the questions, and see how you rank!
      </p>

      <Link
        href="/mock-tests"
        className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white transition hover:shadow-lg"
      >
        <span>
          <span className="block font-extrabold">
            Want the full exam experience?
          </span>
          <span className="mt-0.5 block text-sm text-indigo-100">
            Try our free full-length mock tests — timer, negative marking and
            live leaderboards.
          </span>
        </span>
        <ArrowRight size={24} className="shrink-0" />
      </Link>

      <div className="scrollbar-hide mt-6 flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/quiz"
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
            !category
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/quiz?category=${c.slug}`}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
              category === c.slug
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {quizzes.length === 0 ? (
        <p className="mt-10 text-slate-500">No quizzes published yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/quiz/${quiz.slug}`}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:-translate-y-1 hover:shadow-lg transition"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <ClipboardList size={20} />
              </span>
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="block font-bold text-slate-900">
                    {quiz.title}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${DIFFICULTY_STYLE[quiz.difficulty]}`}
                  >
                    {quiz.difficulty}
                  </span>
                  {quiz.time_limit_seconds && (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-slate-400">
                      <Clock size={12} /> {Math.round(quiz.time_limit_seconds / 60)} min
                    </span>
                  )}
                </span>
                {quiz.description && (
                  <span className="mt-1 block text-sm text-slate-500">
                    {quiz.description}
                  </span>
                )}
                <span className="mt-2 flex flex-wrap items-center gap-3">
                  {quiz.category && (
                    <span className="text-xs font-medium text-slate-400">
                      {quiz.category.name}
                    </span>
                  )}
                  {quiz.post && (
                    <span className="text-xs font-medium text-indigo-600">
                      Based on: {quiz.post.title}
                    </span>
                  )}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
