import { notFound } from "next/navigation";
import { getPscCategoryByIdForAdmin } from "@/lib/psc-categories";
import PscCategoryForm from "@/components/admin/PscCategoryForm";

export default async function EditPscCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cat = await getPscCategoryByIdForAdmin(id);
  if (!cat) notFound();

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">
        Edit category {cat.cat_no}
      </h1>
      <div className="mt-6 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <PscCategoryForm initial={cat} />
      </div>
    </div>
  );
}
