import Link from "next/link";
import {
  Search,
  Home,
  Trophy,
  ClipboardList,
  ScrollText,
  Newspaper,
  BellRing,
  BookOpen,
} from "lucide-react";

const QUICK_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/quiz", label: "Daily Quizzes", icon: Trophy },
  { href: "/mock-tests", label: "Mock Tests", icon: ClipboardList },
  { href: "/pyqs", label: "PYQ Papers", icon: ScrollText },
  { href: "/current-affairs", label: "Current Affairs", icon: Newspaper },
  { href: "/psc-updates", label: "PSC Notifications", icon: BellRing },
  { href: "/syllabus", label: "Syllabus Tracker", icon: BookOpen },
];

export default function NotFoundContent() {
  return (
    <div className="mx-auto max-w-2xl py-14 text-center sm:py-20">
      <p
        aria-hidden
        className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-8xl font-black tracking-tight text-transparent sm:text-9xl"
      >
        404
      </p>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        This page went for a tea break
      </h1>
      <p className="mx-auto mt-3 max-w-md text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist, was moved, or the
        link has a typo. Try searching instead:
      </p>

      <form
        action="/search"
        className="mx-auto mt-6 flex max-w-md items-center gap-2"
      >
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            name="q"
            type="search"
            required
            placeholder="Search quizzes, posts, PSC updates…"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </form>

      <p className="mt-10 text-xs font-bold uppercase tracking-wider text-slate-400">
        Or jump straight to
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href + label}
            href={href}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow"
          >
            <Icon size={17} className="shrink-0 text-indigo-500" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
