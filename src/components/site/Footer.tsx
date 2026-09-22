import Link from "next/link";
import { Send, ClipboardList, ScrollText, ListChecks, Trophy } from "lucide-react";

const EXAM_LINKS = [
  { href: "/mock-tests", label: "Mock Tests", icon: ClipboardList },
  { href: "/pyqs", label: "PYQ Papers", icon: ScrollText },
  { href: "/quiz", label: "Daily Quizzes", icon: Trophy },
  { href: "/syllabus", label: "Syllabus Tracker", icon: ListChecks },
];

const LEARN_LINKS = [
  { href: "/current-affairs", label: "Current Affairs" },
  { href: "/psc-updates", label: "PSC Notifications" },
];

export default function Footer() {
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL;

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="flex items-center gap-2 text-lg font-extrabold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm text-white">
                PC
              </span>
              PSC Current Affairs
            </p>
            <p className="mt-3 max-w-xs leading-relaxed text-slate-400">
              Daily Kerala PSC current affairs, mock tests, PYQ papers and
              study tools to help you crack your government job exam — free
              forever.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Exam Prep
            </p>
            <ul className="mt-4 space-y-2.5">
              {EXAM_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <Icon size={15} className="text-indigo-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Learn
            </p>
            <ul className="mt-4 space-y-2.5">
              {LEARN_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Stay updated
            </p>
            {telegramUrl ? (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1c8bc0]"
              >
                <Send size={15} /> Join our Telegram channel
              </a>
            ) : (
              <p className="mt-4 text-slate-400">Telegram channel coming soon.</p>
            )}
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              New posts, quiz alerts and PSC notifications, delivered as they
              happen.
            </p>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} PSC Current Affairs. All rights
          reserved. Not affiliated with the Kerala Public Service Commission.
        </p>
      </div>
    </footer>
  );
}
