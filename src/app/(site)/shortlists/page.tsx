import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/seo";
import { format } from "date-fns";
import { Download, ExternalLink, ListChecks } from "lucide-react";
import { getShortlistsPage } from "@/lib/psc-updates";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Kerala PSC Short Lists — Check Your Number" },
  description:
    "Kerala PSC short lists (probability lists) for every post — check whether your register number made the short list, with the official PSC PDF for each event.",
  alternates: {
    canonical: "https://www.psccurrentaffairs.online/shortlists",
  },
};

export const revalidate = 900;

const PER_PAGE = 24;

export default async function ShortlistsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const { updates, total } = await getShortlistsPage(page, PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Short Lists" },
            ])
          ),
        }}
      />
      <h1 className="text-3xl font-extrabold tracking-tight">
        Kerala PSC Short Lists
      </h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        ഷോർട്ട് ലിസ്റ്റ് എന്നാൽ ഫൈനൽ റാങ്ക് ലിസ്റ്റിന് മുമ്പ് PSC പ്രസിദ്ധീകരിക്കുന്ന
        സാധ്യതാ പട്ടികയാണ് — ഈ പട്ടികയിൽ പേരുള്ളവരുടെ രേഖകൾ പരിശോധിച്ച ശേഷമാണ്
        റാങ്ക് ലിസ്റ്റ് തയ്യാറാക്കുന്നത്. ഓരോ പരീക്ഷയുടെയും ഔദ്യോഗിക PDF താഴെ
        നിന്ന് തുറക്കാം.
      </p>
      <p className="mt-2 text-sm text-slate-500">
        {total > 0 ? (
          <>
            <strong className="text-slate-800">{total}</strong> short lists
            tracked from keralapsc.gov.in — always verify against the official
            site before acting on any deadline.
          </>
        ) : (
          "No short lists tracked yet — the scraper checks keralapsc.gov.in daily."
        )}
      </p>

      {updates.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          {page > 1
            ? "No more short lists on this page."
            : "No short lists yet — check back soon."}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {updates.map((u) => (
            <Link
              key={u.id}
              href={`/shortlists/${u.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative flex h-28 w-full items-center justify-center overflow-hidden bg-cyan-50">
                <ListChecks
                  size={72}
                  strokeWidth={1.25}
                  className="text-cyan-300 transition duration-300 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-white">
                  Short List
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-3 text-base font-bold text-slate-900 group-hover:text-indigo-600">
                  {u.title}
                </h3>
                {u.category_number && (
                  <p className="mt-2 line-clamp-1 text-xs text-slate-500">
                    {u.category_number}
                  </p>
                )}
                <div className="mt-3 flex flex-1 items-end justify-between gap-3">
                  <p className="text-xs font-medium text-slate-400">
                    {u.published_on
                      ? format(new Date(u.published_on), "dd MMM yyyy")
                      : format(new Date(u.scraped_at), "dd MMM yyyy")}
                  </p>
                  <span className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-indigo-600">
                    {u.pdf_url ? (
                      <>
                        <Download size={14} /> PDF
                      </>
                    ) : (
                      <>
                        <ExternalLink size={14} /> Open
                      </>
                    )}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link
              href={`/shortlists?page=${page - 1}`}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600"
            >
              ← Previous
            </Link>
          ) : (
            <span className="rounded-full border border-slate-100 bg-slate-50 px-5 py-2 text-sm font-semibold text-slate-300">
              ← Previous
            </span>
          )}
          <span className="text-sm font-medium text-slate-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/shortlists?page=${page + 1}`}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-full border border-slate-100 bg-slate-50 px-5 py-2 text-sm font-semibold text-slate-300">
              Next →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
