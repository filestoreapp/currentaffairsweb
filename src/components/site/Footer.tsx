import Link from "next/link";
import { Send } from "lucide-react";

const EXPLORE_LINKS = [
  { href: "/current-affairs", label: "Current Affairs" },
  { href: "/quiz", label: "Practice Quizzes" },
  { href: "/psc-updates", label: "PSC Notifications" },
];

export default function Footer() {
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL;

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">
                PC
              </span>
              PSC Current Affairs
            </p>
            <p className="mt-3 max-w-xs">
              Daily Kerala PSC current affairs, updates and study notes to
              help you crack your government job exam.
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-900">Explore</p>
            <ul className="mt-3 space-y-2">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-indigo-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-slate-900">Stay updated</p>
            {telegramUrl ? (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1c8bc0]"
              >
                <Send size={15} /> Join our Telegram channel
              </a>
            ) : (
              <p className="mt-3">Telegram channel coming soon.</p>
            )}
            <p className="mt-4 text-xs text-slate-400">
              New posts, quiz alerts and PSC notifications, delivered as
              they happen.
            </p>
          </div>
        </div>

        <p className="mt-8 border-t border-slate-200 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} PSC Current Affairs. All rights
          reserved. Not affiliated with the Kerala Public Service
          Commission.
        </p>
      </div>
    </footer>
  );
}
