import Link from "next/link";
import { getAllQuizzesForAdmin } from "@/lib/quizzes";
import { PlusCircle, Pencil } from "lucide-react";
import DeleteQuizButton from "@/components/admin/DeleteQuizButton";

export default async function AdminQuizzesPage() {
  const quizzes = await getAllQuizzesForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Quizzes</h1>
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
              <th className="px-5 py-3">Linked post</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Attempts</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quizzes.map((quiz) => (
              <tr key={quiz.id} className="hover:bg-slate-50">
                <td className="max-w-xs truncate px-5 py-3 font-medium text-slate-800">
                  {quiz.title}
                </td>
                <td className="max-w-xs truncate px-5 py-3 text-slate-500">
                  {quiz.post?.title ?? "—"}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      quiz.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {quiz.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {quiz.attempt_count ?? 0}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/admin/quizzes/${quiz.id}/edit`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
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
