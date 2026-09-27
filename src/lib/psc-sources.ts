import type { PscUpdate } from "@/lib/types";

/**
 * Display labels for the Kerala PSC update sources. The actual scraping
 * now runs on the Koyeb backend worker — this module only carries the
 * key/label pairs the UI needs, so pages don't pull in the scraper.
 */
export const PSC_SOURCES: { key: PscUpdate["source"]; label: string }[] = [
  { key: "notifications", label: "Notifications (Gazette)" },
  { key: "examination_notification", label: "Examination Notifications" },
  { key: "syllabus", label: "Postwise Syllabus" },
  { key: "exam_programme", label: "Examination Programme" },
  { key: "result_notifications", label: "Result Notifications" },
  { key: "shortlists", label: "Short Lists" },
  { key: "rankedlist", label: "Ranked Lists" },
  { key: "interviews", label: "Interview Schedule" },
];
