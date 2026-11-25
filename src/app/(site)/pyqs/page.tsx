import Link from "next/link";
import PyqDirectory from "@/components/site/PyqDirectory";
import HubFaq from "@/components/site/HubFaq";
import { breadcrumbJsonLd } from "@/lib/seo";
import pyqPapers from "@/data/pyq-directory.json";
import { ChevronRight, ScrollText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute:
      "Kerala PSC Previous Year Question Papers — PYQ PDFs 2014–2026 | മുൻവർഷ ചോദ്യപേപ്പറുകൾ",
  },
  description:
    "Kerala PSC previous year question papers 2014–2026 — 1,448 papers listed with post name, category number and exam date, and 1,253 papers ready to download as PDFs. Search by post, paper code or category number.",
  alternates: { canonical: "https://www.psccurrentaffairs.online/pyqs" },
};

export const revalidate = 300;

export default function PyqsDirectoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Kerala PSC Previous Year Question Papers – PYQ PDFs 2014–2026",
    description:
      "Kerala PSC previous year question papers from 2014 to 2026, searchable by post name, paper code or category number.",
    breadcrumb: breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Exams", path: "/exams" },
      { name: "Previous Year Papers" },
    ]),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>
        <ChevronRight size={12} />
        <Link href="/exams" className="hover:text-indigo-600">
          Exams
        </Link>
        <ChevronRight size={12} />
        <span className="font-semibold text-slate-700">
          മുൻവർഷ ചോദ്യപേപ്പറുകൾ
        </span>
      </nav>

      {/* Header */}
      <div className="mt-4 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white">
          <ScrollText size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Kerala PSC Previous Year Question Papers
            <span className="mt-1 block text-xl text-slate-600 sm:text-2xl">
              കേരള പിഎസ്‌സി മുൻവർഷ ചോദ്യപേപ്പറുകൾ
            </span>
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
            2014 മുതൽ 2026 വരെയുള്ള {pyqPapers.length} കേരള പിഎസ്‌സി
            ചോദ്യപേപ്പറുകളുടെ വിവരങ്ങൾ ഇവിടെ കാണാം. തസ്തികയുടെ പേര്, പേപ്പർ
            കോഡ് അല്ലെങ്കിൽ കാറ്റഗറി നമ്പർ ഉപയോഗിച്ച് തിരയാം.{" "}
            {pyqPapers.filter((p) => p.b2_key).length} പേപ്പറുകളുടെ PDF ഇവിടെ
            നിന്ന് നേരിട്ട് ഡൗൺലോഡ് ചെയ്യാം; മറ്റുള്ളവ ഔദ്യോഗിക സൈറ്റിൽ നിന്ന്.
            2017–2019 വർഷങ്ങളിലെ പേപ്പറുകൾ ഔദ്യോഗിക ആർക്കൈവിൽ ലഭ്യമല്ല.
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
            This directory lists 1,448 Kerala PSC previous year question
            papers from 2014 to 2026, and 1,253 of them can be downloaded
            here as PDFs; the rest link to the official PSC website. Solving
            previous year papers is the surest way to learn the question
            pattern, the repeated topics and the difficulty level of your
            exam before you sit for it.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <PyqDirectory papers={pyqPapers} />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/exams"
          className="font-semibold text-indigo-600 hover:text-indigo-800"
        >
          ← എല്ലാ പരീക്ഷകളും
        </Link>
        <span className="text-slate-300">·</span>
        <Link
          href="/mock-tests"
          className="font-semibold text-indigo-600 hover:text-indigo-800"
        >
          മോക്ക് ടെസ്റ്റുകൾ
        </Link>
        <span className="text-slate-300">·</span>
        <Link
          href="/syllabus"
          className="font-semibold text-indigo-600 hover:text-indigo-800"
        >
          സിലബസ് ട്രാക്കർ
        </Link>
      </div>

      <HubFaq
        faqs={[
          {
            q: "Where can I download Kerala PSC previous year question papers?",
            a: "Right here. This directory lists 1,448 Kerala PSC previous year question papers from 2014 to 2026, and 1,253 of them can be downloaded directly as PDFs. For the remaining papers, each entry links to the official PSC website.",
          },
          {
            q: "Are the previous year question papers free?",
            a: "Yes. Browsing the directory and downloading the question paper PDFs is completely free — no login or payment is needed.",
          },
          {
            q: "How do I find the question paper for a specific post?",
            a: "Use the search on this page to look up a paper by post name, paper code or Kerala PSC category number. Each entry also shows the exam date, so you can pick the most recent papers for your post.",
          },
          {
            q: "Which years are covered in the PYQ directory?",
            a: "Papers from 2014 to 2026 are listed. Papers from 2017–2019 are not available in the official PSC archive, so a few of those years have gaps.",
          },
          {
            q: "മുൻവർഷ ചോദ്യപേപ്പറുകൾ എങ്ങനെ പഠനത്തിന് ഉപയോഗിക്കാം? (How should I practise with previous year papers?)",
            a: "ആദ്യം സിലബസ് പൂർത്തിയാക്കി, പിന്നീട് സമയം നിശ്ചയിച്ച് പേപ്പറുകൾ എഴുതി പരിശീലിക്കുക. Start by solving the latest papers under timed conditions, note the topics that repeat across years, and then revise those topics first — repeated questions are common in Kerala PSC exams.",
          },
        ]}
      />
    </div>
  );
}
