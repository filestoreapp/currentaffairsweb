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
 * schema.org Quiz structured data. Questions ship with their accepted
 * answers — the same Q&A is already visible to anyone taking the quiz,
 * and exposing it as structured data targets long-tail question searches.
 */
export function quizJsonLd(quiz: Quiz, url: string) {
  const questions = quiz.questions ?? [];
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: quiz.title,
    description: quiz.description ?? undefined,
    url,
    inLanguage: "en",
    about: "Kerala Public Service Commission (Kerala PSC) exam preparation",
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
