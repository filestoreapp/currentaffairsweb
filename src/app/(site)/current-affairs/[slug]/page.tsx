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
import { postPublicPath } from "@/lib/series-paths";


export const revalidate = 300; // 5 min — no cookies used now, so this can ISR

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const siteUrl = "https://www.psccurrentaffairs.online";
  const postUrl = `${siteUrl}${postPublicPath(post.slug)}`;
  const title = post.meta_title || post.title;
  const desc = post.meta_description || post.excerpt || undefined;
  const images = post.cover_image ? [post.cover_image] : ["/og-default.png"];
  return {
    title,
    description: desc,
    alternates: { canonical: postUrl },
    openGraph: {
      title,
      description: desc,
      images,
      type: "article",
      url: postUrl,
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: ["PSC Current Affairs"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images,
    },
  };
}

function readingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

type TocHeading = { id: string; text: string };

function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

// Extract <h2> headings for the table of contents and inject anchor ids.
// Returns the (possibly modified) html plus the heading list in order.
function extractHeadings(html: string): { html: string; headings: TocHeading[] } {
  const headings: TocHeading[] = [];
  const seen = new Set<string>();
  const out = html.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (m, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      if (!text) return m;
      const existing = /\sid\s*=\s*["']([^"']+)["']/i.exec(attrs);
      let id = existing ? existing[1] : slugifyHeading(text);
      if (!existing) {
        const base = id;
        let n = 2;
        while (seen.has(id)) id = `${base}-${n++}`;
      }
      seen.add(id);
      headings.push({ id, text });
      if (existing) return m;
      return `<h2${attrs} id="${id}" style="scroll-margin-top:96px">${inner}</h2>`;
    }
  );
  return { html: out, headings };
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
  const { html: contentHtml, headings } = extractHeadings(post.content_html);
  const showToc = headings.length >= 3;

  const siteUrl = "https://www.psccurrentaffairs.online";
  const postUrl = `${siteUrl}${postPublicPath(post.slug)}`;

  const publisher = {
    "@type": "Organization",
    name: "PSC Current Affairs",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/og-default.png`,
    },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.cover_image ? [post.cover_image] : [`${siteUrl}/og-default.png`],
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at,
    author: publisher,
    publisher,
    mainEntityOfPage: postUrl,
    inLanguage: "en",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Current Affairs",
        item: `${siteUrl}/current-affairs`,
      },
      ...(post.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: post.category.name,
              item: `${siteUrl}/category/${post.category.slug}`,
            },
          ]
        : []),
      { "@type": "ListItem", position: post.category ? 4 : 3, name: post.title },
    ],
  };

  return (
    <div>
      <PostViewTracker slug={post.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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

        {showToc && (
          <nav
            aria-label="Table of contents"
            className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5"
          >
            <p className="text-sm font-extrabold uppercase tracking-wide text-indigo-900">
              In this article
            </p>
            <ol className="mt-3 space-y-2">
              {headings.map((h, i) => (
                <li key={h.id} className="flex items-start gap-2.5 text-[15px]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  <a
                    href={`#${h.id}`}
                    className="font-medium leading-snug text-slate-700 hover:text-indigo-700 hover:underline"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div
          className="prose prose-slate mt-8 max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
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
