/**
 * Latest announcements from the Kerala PSC official "Latest" page
 * (https://www.keralapsc.gov.in/latest) — ranked lists, short lists,
 * admission-ticket notices, OTV etc. Parsed server-side from the page's
 * HTML table; never throws (returns [] when the PSC site is unreachable).
 */

export interface PscAnnouncement {
  sl: string;
  type: string;
  title: string;
  details: string;
  fileUrl: string | null;
}

const LATEST_URL = "https://www.keralapsc.gov.in/latest";
const BASE_URL = "https://www.keralapsc.gov.in";

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'");
}

const clean = (s: string) => decodeEntities(stripTags(s));

export async function getLatestPscAnnouncements(): Promise<PscAnnouncement[]> {
  try {
    const res = await fetch(LATEST_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PSC-CurrentAffairs/1.0)",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) ?? [];
    const out: PscAnnouncement[] = [];

    for (const row of rows) {
      const cell = (header: string): string | null => {
        const m = row.match(
          new RegExp(`<td[^>]*headers="${header}"[^>]*>([\\s\\S]*?)</td>`)
        );
        return m ? m[1] : null;
      };
      const typeCell = cell("view-type-table-column");
      const titleCell = cell("view-title-table-column");
      if (!typeCell || !titleCell) continue; // header row

      const fileCell = cell("view-field-file-table-column") ?? "";
      const href = fileCell.match(/href="([^"]+)"/)?.[1] ?? null;

      out.push({
        sl: clean(cell("view-counter-table-column") ?? ""),
        type: clean(typeCell),
        title: clean(titleCell),
        details: clean(cell("view-body-table-column") ?? ""),
        fileUrl: href
          ? href.startsWith("http")
            ? href
            : BASE_URL + href
          : null,
      });
    }
    return out;
  } catch {
    return [];
  }
}
