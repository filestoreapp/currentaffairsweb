import Link from "next/link";
import { getPscCategoriesForAdmin } from "@/lib/psc-categories";
import { PlusCircle, Pencil, FileText } from "lucide-react";
import ImportPscCategoriesButton from "@/components/admin/ImportPscCategoriesButton";
import DeletePscCategoryButton from "@/components/admin/DeletePscCategoryButton";

export default async function AdminPscCategoriesPage() {
  const cats = await getPscCategoriesForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">PSC Categories</h1>
        <div className="flex items-center gap-3">
          <ImportPscCategoriesButton />
          <Link
            href="/admin/psc-categories/new"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <PlusCircle size={16} /> New
          </Link>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        One page per PSC category number. “Import from PSC” pulls the latest
        announcements from keralapsc.gov.in/latest (updates details, never
        touches your exam dates or uploaded papers).
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Exam date</th>
              <th className="px-5 py-3">Papers</th>
              <th className="px-5 py-3">Published</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cats.map((cat) => {
              const paperCount = cat.paper_sections.filter(
                (s) => s.question_key || s.answer_key
              ).length;
              return (
                <tr key={cat.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/psc-categories/${cat.id}/edit`}
                      className="font-medium text-slate-800 hover:text-indigo-600"
                    >
                      {cat.cat_no}
                    </Link>
                    <span className="mt-0.5 block max-w-md truncate text-xs text-slate-400">
                      {cat.post_name}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {cat.exam_date ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    {paperCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        <FileText size={12} /> {paperCount}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {cat.is_published ? (
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
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/psc-categories/${cat.id}/edit`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeletePscCategoryButton id={cat.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {cats.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            No categories yet — click “Import from PSC” to pull the latest
            announcements.
          </p>
        )}
      </div>
    </div>
  );
}
