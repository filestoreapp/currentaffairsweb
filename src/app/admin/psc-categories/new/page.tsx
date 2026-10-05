import PscCategoryForm from "@/components/admin/PscCategoryForm";
import { getExamsForAdmin } from "@/lib/exams";

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

export default async function NewPscCategoryPage() {
  const exams = await getExamOptions();
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">New category page</h1>
      <div className="mt-6 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <PscCategoryForm exams={exams} />
      </div>
    </div>
  );
}
