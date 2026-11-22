import { Suspense } from "react";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getAllCategories } from "@/lib/posts";
import QuizList from "@/components/site/QuizList";
import HubFaq from "@/components/site/HubFaq";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: {
    absolute:
      "Kerala PSC Quiz — Free PSC Quiz in Malayalam, 438 Quizzes | കേരള പിഎസ്‌സി ക്വിസ്",
  },
  description:
    "Kerala PSC quiz practice in Malayalam — 438 free quizzes with 7,512 questions, answers and explanations. Daily current affairs quizzes and topic quizzes for LDC, LGS and degree-level exams, with leaderboards. No login needed.",
  alternates: { canonical: "https://www.psccurrentaffairs.online/quiz" },
};

// Cache the quiz listing shell for 5 minutes. The category filter
// (`?category=...`) lives in the Suspense island below, so filtering stays
// dynamic without forcing the whole page to re-query Supabase on every
// visit.
export const revalidate = 300;

function QuizListSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}

export default async function QuizListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  // NOTE: searchParams is intentionally NOT awaited here — it's passed
  // straight through to the Suspense island so this shell stays static.
  const categories = await getAllCategories();

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Quizzes" },
            ])
          ),
        }}
      />
      <h1 className="text-3xl font-extrabold tracking-tight">Kerala PSC Quiz — കേരള പിഎസ്‌സി ക്വിസ്</h1>
      <p className="mt-2 text-slate-500">
        Free Kerala PSC quizzes in Malayalam — daily current affairs quizzes
        and topic quizzes for LDC, LGS and degree-level exams. Enter your
        name, answer the questions, and see how you rank!
      </p>
      <p className="mt-3 max-w-2xl text-slate-500">
        This Kerala PSC quiz collection has 438 quizzes and 7,512 questions,
        every one with the correct answer and a short explanation, so each
        attempt teaches you something new. ദിവസവും പുതിയ കറന്റ് അഫയേഴ്‌സ്
        ക്വിസ് പ്രസിദ്ധീകരിക്കുന്നു — സ്ഥിരമായി പരിശീലിച്ചാൽ പരീക്ഷയിൽ
        ആവർത്തിക്കുന്ന ചോദ്യങ്ങൾ എളുപ്പത്തിൽ പിടികിട്ടും.
      </p>

      <Link
        href="/mock-tests"
        className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white transition hover:shadow-lg"
      >
        <span>
          <span className="block font-extrabold">
            Want the full exam experience?
          </span>
          <span className="mt-0.5 block text-sm text-indigo-100">
            Try our free full-length mock tests — timer, negative marking and
            live leaderboards.
          </span>
        </span>
        <ArrowRight size={24} className="shrink-0" />
      </Link>

      <Suspense fallback={<QuizListSkeleton />}>
        <QuizList searchParams={searchParams} categories={categories} />
      </Suspense>

      <HubFaq
        faqs={[
          {
            q: "How many Kerala PSC quiz questions are available here?",
            a: "The quiz bank currently has 438 quizzes with 7,512 questions, covering daily current affairs and syllabus topics. New quizzes are added regularly, including a fresh current affairs quiz every day.",
          },
          {
            q: "Is the Kerala PSC quiz free to attempt?",
            a: "Yes, completely free. There is no login or payment — enter your name, attempt any quiz and see your score, the correct answers and explanations right away.",
          },
          {
            q: "Is there a daily current affairs quiz?",
            a: "Yes. A new Kerala PSC quiz based on the day's current affairs is published every day in Malayalam, so you can revise the news that matters for upcoming exams in a few minutes.",
          },
          {
            q: "ക്വിസുകൾ മലയാളത്തിലാണോ? (Are the quizzes in Malayalam?)",
            a: "അതെ, ക്വിസുകൾ മലയാളത്തിലാണ്. Yes — the questions are in Malayalam, and every question carries the correct answer with a short explanation to help you learn as you practise.",
          },
          {
            q: "Which exams do these quizzes help with?",
            a: "The quizzes are useful for LDC, LGS, University Assistant, Police Constable and other SSLC, Plus Two and degree-level Kerala PSC exams, since they cover the common syllabus areas and current affairs.",
          },
          {
            q: "What is the difference between a quiz and a mock test?",
            a: "A quiz is short, topic-wise practice you can finish in a few minutes. A mock test is a full-length, timed paper in the real exam pattern — you can find those on our Kerala PSC mock tests page.",
          },
        ]}
      />
    </div>
  );
}
