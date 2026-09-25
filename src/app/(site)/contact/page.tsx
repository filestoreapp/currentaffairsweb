import type { Metadata } from "next";
import ContactForm from "@/components/site/ContactForm";
import { Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact PSC Current Affairs — reach us on Telegram or send us an email.",
};

// TODO: set the inbox address that contact-form messages should go to.
const CONTACT_EMAIL = "";

export default function ContactPage() {
  const telegramUrl =
    process.env.NEXT_PUBLIC_TELEGRAM_URL ||
    "https://t.me/Daily_CurrentAffairs_Malayalam";

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Contact Us</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Questions, corrections or suggestions — we read everything.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Send size={18} className="text-[#229ED9]" /> Fastest: Telegram
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            The quickest way to reach us is our Telegram channel —
            @Daily_CurrentAffairs_Malayalam. We post daily quizzes and
            current-affairs updates there too.
          </p>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1c8bc0]"
          >
            <Send size={15} /> Open Telegram channel
          </a>
        </div>

        {CONTACT_EMAIL ? (
          <ContactForm to={CONTACT_EMAIL} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">Email</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Email support is being set up. Until then, Telegram above is the
              fastest way to reach us.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
