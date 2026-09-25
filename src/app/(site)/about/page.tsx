import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Trophy, ScrollText, ListChecks, Bell, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "About PSC Current Affairs — free Kerala PSC exam preparation with daily current affairs, quizzes, mock tests and PYQ papers.",
};

const FEATURES = [
  {
    icon: Newspaper,
    title: "Daily Current Affairs",
    text: "Day-wise Kerala PSC current affairs in English and Malayalam, with exam-oriented facts and quick-revision tables.",
  },
  {
    icon: Trophy,
    title: "Quizzes & Mock Tests",
    text: "Free practice quizzes and full-length mock tests with timer, negative marking and live leaderboards.",
  },
  {
    icon: ScrollText,
    title: "PYQ Papers",
    text: "Previous year Kerala PSC question papers to practice in real exam conditions.",
  },
  {
    icon: ListChecks,
    title: "Syllabus Tracker",
    text: "Tick off the Kerala PSC syllabus topic by topic and watch your coverage grow.",
  },
  {
    icon: Bell,
    title: "PSC Notifications",
    text: "Exam programmes, ranked lists and official notifications from keralapsc.gov.in, tracked daily.",
  },
];

export default function AboutPage() {
  const telegramUrl =
    process.env.NEXT_PUBLIC_TELEGRAM_URL ||
    "https://t.me/Daily_CurrentAffairs_Malayalam";

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">About Us</h1>
      <p className="mt-3 max-w-3xl text-lg leading-relaxed text-slate-600">
        <strong className="font-bold text-slate-900">PSC Current Affairs</strong>{" "}
        is a free Kerala PSC exam preparation website run by{" "}
        <strong className="font-bold text-slate-900">Abin Vinoy</strong>. Every
        day we publish Kerala PSC current affairs, quizzes and study material —
        in English and Malayalam — so aspirants can prepare without paying for
        expensive coaching material.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Icon size={20} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold tracking-tight text-indigo-950">
          Join our Telegram channel
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Daily quiz polls, current-affairs alerts and PSC notifications —
          delivered free on Telegram as they happen.
        </p>
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1c8bc0]"
        >
          <Send size={15} /> @Daily_CurrentAffairs_Malayalam
        </a>
      </div>

      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-slate-500">
        PSC Current Affairs is an independent educational website and is not
        affiliated with or endorsed by the Kerala Public Service Commission.
        Official notifications are sourced from keralapsc.gov.in — always verify
        critical dates against the official website. Have a question?{" "}
        <Link href="/contact" className="font-semibold text-indigo-600 hover:underline">
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
