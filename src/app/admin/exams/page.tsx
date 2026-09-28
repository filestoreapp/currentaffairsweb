import Link from "next/link";
import { getExamsForAdmin } from "@/lib/exams";
import { PlusCircle, Pencil } from "lucide-react";
import DeleteExamButton from "@/components/admin/DeleteExamButton";

export default async function AdminExamsPage() {
  const exams = await getExamsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Exams</h1>
        <Link
          href="/admin/exams/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <PlusCircle size={16} /> New Exam
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Exam</th>
              <th className="px-5 py-3">Category No</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Published</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {exams.map((exam) => (
              <tr key={exam.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/exams/${exam.id}/edit`}
                    className="font-medium text-slate-800 hover:text-indigo-600"
                  >
                    {exam.name}
                  </Link>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    {exam.short_name} · /exams/{exam.slug}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {exam.category_no ?? "—"}
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold capitalize text-slate-600">
                    {exam.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {exam.is_published ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                      No
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/exams/${exam.id}/edit`}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                    >
                      <Pencil size={14} /> Edit
                    </Link>
                    <DeleteExamButton id={exam.id} name={exam.name} />
                  </div>
                </td>
              </tr>
            ))}
            {exams.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                  No exams yet. Run the exams migration in Supabase, then create
                  one here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
