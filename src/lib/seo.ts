import type { Metadata } from "next";
import type { Quiz } from "./types";

export const DEFAULT_OG_IMAGE = "/og-default.png";

// Canonical base URL pinned to the custom domain (2026-10-02): the Vercel
// dashboard env var still holds the old vercel.app URL and cannot be
// updated without dashboard access. Revert to env-based when available.
export function siteUrl(): string {
  return "https://www.psccurrentaffairs.online";
}

/**
 * Search-facing titles (the <title> tag), kept separate from the visible
 * Malayalam H1s (standing rule 2026-10-11: headings stay fully Malayalam).
 * Titles are absolute (no " | PSC Current Affairs" template suffix) and
 * trimmed to ~60 chars — Google's display limit.
 */
export function fitTitle(title: string, max = 60): string {
  if (title.length <= max) return title;
  return title.slice(0, max - 1).trimEnd() + "…";
}

/** IST date parts for a published timestamp (no UTC drift). */
export function istDateParts(iso: string | null | undefined): {
  day: number;
  monthLong: string;
  monthShort: string;
  year: number;
} | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      ...opts,
    }).format(d);
  return {
    day: Number(fmt({ day: "numeric" })),
    monthLong: fmt({ month: "long" }),
    monthShort: fmt({ month: "short" }),
    year: Number(fmt({ year: "numeric" })),
  };
}

const TITLE_CASE_ACRONYMS = new Set([
  "PSC", "LDC", "LGS", "VEO", "INS", "KSEB", "NVS", "IAS", "IPS", "UPSC",
  "SSC", "RBI", "ISRO", "DRDO", "AI", "GST", "CBI", "ED", "AMVI", "VFA",
]);

/** Slug → readable English topic, e.g. "december-2026-exam-plan" → "December 2026 Exam Plan". */
export function slugToTopic(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => {
      const upper = w.toUpperCase();
      if (TITLE_CASE_ACRONYMS.has(upper)) return upper;
      if (/^\d+$/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

/**
 * Search-facing (<title>) title for a current-affairs post. The visible H1
 * stays the Malayalam post.title — this only composes the <title> tag.
 * Digests get "Kerala PSC Current Affairs {date} (Malayalam)"; standalone
 * posts get topic + date. A hand-set meta_title that differs from the
 * title is respected as an admin override. The digest cron never sets
 * meta_title, so digests always take the composed form.
 */
export function postSearchTitle(post: {
  title: string;
  slug: string;
  meta_title?: string | null;
  published_at?: string | null;
  tags?: string[] | null;
}): string {
  if (post.meta_title && post.meta_title !== post.title) {
    return fitTitle(post.meta_title);
  }
  const parts = istDateParts(post.published_at);
  // Digest detection is slug-only: the "daily-digest" tag is unreliable
  // (the Dec 2026 exam-plan standalone post carries it, and the digest
  // format title would misdescribe it). Digest slugs are always
  // daily-current-affairs-YYYY-MM-DD (cron step 0 + step 6).
  const isDigest = post.slug.startsWith("daily-current-affairs-");
  if (isDigest && parts) {
    return `Kerala PSC Current Affairs ${parts.day} ${parts.monthLong} ${parts.year} (Malayalam)`;
  }
  const topic = slugToTopic(post.slug);
  const dateBit = parts ? ` ${parts.day} ${parts.monthShort} ${parts.year}` : "";
  const suffix = ` — Kerala PSC${dateBit} (Malayalam)`;
  const budget = 60 - suffix.length;
  const shortTopic =
    topic.length > budget
      ? topic.slice(0, Math.max(0, budget - 1)).trimEnd() + "…"
      : topic;
  return `${shortTopic}${suffix}`;
}

/** Shared Open Graph / Twitter / canonical block for quiz-type pages.
 * `title` may be an absolute search title (bypasses the site template). */
export function quizPageMetadata({
  title,
  description,
  url,
}: {
  title: string | { absolute: string };
  description: string;
  url: string;
}): Metadata {
  const plainTitle = typeof title === "string" ? title : title.absolute;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: plainTitle,
      description,
      url,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: plainTitle,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

/**
 * Shared BreadcrumbList builder — absolute URLs, current page last with no
 * `item` URL (matching the post template). Pass `path` only for crumbs
 * that link somewhere; the current page gets none.
 */
export function breadcrumbJsonLd(
  items: { name: string; path?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: `${siteUrl()}${item.path}` } : {}),
    })),
  };
}

/**
 * schema.org Quiz structured data. Questions ship with their accepted
 * answers — the same Q&A is already visible to anyone taking the quiz,
 * and exposing it as structured data targets long-tail question searches.
 * `numberOfQuestions` and `timeRequired` come from the same quiz row the
 * page visibly shows (question count, time limit), never invented.
 */
export function quizJsonLd(quiz: Quiz, url: string) {
  const questions = quiz.questions ?? [];
  const minutes = quiz.time_limit_seconds
    ? Math.round(quiz.time_limit_seconds / 60)
    : null;
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: quiz.title,
    description: quiz.description ?? undefined,
    url,
    inLanguage: "en",
    about: "Kerala Public Service Commission (Kerala PSC) exam preparation",
    numberOfQuestions: questions.length > 0 ? questions.length : undefined,
    timeRequired: minutes ? `PT${minutes}M` : undefined,
    hasPart: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      text: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.options[q.correct_index] ?? "",
      },
    })),
  };
}
