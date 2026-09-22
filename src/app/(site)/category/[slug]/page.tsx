import { getPublishedPosts, getAllCategories } from "@/lib/posts";
import PostCard from "@/components/site/PostCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 300; // 5 min — no cookies/searchParams here, so this can ISR

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug === slug);
  return { title: category ? category.name : "Category" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) notFound();

  const { posts } = await getPublishedPosts({ categorySlug: slug, perPage: 24 });

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">{category.name}</h1>
      {category.description && (
        <p className="mt-2 text-slate-500">{category.description}</p>
      )}

      {posts.length === 0 ? (
        <p className="mt-10 text-slate-500">
          No posts in this category yet.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
