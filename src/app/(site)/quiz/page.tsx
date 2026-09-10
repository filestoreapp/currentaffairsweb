import Link from "next/link";
import { getPublishedQuizzes } from "@/lib/quizzes";
import { ClipboardList } from "lucide-react";

export const metadata = { title: "Quiz" };

export default async function QuizListPage() {
  const quizzes = await getPublishedQuizzes();

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Practice Quizzes</h1>
      <p className="mt-2 text-slate-500">
        Test your knowledge of Kerala PSC current affairs. Enter your name,
        answer the questions, and see how you rank!
      </p>

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
              <span>
                <span className="block font-bold text-slate-900">
                  {quiz.title}
                </span>
                {quiz.description && (
                  <span className="mt-1 block text-sm text-slate-500">
                    {quiz.description}
                  </span>
                )}
                {quiz.post && (
                  <span className="mt-2 inline-block text-xs font-medium text-indigo-600">
                    Based on: {quiz.post.title}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
