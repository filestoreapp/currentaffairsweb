import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, FileText, ExternalLink, Info } from "lucide-react";
import { getLatestPscUpdates } from "@/lib/psc-updates";
import { siteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 300; // refresh as the scraper adds new programmes

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** PSC programme titles look like "Examination Programme for the month of October 2026". */
function examMonth(title: string): string | null {
  const m = title.match(
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})/i
  );
  if (!m) return null;
  const month = MONTHS.find((mo) => mo.toLowerCase() === m[1].toLowerCase());
  return month ? `${month} ${m[2]}` : null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export async function generateMetadata(): Promise<Metadata> {
  const url = `${siteUrl()}/exam-calendar`;
  const title = "Kerala PSC Exam Calendar \u2014 Upcoming Exam Dates & Programme";
  const description =
    "Kerala PSC examination programmes with upcoming exam dates, pulled from official keralapsc.gov.in notifications. Never miss an exam date.";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function ExamCalendarPage() {
  const programmes = await getLatestPscUpdates({ source: "exam_programme", limit: 24 });

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
        Plan ahead
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Kerala PSC Exam Calendar
      </h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        Official examination programmes published by Kerala PSC, newest first.
        Each programme lists the exams scheduled for that month \u2014 open the
        PDF for exact dates, venues and admission-ticket details.
      </p>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Info size={17} className="mt-0.5 shrink-0" />
        <p>
          Dates can change. Always confirm on{" "}
          <a
            href="https://www.keralapsc.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            keralapsc.gov.in
          </a>{" "}
          before making travel plans.
        </p>
      </div>

      {programmes.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <CalendarDays size={36} className="mx-auto text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">
            No programmes yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Examination programmes appear here automatically once the PSC
            website publishes them and our daily fetch picks them up.
          </p>
          <Link
            href="/psc-updates"
            className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Browse all PSC updates
          </Link>
        </div>
      ) : (
        <ol className="mt-8 space-y-4">
          {programmes.map((p) => {
            const month = examMonth(p.title);
            const pdf = p.pdf_url || p.source_url;
            return (
              <li
                key={p.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow sm:flex-row sm:items-center"
              >
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                  <CalendarDays size={20} />
                  {month && (
                    <span className="mt-1 px-1 text-center text-[10px] font-bold leading-tight">
                      {month.split(" ")[0].slice(0, 3)} &apos;{month.split(" ")[1]?.slice(2)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {month && (
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      Exams in {month}
                    </p>
                  )}
                  <h2 className="mt-0.5 font-bold text-slate-900">{p.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Published {formatDate(p.published_on)}
                    {p.category_number ? ` \u00b7 ${p.category_number}` : ""}
                  </p>
                </div>
                {pdf && (
                  <a
                    href={pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    <FileText size={16} />
                    Official PDF
                    <ExternalLink size={14} />
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-10 rounded-2xl bg-slate-900 p-6 text-slate-300 sm:p-8">
        <h2 className="text-lg font-extrabold text-white">
          Preparing for one of these exams?
        </h2>
        <p className="mt-1 text-sm">
          Attempt a timed mock test with negative marking \u2014 just like the
          real thing.
        </p>
        <Link
          href="/mock-tests"
          className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500"
        >
          Browse mock tests
        </Link>
      </div>
    </div>
  );
}
