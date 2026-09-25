import { getPyqBySlug, getMockLeaderboard } from "@/lib/quizzes";
import { notFound } from "next/navigation";
import MockTestPlayer from "@/components/site/MockTestPlayer";
import { quizJsonLd, quizPageMetadata, siteUrl } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paper = await getPyqBySlug(slug);
  if (!paper) return { title: "PYQ Paper" };
  const count = paper.questions?.length ?? 0;
  const examBit =
    paper.exam_name || paper.exam_year
      ? ` (${[paper.exam_name, paper.exam_year].filter(Boolean).join(" ")})`
      : "";
  const description =
    paper.description ||
    `${paper.title}${examBit} — practice ${count} real Kerala PSC previous year questions free, with answers and live leaderboard.`;
  return quizPageMetadata({
    title: `${paper.title} — PYQ Paper`,
    description,
    url: `${siteUrl()}/pyqs/${paper.slug}`,
  });
}

export default async function PyqTakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const paper = await getPyqBySlug(slug);

  if (!paper) notFound();

  // PYQ papers use the same exam-style runner as mock tests.
  const leaderboard = await getMockLeaderboard(paper.id);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            quizJsonLd(paper, `${siteUrl()}/pyqs/${paper.slug}`)
          ),
        }}
      />
      <MockTestPlayer quiz={paper} initialLeaderboard={leaderboard} />
    </>
  );
}
