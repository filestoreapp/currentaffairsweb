import Link from "next/link";
import { getAllQuizzesForAdmin } from "@/lib/quizzes";
import { PlusCircle, Pencil, Clock } from "lucide-react";
import DeleteQuizButton from "@/components/admin/DeleteQuizButton";

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-rose-100 text-rose-700",
};

export default async function AdminQuizzesPage() {
  const quizzes = await getAllQuizzesForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Quizzes</h1>
        <Link
          href="/admin/quizzes/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <PlusCircle size={16} /> New Quiz
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Difficulty</th>
              <th className="px-5 py-3">Linked post</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Attempts</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quizzes.map((quiz) => (
              <tr key={quiz.id} className="transition hover:bg-slate-50">
                <td className="max-w-xs px-5 py-3">
                  <Link
                    href={`/admin/quizzes/${quiz.id}/edit`}
                    className="font-medium text-slate-800 hover:text-indigo-600"
                  >
                    <span className="truncate">{quiz.title}</span>
                  </Link>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    {quiz.is_mock && (
                      <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                        Mock
                      </span>
                    )}
                    {quiz.is_pyq && (
                      <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        PYQ{quiz.exam_year ? ` ${quiz.exam_year}` : ""}
                      </span>
                    )}
                    {!quiz.is_mock && !quiz.is_pyq && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        Quiz
                      </span>
                    )}
                    {quiz.time_limit_seconds && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-400">
                        <Clock size={12} /> {Math.round(quiz.time_limit_seconds / 60)}m
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {quiz.category?.name ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {quiz.category.name}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide capitalize ${DIFFICULTY_STYLE[quiz.difficulty]}`}
                  >
                    {quiz.difficulty}
                  </span>
                </td>
                <td className="max-w-[10rem] truncate px-5 py-3 text-slate-500">
                  {quiz.post?.title ?? <span className="text-slate-300">—</span>}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                      quiz.status === "published"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {quiz.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="font-semibold text-slate-700">
                    {quiz.attempt_count ?? 0}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/admin/quizzes/${quiz.id}/edit`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                      title="Edit quiz"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteQuizButton id={quiz.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quizzes.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">
            No quizzes yet.
          </p>
        )}
      </div>
    </div>
  );
}
