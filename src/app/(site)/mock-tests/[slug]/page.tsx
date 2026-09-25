import { getMockBySlug, getMockLeaderboard } from "@/lib/quizzes";
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
  const mock = await getMockBySlug(slug);
  if (!mock) return { title: "Mock Test" };
  const count = mock.questions?.length ?? 0;
  const minutes = mock.time_limit_seconds
    ? Math.round(mock.time_limit_seconds / 60)
    : null;
  const description =
    mock.description ||
    `Free ${mock.title} — ${count} Kerala PSC questions${
      minutes ? `, ${minutes} minutes` : ""
    }, negative marking and live leaderboard. Practice like the real exam.`;
  return quizPageMetadata({
    title: `${mock.title} — Free Mock Test`,
    description,
    url: `${siteUrl()}/mock-tests/${mock.slug}`,
  });
}

export default async function MockTestTakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mock = await getMockBySlug(slug);

  if (!mock) notFound();

  const leaderboard = await getMockLeaderboard(mock.id);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            quizJsonLd(mock, `${siteUrl()}/mock-tests/${mock.slug}`)
          ),
        }}
      />
      <MockTestPlayer quiz={mock} initialLeaderboard={leaderboard} />
    </>
  );
}
