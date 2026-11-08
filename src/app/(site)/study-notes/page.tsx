import Link from "next/link";
import StudyNotesIndex from "@/components/site/StudyNotesIndex";
import { STUDY_SUBJECTS, STUDY_TOPICS, STUDY_TOPICS_WITH_CONTENT } from "@/data/study-notes";
import { ChevronRight, NotebookPen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "കേരള പിഎസ്‌സി പഠന കുറിപ്പുകൾ — Kerala PSC Study Notes in Malayalam",
  description:
    "കേരള പിഎസ്‌സി പരീക്ഷകൾക്കുള്ള പഠന കുറിപ്പുകൾ മലയാളത്തിൽ — കമ്പ്യൂട്ടർ, നിയമം, ഗണിതം, ചരിത്രം, ഭൂമിശാസ്ത്രം തുടങ്ങി 21 വിഷയങ്ങളിലായി 256 വിഷയങ്ങൾ. ചുരുക്കത്തിൽ പഠിക്കാൻ പ്രധാന വസ്തുതകളും റിവിഷൻ പോയിന്റുകളും.",
};

export const revalidate = 300;

export default function StudyNotesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "കേരള പിഎസ്‌സി പഠന കുറിപ്പുകൾ — Kerala PSC Study Notes in Malayalam",
    description:
      "കേരള പിഎസ്‌സി പരീക്ഷകൾക്കുള്ള പഠന കുറിപ്പുകൾ മലയാളത്തിൽ — 21 വിഷയങ്ങളിലായി 256 വിഷയങ്ങൾ.",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "/" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Study Notes",
          item: "/study-notes",
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
        <span className="font-semibold text-slate-700">പഠന കുറിപ്പുകൾ</span>
      </nav>

      {/* Header */}
      <div className="mt-4 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <NotebookPen size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            കേരള പിഎസ്‌സി പഠന കുറിപ്പുകൾ
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
            {STUDY_SUBJECTS.length} വിഷയങ്ങളിലായി {STUDY_TOPICS.length}{" "}
            വിഷയങ്ങളുടെ ചുരുക്കക്കുറിപ്പുകൾ — ഓരോ വിഷയത്തിലും പ്രധാന വസ്തുതകൾ,
            പട്ടികകൾ, റിവിഷൻ പോയിന്റുകൾ. ഇപ്പോൾ{" "}
            {STUDY_TOPICS_WITH_CONTENT.length} കുറിപ്പുകൾ തയ്യാർ; ബാക്കിയുള്ളവ
            ഘട്ടം ഘട്ടമായി വരും.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <StudyNotesIndex
          subjects={STUDY_SUBJECTS.map((s) => ({
            subject: s.subject,
            subjectMalayalam: s.subjectMalayalam,
            topics: s.topics.map((t) => ({
              slug: t.slug,
              topic: t.topic,
              topicMalayalam: t.topicMalayalam,
              hasContent: Boolean(t.content),
            })),
          }))}
        />
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
          href="/syllabus"
          className="font-semibold text-indigo-600 hover:text-indigo-800"
        >
          സിലബസ് ട്രാക്കർ
        </Link>
        <span className="text-slate-300">·</span>
        <Link
          href="/pyqs"
          className="font-semibold text-indigo-600 hover:text-indigo-800"
        >
          മുൻവർഷ ചോദ്യപേപ്പറുകൾ
        </Link>
      </div>
    </div>
  );
}
