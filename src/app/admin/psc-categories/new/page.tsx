import PscCategoryForm from "@/components/admin/PscCategoryForm";

export default function NewPscCategoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">New category page</h1>
      <div className="mt-6 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <PscCategoryForm />
      </div>
    </div>
  );
}
