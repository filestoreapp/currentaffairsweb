import { getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
      type: "article",
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "published") notFound();

  return (
    <article className="mx-auto max-w-3xl">
      {post.category && (
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          {post.category.name}
        </span>
      )}
      <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        {post.published_at &&
          format(new Date(post.published_at), "dd MMM yyyy, hh:mm a")}
      </p>

      {post.cover_image && (
        <div className="relative mt-6 h-72 w-full overflow-hidden rounded-2xl sm:h-96">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div
        className="prose prose-slate mt-8 max-w-none prose-headings:font-bold prose-a:text-indigo-600"
        dangerouslySetInnerHTML={{ __html: post.content_html }}
      />

      {post.tags && post.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
