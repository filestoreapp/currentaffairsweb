import type { Metadata } from "next";
import CopyButton from "@/components/site/CopyButton";
import { siteUrl } from "@/lib/seo";

/**
 * Embed hub — copy-paste widgets other coaching sites and blogs can put
 * on their own pages. Every widget carries a visible "Powered by Kerala
 * PSC Current Affairs" backlink. Honest scope: the widget alone doesn't
 * create links — another site has to choose to embed it; outreach is a
 * separate job. These previews load lazily so this page stays fast.
 */

export const metadata: Metadata = {
  title: "Embed Our Widgets — Kerala PSC Current Affairs",
  description:
    "Add the Kerala PSC daily quiz or the latest PSC notifications feed to your site with one iframe. Free, lightweight, and every widget links back to psccurrentaffairs.online.",
  alternates: { canonical: `${siteUrl()}/embed` },
};

const QUIZ_CODE = `<iframe src="https://www.psccurrentaffairs.online/embed/quiz" width="100%" height="720" style="border:0" loading="lazy" title="Kerala PSC Daily Quiz"></iframe>`;
const UPDATES_CODE = `<iframe src="https://www.psccurrentaffairs.online/embed/updates" width="100%" height="560" style="border:0" loading="lazy" title="Kerala PSC Notifications"></iframe>`;

function WidgetSection({
  id,
  emoji,
  title,
  description,
  code,
  previewSrc,
  previewHeight,
  previewTitle,
}: {
  id: string;
  emoji: string;
  title: string;
  description: string;
  code: string;
  previewSrc: string;
  previewHeight: number;
  previewTitle: string;
}) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-extrabold text-slate-900">
        {emoji} {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Copy-paste this code
        </p>
        <CopyButton text={code} />
      </div>
      <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
        {code}
      </pre>
      <p className="mt-6 text-xs font-bold uppercase tracking-wide text-slate-400">
        Live preview
      </p>
      <div className="mt-2 overflow-hidden rounded-xl ring-1 ring-slate-200">
        <iframe
          src={previewSrc}
          width="100%"
          height={previewHeight}
          style={{ border: 0 }}
          loading="lazy"
          title={previewTitle}
        />
      </div>
    </section>
  );
}

export default function EmbedPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Embed our widgets on your site
        </h1>
        <p className="mt-3 leading-relaxed text-slate-600">
          Two free widgets for coaching sites, blogs and study groups: the
          daily Kerala PSC quiz and the latest PSC notifications feed. Paste
          one line of code and it just works — no sign-up, no tracking
          beyond our normal site analytics, and every widget shows a
          &ldquo;Powered by Kerala PSC Current Affairs&rdquo; link back to
          us. If you run a site and embed one, let us know — we&apos;d love
          to see it.
        </p>
      </div>

      <WidgetSection
        id="daily-quiz"
        emoji="🧠"
        title="Daily Quiz"
        description="Today's Kerala PSC current-affairs quiz, playable right on your page — visitors answer, see their score and join the leaderboard. It follows the daily digest quiz, so it refreshes every morning."
        code={QUIZ_CODE}
        previewSrc="/embed/quiz"
        previewHeight={720}
        previewTitle="Kerala PSC Daily Quiz — preview"
      />

      <WidgetSection
        id="notifications"
        emoji="📢"
        title="PSC Notifications Feed"
        description="The latest Kerala PSC notifications, shortlists and announcements as they appear on our site, each linking to the official PSC source. Updates automatically — nothing to maintain on your side."
        code={UPDATES_CODE}
        previewSrc="/embed/updates"
        previewHeight={560}
        previewTitle="Kerala PSC Notifications — preview"
      />
    </div>
  );
}
