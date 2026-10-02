import { getPublishedPosts } from "@/lib/posts";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * GET /rss.xml — RSS 2.0 feed of the latest published current-affairs posts.
 * Lets feed readers and bots subscribe; also advertised via the
 * application/rss+xml alternate link in the root layout metadata.
 */
export async function GET() {
  const siteUrl = (
    "https://www.psccurrentaffairs.online"
  ).replace(/\/$/, "");
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "PSC Current Affairs";

  let posts: Awaited<ReturnType<typeof getPublishedPosts>>["posts"] = [];
  try {
    posts = (await getPublishedPosts({ perPage: 30 })).posts;
  } catch (err) {
    console.error("rss: failed to fetch posts", err);
  }

  const items = posts
    .map((p) => {
      const url = `${siteUrl}/current-affairs/${p.slug}`;
      const pubDate = p.published_at ? new Date(p.published_at).toUTCString() : new Date().toUTCString();
      const desc = stripHtml(p.excerpt || p.meta_description || "").slice(0, 400);
      return [
        "    <item>",
        `      <title>${escapeXml(p.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        desc ? `      <description>${escapeXml(desc)}</description>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const rss = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${escapeXml(siteName)} — Daily Kerala PSC Current Affairs</title>`,
    `    <link>${escapeXml(siteUrl)}</link>`,
    "    <description>Daily Kerala PSC current affairs, GK updates, practice quizzes and official notification tracking.</description>",
    "    <language>en-in</language>",
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(rss, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
