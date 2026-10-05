import { notFound } from "next/navigation";
import { getPscCategoryByIdForAdmin } from "@/lib/psc-categories";
import { getExamsForAdmin } from "@/lib/exams";
import PscCategoryForm from "@/components/admin/PscCategoryForm";

async function getExamOptions() {
  try {
    const exams = await getExamsForAdmin();
    return exams.map((e) => ({
      slug: e.slug,
      name: e.name,
      short_name: e.short_name,
    }));
  } catch {
    return [];
  }
}

export default async function EditPscCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cat, exams] = await Promise.all([
    getPscCategoryByIdForAdmin(id),
    getExamOptions(),
  ]);
  if (!cat) notFound();

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">
        Edit category {cat.cat_no}
      </h1>
      <div className="mt-6 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <PscCategoryForm initial={cat} exams={exams} />
      </div>
    </div>
  );
}
