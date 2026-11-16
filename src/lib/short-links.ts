import { randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";

/**
 * Telegram link shortener — /go/<code> links.
 *
 * Click data lives ONLY in the separate free Neon Postgres project
 * (NEON_DATABASE_URL, project `psc-short-links`) — never in the site's
 * Supabase. The Neon HTTP driver is used (no persistent connections), so
 * this is safe from Vercel serverless functions.
 *
 * Tables (created in Neon's SQL Editor):
 *   short_links (code PK, target_url, label, created_at)
 *   short_link_clicks_daily (code FK, day, clicks, PK(code, day))
 *
 * Clicks are bucketed per IST day so the admin page can show "last 7 days"
 * in the timezone the channel's audience lives in.
 */

const SITE_BASE = "https://www.psccurrentaffairs.online";
const SITE_HOSTS = new Set(["www.psccurrentaffairs.online", "psccurrentaffairs.online"]);

const CODE_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
const CODE_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export class ShortLinkError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export function isShortLinksConfigured(): boolean {
  return Boolean(process.env.NEON_DATABASE_URL);
}

export function shortLinkUrl(code: string): string {
  return `${SITE_BASE}/go/${code}`;
}

function getSql() {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    throw new ShortLinkError(
      "Short links are not configured (NEON_DATABASE_URL).",
      503
    );
  }
  return neon(url);
}

/** IST calendar date (YYYY-MM-DD) for a Date. */
function istDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** IST calendar date `days` days ago. */
function istDateDaysAgo(days: number): string {
  return istDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
}

function randomCode(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return out;
}

/**
 * Accept only links on our own site: a site-relative path ("/...") or an
 * absolute URL on psccurrentaffairs.online. Anything else is rejected so
 * the shortener can never be used as an open redirect.
 */
export function normalizeTargetUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return `${SITE_BASE}${trimmed}`;
  }
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!SITE_HOSTS.has(u.hostname.toLowerCase())) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Mint a short link. Random 6-char code, or the caller-supplied alias
 * when it is free (409 when taken). Retries random codes on collision.
 */
export async function mintShortLink(
  targetUrl: string,
  label: string,
  alias?: string
): Promise<{ code: string; shortUrl: string }> {
  const target = normalizeTargetUrl(targetUrl);
  if (!target) {
    throw new ShortLinkError(
      "Target must be a link on psccurrentaffairs.online.",
      400
    );
  }
  const cleanLabel = label.trim().slice(0, 200);
  const sql = getSql();

  if (alias) {
    const code = alias.trim();
    if (!CODE_RE.test(code)) {
      throw new ShortLinkError(
        "Alias must be 1–64 letters, numbers, dashes or underscores.",
        400
      );
    }
    const rows =
      await sql`INSERT INTO short_links (code, target_url, label) VALUES (${code}, ${target}, ${cleanLabel}) ON CONFLICT (code) DO NOTHING RETURNING code`;
    if (rows.length === 0) {
      throw new ShortLinkError(`Short link /go/${code} is already taken.`, 409);
    }
    return { code, shortUrl: shortLinkUrl(code) };
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode(6);
    const rows =
      await sql`INSERT INTO short_links (code, target_url, label) VALUES (${code}, ${target}, ${cleanLabel}) ON CONFLICT (code) DO NOTHING RETURNING code`;
    if (rows.length > 0) return { code, shortUrl: shortLinkUrl(code) };
  }
  throw new ShortLinkError("Could not mint a short link, please try again.", 500);
}

/** Resolve a code to its target URL, or null when unknown. */
export async function resolveShortLink(code: string): Promise<string | null> {
  const sql = getSql();
  const rows =
    await sql`SELECT target_url FROM short_links WHERE code = ${code} LIMIT 1`;
  if (rows.length === 0) return null;
  return rows[0].target_url as string;
}

/** Count one click for today (IST). Upsert — safe under concurrent clicks. */
export async function recordShortLinkClick(code: string): Promise<void> {
  const sql = getSql();
  const day = istDate(new Date());
  await sql`INSERT INTO short_link_clicks_daily (code, day, clicks) VALUES (${code}, ${day}, 1)
    ON CONFLICT (code, day) DO UPDATE SET clicks = short_link_clicks_daily.clicks + 1`;
}

export interface ShortLinkStats {
  code: string;
  target_url: string;
  label: string;
  created_at: string;
  total_clicks: number;
  clicks_7d: number;
}

/** Every link with its total clicks and clicks in the last 7 IST days. */
export async function getShortLinkStats(): Promise<ShortLinkStats[]> {
  const sql = getSql();
  const since = istDateDaysAgo(6);
  const rows = await sql`
    SELECT l.code, l.target_url, l.label, l.created_at,
      COALESCE(SUM(c.clicks), 0)::int AS total_clicks,
      COALESCE(SUM(CASE WHEN c.day >= ${since}::date THEN c.clicks ELSE 0 END), 0)::int AS clicks_7d
    FROM short_links l
    LEFT JOIN short_link_clicks_daily c ON c.code = l.code
    GROUP BY l.code, l.target_url, l.label, l.created_at
    ORDER BY l.created_at DESC
  `;
  return rows as unknown as ShortLinkStats[];
}
