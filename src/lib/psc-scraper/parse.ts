import * as cheerio from "cheerio";
import type { PscSourceKey } from "@/lib/types";

export interface ScrapedItem {
  source: PscSourceKey;
  title: string;
  source_url: string;
  pdf_url: string | null;
  category_number: string | null;
  published_on: string | null; // yyyy-mm-dd, or null if not parseable
}

const BASE_URL = "https://www.keralapsc.gov.in";

function absolutize(href: string): string {
  try {
    return new URL(href, BASE_URL).toString();
  } catch {
    return href;
  }
}

function isPdfHref(href: string): boolean {
  return /\.pdf($|\?)/i.test(href);
}

/** "31-08-2026" -> "2026-08-31". Returns null if it doesn't match dd-mm-yyyy. */
function parseDdMmYyyy(text: string): string | null {
  const m = text.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

/** Pulls a "YYYY-MM" uploads-folder segment out of a keralapsc.gov.in file URL, e.g.
 * https://www.keralapsc.gov.in/sites/default/files/2026-08/foo.pdf -> "2026-08-01".
 * Used as a fallback date for pages that don't show an explicit "uploaded on" date. */
function dateFromFileUrl(href: string): string | null {
  const m = href.match(/\/sites\/default\/files\/(\d{4})-(\d{2})\//);
  if (!m) return null;
  const [, yyyy, mm] = m;
  return `${yyyy}-${mm}-01`;
}

/**
 * Parses the Drupal "views table" layout used by /notifications,
 * /examination-notification, /syllabus1, /result-notifications,
 * /shortlists, /rankedlist, /interviews.
 *
 * Deliberately generic: walks every <table> -> <tr> -> (<td>, <a>) rather
 * than relying on Kerala PSC's specific CSS classes, since those weren't
 * available to verify against at implementation time. Each row becomes one
 * item, keyed by the first link found in the row (the node/detail page).
 */
export function parseTablePage(html: string, source: PscSourceKey): ScrapedItem[] {
  const $ = cheerio.load(html);
  const items: ScrapedItem[] = [];
  const seen = new Set<string>();

  $("table").each((_, table) => {
    const $table = $(table);
    // Skip the row that's just column headers.
    $table.find("tbody tr, tr").each((__, tr) => {
      const $tr = $(tr);
      if ($tr.find("th").length > 0) return; // header row

      const links = $tr
        .find("a[href]")
        .toArray()
        .map((a) => ({
          href: absolutize($(a).attr("href") || ""),
          text: $(a).text().trim(),
        }))
        .filter((l) => l.href);

      if (links.length === 0) return;

      const titleLink =
        links.find((l) => l.text.length > 0 && !isPdfHref(l.href)) ?? links[0];
      const pdfLink = links.find((l) => isPdfHref(l.href));

      const cellTexts = $tr
        .find("td")
        .toArray()
        .map((td) => $(td).text().trim())
        .filter(Boolean);

      const title = titleLink.text || cellTexts[0] || "";
      const sourceUrl = titleLink.href;
      if (!title || !sourceUrl || seen.has(sourceUrl)) return;
      seen.add(sourceUrl);

      let publishedOn: string | null = null;
      for (const text of [...cellTexts].reverse()) {
        publishedOn = parseDdMmYyyy(text);
        if (publishedOn) break;
      }
      if (!publishedOn && pdfLink) publishedOn = dateFromFileUrl(pdfLink.href);

      const categoryText = cellTexts.find(
        (t) => /CAT\.?\s*NO/i.test(t) && t !== title
      );

      items.push({
        source,
        title,
        source_url: sourceUrl,
        pdf_url: pdfLink ? pdfLink.href : isPdfHref(sourceUrl) ? sourceUrl : null,
        category_number: categoryText ?? null,
        published_on: publishedOn,
      });
    });
  });

  return items;
}

/**
 * Parses the "flat list of PDF links" layout used by /examinations (the
 * exam programme page), which isn't a table — it's just anchors grouped
 * under headings. We only pick up anchors that point into a dated
 * uploads folder (/sites/default/files/YYYY-MM/...) so we don't pick up
 * unrelated PDFs from the site header/footer (e.g. "Authorised
 * Signatory", "Annual Report").
 */
export function parseLinkListPage(html: string, source: PscSourceKey): ScrapedItem[] {
  const $ = cheerio.load(html);
  const items: ScrapedItem[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, a) => {
    const href = absolutize($(a).attr("href") || "");
    if (!/\/sites\/default\/files\/\d{4}-\d{2}\//.test(href)) return;
    if (!isPdfHref(href)) return;
    if (seen.has(href)) return;
    seen.add(href);

    const title = $(a).text().trim() || $(a).attr("title")?.trim() || "";
    if (!title) return;

    items.push({
      source,
      title,
      source_url: href,
      pdf_url: href,
      category_number: null,
      published_on: dateFromFileUrl(href),
    });
  });

  return items;
}
