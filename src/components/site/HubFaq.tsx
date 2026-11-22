type HubFaqItem = { q: string; a: string };

/**
 * Visible FAQ section + matching FAQPage JSON-LD for the SEO hub pages
 * (mock tests, quiz, PYQ, current affairs). Server component — the Q&As
 * render as plain cards, styled like the syllabus-page FAQs.
 */
export default function HubFaq({
  faqs,
  heading = "Frequently Asked Questions — പതിവുചോദ്യങ്ങൾ",
}: {
  faqs: HubFaqItem[];
  heading?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="mt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
        {heading}
      </h2>
      <div className="mt-4 space-y-3">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="font-bold text-slate-800">{f.q}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
