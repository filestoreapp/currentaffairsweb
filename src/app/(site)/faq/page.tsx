import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Kerala PSC?",
    a: "The Kerala Public Service Commission (KPSC) is the constitutional body under Article 315 of the Indian Constitution responsible for recruiting candidates to civil services and posts under the Government of Kerala. Its headquarters is at Pattom, Thiruvananthapuram.",
  },
  {
    q: "How do I apply for Kerala PSC exams?",
    a: "First complete the One-Time Registration on the official website keralapsc.gov.in and create your profile. Then, whenever a notification you're eligible for is published, log in and click \u201cApply Now\u201d against that post before the last date. Applying is free.",
  },
  {
    q: "What is One-Time Registration?",
    a: "One-Time Registration is a single, permanent candidate profile on keralapsc.gov.in. Once registered, you can apply to any number of PSC notifications without filling your details again. Keep your photo, signature and certificates uploaded and up to date.",
  },
  {
    q: "What are the age limits for Kerala PSC exams?",
    a: "Age limits vary from post to post and are fixed in each notification. As a rough guide, many posts accept candidates aged 18\u201336, with the usual relaxations for SC, ST, OBC and other eligible categories. Always check the age clause in the specific notification before applying.",
  },
  {
    q: "What is the Kerala PSC exam pattern?",
    a: "Most PSC selections start with an OMR-based objective test of 100 marks (usually 100 questions in 75 minutes). Depending on the post, this may be followed by a descriptive test, physical efficiency test, or interview, and finally document verification.",
  },
  {
    q: "Is there negative marking in Kerala PSC exams?",
    a: "Yes. In Kerala PSC objective (OMR) examinations, one-third (0.33) mark is deducted for every wrong answer. Blind guessing hurts your score \u2014 attempt only what you can reason through, which is exactly what our mock tests train you for.",
  },
  {
    q: "What are LDC, LGS and Degree Level exams?",
    a: "Kerala PSC groups posts by the minimum qualification required: SSLC/10th level (e.g. Lower Division Clerk \u2013 LDC, Last Grade Servants \u2013 LGS), Higher Secondary / Plus-Two level, and Degree level (e.g. Secretariat Assistant, University Assistant). The syllabus depth increases with the level.",
  },
  {
    q: "What is a PSC ranked list?",
    a: "After the exams and interview, PSC publishes a ranked (merit) list of qualified candidates. Appointments to vacancies are made strictly in rank order while the list is valid \u2014 usually one to three years depending on the post.",
  },
  {
    q: "Where can I find the syllabus for my post?",
    a: "PSC publishes a post-wise syllabus PDF for every notified post on keralapsc.gov.in. You can also browse them in our Syllabus Tracker, which links each syllabus to related quizzes and mock tests.",
  },
  {
    q: "How do I download my Kerala PSC hall ticket?",
    a: "Admission tickets (hall tickets) are released on keralapsc.gov.in a couple of weeks before the exam. Log in to your One-Time Registration profile, go to the Admission Ticket section, and download it. No ticket is sent by post.",
  },
  {
    q: "How can I prepare for Kerala PSC for free?",
    a: "Right here: take the daily quizzes, attempt timed mock tests with negative marking, solve previous-year questions, and read the daily current-affairs notes. Our Telegram channel posts fresh quiz questions every morning and evening.",
  },
  {
    q: "Is this website run by Kerala PSC?",
    a: "No. This is an independent exam-preparation resource made for aspirants. It is not affiliated with the Kerala Public Service Commission. For official notifications, dates and results, always verify on keralapsc.gov.in.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const url = `${siteUrl()}/faq`;
  const title = "Kerala PSC FAQs \u2014 Eligibility, Exam Pattern, Age Limit, Syllabus";
  const description =
    "Answers to the most asked Kerala PSC questions: one-time registration, age limits, exam pattern, negative marking, ranked lists, hall tickets and free preparation.";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
  };
}

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          Help Center
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Kerala PSC \u2014 Frequently Asked Questions
        </h1>
        <p className="mt-3 text-slate-500">
          Straight answers on eligibility, the exam pattern, negative marking,
          ranked lists and more. For official confirmations, always check{" "}
          <a
            href="https://www.keralapsc.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 hover:underline"
          >
            keralapsc.gov.in
          </a>
          .
        </p>

        <div className="mt-8 space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-slate-200 bg-white shadow-sm open:border-indigo-200 open:shadow"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-slate-800 marker:hidden [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-lg font-bold text-indigo-600 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">
                {f.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white sm:p-8">
          <h2 className="text-xl font-extrabold">Ready to test yourself?</h2>
          <p className="mt-1 text-sm text-indigo-100">
            Reading is good. Answering under time pressure is better.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/mock-tests"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50"
            >
              Take a mock test
            </Link>
            <Link
              href="/quiz"
              className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
            >
              Daily quiz
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
