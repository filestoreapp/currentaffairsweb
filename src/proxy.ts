import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSeriesSlug } from "./lib/series-paths";

/**
 * 301 the legacy /current-affairs/<series-slug> URLs to their clean
 * top-level form /<series-slug> (freedom-fighter series only).
 */
export default function proxy(req: NextRequest) {
  const slug = req.nextUrl.pathname
    .slice("/current-affairs/".length)
    .split("/")[0];
  if (slug && isSeriesSlug(slug)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${slug}`;
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/current-affairs/:slug*",
};
