import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy of PSC Current Affairs — what data we collect, how we use it, and your choices.",
};

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "Information we collect",
    body: (
      <>
        <p>
          We collect the minimum needed to run the site. You can read articles,
          take quizzes and use the syllabus tracker without creating an
          account.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Quiz &amp; mock test attempts:</strong> when you submit a
            quiz, we store the display name you enter along with your score so
            leaderboards can work. No email or password is asked for.
          </li>
          <li>
            <strong>Usage statistics:</strong> we count page views in aggregate
            to understand which content helps aspirants most.
          </li>
          <li>
            <strong>Contact messages:</strong> if you use the contact form, it
            opens your own email app — your message goes directly to our inbox
            and nothing is stored on our servers by the form itself.
          </li>
        </ul>
      </>
    ),
  },
  {
    heading: "How we use it",
    body: (
      <p>
        Display names and scores power the public leaderboards. Aggregated
        statistics guide which topics we cover next. We do not sell, rent or
        share your information with third parties for their own marketing.
      </p>
    ),
  },
  {
    heading: "Cookies and advertising",
    body: (
      <>
        <p>
          The site uses a small number of functional cookies/local storage
          entries (for example, to remember your syllabus tracker progress on
          your own device).
        </p>
        <p>
          We use <strong>Google AdSense</strong> to show ads. Google and its
          partners use cookies — including the DoubleClick cookie — to serve
          ads based on your prior visits to this and other websites. You can
          opt out of personalised advertising at{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-indigo-600 hover:underline"
          >
            Google Ad Settings
          </a>{" "}
          or{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-indigo-600 hover:underline"
          >
            aboutads.info
          </a>
          . Learn more in{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-indigo-600 hover:underline"
          >
            Google&apos;s advertising policy
          </a>
          .
        </p>
      </>
    ),
  },
  {
    heading: "Third-party services",
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>
          <strong>Vercel</strong> — website hosting and delivery.
        </li>
        <li>
          <strong>Supabase</strong> — database for posts, quizzes and
          leaderboards.
        </li>
        <li>
          <strong>Google AdSense</strong> — advertising (see above).
        </li>
        <li>
          <strong>Telegram</strong> — our channel links open the Telegram app;
          Telegram&apos;s own privacy policy applies there.
        </li>
      </ul>
    ),
  },
  {
    heading: "Data retention and your choices",
    body: (
      <p>
        Leaderboard entries are kept so past rankings remain visible. If you
        want a display name removed from a leaderboard, contact us and we will
        delete it. Aggregated statistics contain no personal identifiers.
      </p>
    ),
  },
  {
    heading: "Children's privacy",
    body: (
      <p>
        This site is intended for Kerala PSC exam aspirants. We do not
        knowingly collect personal information from children under 13. If you
        believe a child has submitted personal information, contact us and we
        will remove it.
      </p>
    ),
  },
  {
    heading: "Changes to this policy",
    body: (
      <p>
        We may update this policy as the site evolves. Material changes will be
        reflected here with a new &ldquo;last updated&rdquo; date.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">
        Last updated: 25 September 2026
      </p>

      <div className="mt-8 space-y-8">
        {SECTIONS.map(({ heading, body }) => (
          <section key={heading}>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {heading}
            </h2>
            <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-600">
              {body}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600">
        Questions about this policy?{" "}
        <Link
          href="/contact"
          className="font-semibold text-indigo-600 hover:underline"
        >
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
