import { getAllCategories } from "@/lib/posts";
import CategoriesManager from "@/components/admin/CategoriesManager";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Categories</h1>
      <div className="mt-6">
        <CategoriesManager categories={categories} />
      </div>
    </div>
  );
}
