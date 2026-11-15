import type { Metadata } from "next";
import type { Quiz } from "./types";

export const DEFAULT_OG_IMAGE = "/og-default.png";

// Canonical base URL pinned to the custom domain (2026-10-02): the Vercel
// dashboard env var still holds the old vercel.app URL and cannot be
// updated without dashboard access. Revert to env-based when available.
export function siteUrl(): string {
  return "https://www.psccurrentaffairs.online";
}

/** Shared Open Graph / Twitter / canonical block for quiz-type pages. */
export function quizPageMetadata({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
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
