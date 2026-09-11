import { getPostBySlug } from "@/lib/posts";
import { getQuizByPostId } from "@/lib/quizzes";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";
import PostViewTracker from "@/components/site/PostViewTracker";
import ShareButtons from "@/components/site/ShareButtons";
import { ClipboardList } from "lucide-react";

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

  const isVisible =
    post &&
    (post.status === "published" ||
      (post.status === "scheduled" &&
        post.published_at &&
        new Date(post.published_at) <= new Date()));

  if (!post || !isVisible) notFound();

  const quiz = await getQuizByPostId(post.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const postUrl = `${siteUrl}/current-affairs/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.cover_image || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at,
    mainEntityOfPage: postUrl,
  };

  return (
    <article className="mx-auto max-w-3xl">
      <PostViewTracker slug={post.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {post.category && (
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          {post.category.name}
        </span>
      )}
      <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
        {post.title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {post.published_at &&
            format(new Date(post.published_at), "dd MMM yyyy, hh:mm a")}
        </p>
        <ShareButtons url={postUrl} title={post.title} />
      </div>

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

      {quiz && (
        <Link
          href={`/quiz/${quiz.slug}`}
          className="mt-10 flex items-center gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 hover:border-indigo-400"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
            <ClipboardList size={20} />
          </span>
          <span>
            <span className="block font-bold text-indigo-900">
              Test yourself on this article
            </span>
            <span className="block text-sm text-indigo-700">
              Take the &ldquo;{quiz.title}&rdquo; quiz →
            </span>
          </span>
        </Link>
      )}
    </article>
  );
}
