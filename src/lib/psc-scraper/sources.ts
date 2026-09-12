import type { PscSourceKey } from "@/lib/types";

export type PscPageLayout = "table" | "link-list";

export interface PscSource {
  key: PscSourceKey;
  label: string;
  /** Page to fetch. Drupal "table" views take an optional ?page=0 param for pagination. */
  url: string;
  layout: PscPageLayout;
}

/**
 * Every page here is on the official Kerala PSC website. Each run only
 * fetches page 0 (the newest items) of each listing — new notifications
 * always appear at the top, and we dedupe by URL anyway, so there's no
 * need to page further back on a recurring scrape.
 *
 * NOTE ON SELECTORS: the parser (parse.ts) deliberately does NOT rely on
 * keralapsc.gov.in's specific CSS class names — it walks generic
 * <table>/<tr>/<td>/<a> structure (for "table" pages) or collects PDF
 * anchors under each heading (for "link-list" pages, e.g. the exam
 * programme page, which isn't a table at all). This is more resilient to
 * markup tweaks than class-based selectors, but if Kerala PSC redesigns
 * the site, re-check /api/cron/psc-scrape?dry_run=1 output against the
 * live pages.
 */
export const PSC_SOURCES: PscSource[] = [
  {
    key: "notifications",
    label: "Notifications (Gazette)",
    url: "https://www.keralapsc.gov.in/notifications?tid=All&page=0",
    layout: "table",
  },
  {
    key: "examination_notification",
    label: "Examination Notifications",
    url: "https://www.keralapsc.gov.in/examination-notification?page=0",
    layout: "table",
  },
  {
    key: "syllabus",
    label: "Postwise Syllabus",
    url: "https://www.keralapsc.gov.in/syllabus1?page=0",
    layout: "table",
  },
  {
    key: "exam_programme",
    label: "Examination Programme",
    url: "https://www.keralapsc.gov.in/examinations?tid=All&page=0",
    layout: "link-list",
  },
  {
    key: "result_notifications",
    label: "Result Notifications",
    url: "https://www.keralapsc.gov.in/result-notifications?page=0",
    layout: "table",
  },
  {
    key: "shortlists",
    label: "Short Lists",
    url: "https://www.keralapsc.gov.in/shortlists?page=0",
    layout: "table",
  },
  {
    key: "rankedlist",
    label: "Ranked Lists",
    url: "https://www.keralapsc.gov.in/rankedlist?page=0",
    layout: "table",
  },
  {
    key: "interviews",
    label: "Interview Schedule",
    url: "https://www.keralapsc.gov.in/interviews?page=0",
    layout: "table",
  },
];
