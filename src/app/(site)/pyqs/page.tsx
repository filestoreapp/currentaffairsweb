import Link from "next/link";
import PyqDirectory from "@/components/site/PyqDirectory";
import pyqPapers from "@/data/pyq-directory.json";
import { ChevronRight, ScrollText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerala PSC Previous Year Question Papers – PYQ PDFs 2014–2026",
  description:
    "Kerala PSC previous year question papers (PYQ) from 2014 to 2026 — 1,442 papers with post name, category number, paper code and exam date. Download PDFs hosted here or from the official PSC site.",
};

export const revalidate = 300;

export default function PyqsDirectoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Kerala PSC Previous Year Question Papers – PYQ PDFs 2014–2026",
    description:
      "Kerala PSC previous year question papers from 2014 to 2026, searchable by post name, paper code or category number.",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "/" },
        { "@type": "ListItem", position: 2, name: "Exams", item: "/exams" },
        {
          "@type": "ListItem",
          position: 3,
          name: "Previous Year Papers",
          item: "/pyqs",
        },
      ],
    },
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
            കേരള പിഎസ്‌സി മുൻവർഷ ചോദ്യപേപ്പറുകൾ
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
            2014 മുതൽ 2026 വരെയുള്ള {pyqPapers.length} കേരള പിഎസ്‌സി
            ചോദ്യപേപ്പറുകളുടെ വിവരങ്ങൾ ഇവിടെ കാണാം. തസ്തികയുടെ പേര്, പേപ്പർ
            കോഡ് അല്ലെങ്കിൽ കാറ്റഗറി നമ്പർ ഉപയോഗിച്ച് തിരയാം.{" "}
            {pyqPapers.filter((p) => p.b2_key).length} പേപ്പറുകളുടെ PDF ഇവിടെ
            നിന്ന് നേരിട്ട് ഡൗൺലോഡ് ചെയ്യാം; മറ്റുള്ളവ ഔദ്യോഗിക സൈറ്റിൽ നിന്ന്.
            2017–2019 വർഷങ്ങളിലെ പേപ്പറുകൾ ഔദ്യോഗിക ആർക്കൈവിൽ ലഭ്യമല്ല.
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
    </div>
  );
}
