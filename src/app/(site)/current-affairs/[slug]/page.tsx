import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { getQuizByPostId } from "@/lib/quizzes";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";
import PostViewTracker from "@/components/site/PostViewTracker";
import ShareButtons from "@/components/site/ShareButtons";
import PostCard from "@/components/site/PostCard";
import { ClipboardList, Clock, ChevronRight, Tag } from "lucide-react";

export const revalidate = 300; // 5 min — no cookies used now, so this can ISR

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

function readingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
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

  const [quiz, related] = await Promise.all([
    getQuizByPostId(post.id),
    post.category
      ? getPublishedPosts({ perPage: 4, categorySlug: post.category.slug })
      : getPublishedPosts({ perPage: 4 }),
  ]);
  const relatedPosts = related.posts.filter((p) => p.id !== post.id).slice(0, 3);

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
    <div>
      <PostViewTracker slug={post.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-slate-500"
      >
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>
        <ChevronRight size={14} className="text-slate-300" />
        <Link href="/current-affairs" className="hover:text-indigo-600">
          Current Affairs
        </Link>
        {post.category && (
          <>
            <ChevronRight size={14} className="text-slate-300" />
            <Link
              href={`/category/${post.category.slug}`}
              className="hover:text-indigo-600"
            >
              {post.category.name}
            </Link>
          </>
        )}
      </nav>

      <article className="mx-auto mt-6 max-w-3xl">
        {post.category && (
          <Link
            href={`/category/${post.category.slug}`}
            className="inline-block rounded-full bg-indigo-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700 transition hover:bg-indigo-200"
          >
            {post.category.name}
          </Link>
        )}
        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-3 text-lg leading-relaxed text-slate-500">
            {post.excerpt}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-slate-200 py-3">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {post.published_at && (
              <span className="font-medium">
                {format(new Date(post.published_at), "dd MMM yyyy")}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={14} /> {readingTime(post.content_html)} min read
            </span>
          </div>
          <ShareButtons url={postUrl} title={post.title} />
        </div>

        {post.cover_image && (
          <div className="relative mt-6 h-64 w-full overflow-hidden rounded-2xl shadow-sm sm:h-96">
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
          className="prose prose-slate mt-8 max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2">
            <Tag size={14} className="text-slate-400" />
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
            className="group mt-10 flex items-center gap-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-5 transition hover:border-indigo-400 hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
              <ClipboardList size={22} />
            </span>
            <span className="flex-1">
              <span className="block font-bold text-indigo-950">
                Test yourself on this article
              </span>
              <span className="block text-sm text-indigo-700">
                Take the &ldquo;{quiz.title}&rdquo; quiz and lock it in.
              </span>
            </span>
            <ChevronRight
              size={20}
              className="shrink-0 text-indigo-400 transition-transform group-hover:translate-x-1"
            />
          </Link>
        )}
      </article>

      {relatedPosts.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Keep reading
            </h2>
            <Link
              href={
                post.category
                  ? `/category/${post.category.slug}`
                  : "/current-affairs"
              }
              className="text-sm font-semibold text-indigo-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
