import { ImageResponse } from "next/og";
import { ThumbnailImage, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from "@/lib/thumbnail";
import { NextRequest } from "next/server";

// GET /api/thumbnail?title=...&category=...
// Renders the same branded thumbnail used at publish time, on the fly.
// Used for: (1) an instant preview in the admin editor before a post is
// saved, and (2) a safety-net <img> source for any post that somehow ended
// up with no stored cover_image (e.g. storage upload failed at save time).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title")?.slice(0, 200) || "Kerala PSC Current Affairs";
  const category = searchParams.get("category")?.slice(0, 60) || undefined;

  return new ImageResponse(<ThumbnailImage title={title} category={category} />, {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
