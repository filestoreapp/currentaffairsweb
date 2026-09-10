import { format } from "date-fns";
import {
  Megaphone,
  FileText,
  BookOpen,
  CalendarDays,
  Award,
  ListChecks,
  Trophy,
  Users,
  Download,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import type { PscSourceKey, PscUpdate } from "@/lib/types";
import { PSC_SOURCES } from "@/lib/psc-scraper/sources";

const SOURCE_STYLE: Record<
  PscSourceKey,
  { icon: LucideIcon; band: string; iconColor: string; badge: string }
> = {
  notifications: {
    icon: Megaphone,
    band: "bg-violet-50",
    iconColor: "text-violet-300",
    badge: "bg-violet-600",
  },
  examination_notification: {
    icon: FileText,
    band: "bg-blue-50",
    iconColor: "text-blue-300",
    badge: "bg-blue-600",
  },
  syllabus: {
    icon: BookOpen,
    band: "bg-emerald-50",
    iconColor: "text-emerald-300",
    badge: "bg-emerald-600",
  },
  exam_programme: {
    icon: CalendarDays,
    band: "bg-amber-50",
    iconColor: "text-amber-300",
    badge: "bg-amber-600",
  },
  result_notifications: {
    icon: Award,
    band: "bg-rose-50",
    iconColor: "text-rose-300",
    badge: "bg-rose-600",
  },
  shortlists: {
    icon: ListChecks,
    band: "bg-cyan-50",
    iconColor: "text-cyan-300",
    badge: "bg-cyan-600",
  },
  rankedlist: {
    icon: Trophy,
    band: "bg-orange-50",
    iconColor: "text-orange-300",
    badge: "bg-orange-600",
  },
  interviews: {
    icon: Users,
    band: "bg-slate-100",
    iconColor: "text-slate-300",
    badge: "bg-slate-700",
  },
};

function isNew(scrapedAt: string) {
  return Date.now() - new Date(scrapedAt).getTime() < 1000 * 60 * 60 * 48;
}

export default function PscUpdateCard({ update }: { update: PscUpdate }) {
  const style = SOURCE_STYLE[update.source];
  const Icon = style.icon;
  const label = PSC_SOURCES.find((s) => s.key === update.source)?.label ?? update.source;
  const href = update.pdf_url || update.source_url;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={`relative flex h-28 w-full items-center justify-center overflow-hidden ${style.band}`}>
        <Icon
          size={72}
          strokeWidth={1.25}
          className={`${style.iconColor} transition duration-300 group-hover:scale-105`}
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${style.badge}`}
        >
          {label}
        </span>
        {isNew(update.scraped_at) && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
            New
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-3 text-base font-bold text-slate-900 group-hover:text-indigo-600">
          {update.title}
        </h3>
        {update.category_number && (
          <p className="mt-2 line-clamp-1 text-xs text-slate-500">
            {update.category_number}
          </p>
        )}
        <div className="mt-3 flex flex-1 items-end justify-between gap-3">
          <p className="text-xs font-medium text-slate-400">
            {update.published_on
              ? format(new Date(update.published_on), "dd MMM yyyy")
              : format(new Date(update.scraped_at), "dd MMM yyyy")}
          </p>
          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-indigo-600">
            {update.pdf_url ? (
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
    </a>
  );
}
