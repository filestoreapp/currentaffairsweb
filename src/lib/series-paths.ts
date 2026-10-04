/**
 * Clean top-level URLs for the freedom-fighter series.
 *
 * Posts whose slug matches this convention are served at /<slug>
 * (via a next.config.ts rewrite to the real /current-affairs/<slug> page)
 * instead of /current-affairs/<slug>. Everything else keeps the prefix.
 */
export function isSeriesSlug(slug: string): boolean {
  return slug === "indian-freedom-fighters" || slug.startsWith("freedom-fighter-");
}

export function postPublicPath(slug: string): string {
  return isSeriesSlug(slug) ? `/${slug}` : `/current-affairs/${slug}`;
}
