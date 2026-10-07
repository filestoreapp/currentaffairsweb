"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "pscca-cookie-consent-v1";

type ConsentChoice = {
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
  analytics_storage: "granted" | "denied";
};

const ACCEPTED: ConsentChoice = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
};

const DECLINED: ConsentChoice = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
};

// Applies a consent update through gtag if available, otherwise queues it on
// the dataLayer (picked up when the Google tag loads).
function updateConsent(choice: ConsentChoice) {
  const w = window as unknown as Record<string, unknown>;
  if (typeof w.gtag === "function") {
    (w.gtag as (...args: unknown[]) => void)("consent", "update", choice);
  } else {
    const dl = (w.dataLayer as unknown[][]) || [];
    dl.push(["consent", "update", choice]);
    w.dataLayer = dl;
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        // Defaults are denied until updated — re-apply the saved choice.
        updateConsent(JSON.parse(stored) as ConsentChoice);
        return;
      }
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    } catch {
      setVisible(true);
    }
  }, []);

  function choose(choice: ConsentChoice) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(choice));
    } catch {
      // Storage unavailable — the choice still applies for this session.
    }
    updateConsent(choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-6 sm:pb-5"
    >
      <div className="mx-auto max-w-3xl rounded-xl bg-slate-900 p-4 text-sm text-slate-100 shadow-2xl sm:flex sm:items-center sm:gap-5 sm:p-5">
        <p className="flex-1 leading-relaxed">
          We use cookies to improve your experience, analyze site traffic, and
          serve personalized ads. By clicking &ldquo;Accept&rdquo;, you consent
          to our use of cookies as described in our{" "}
          <a
            href="/privacy"
            className="underline underline-offset-2 hover:text-amber-300"
          >
            Privacy Policy
          </a>
          .
        </p>
        <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
          <button
            type="button"
            onClick={() => choose(DECLINED)}
            className="rounded-lg border border-slate-600 px-4 py-2 font-medium text-slate-200 transition hover:border-slate-400 hover:text-white"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose(ACCEPTED)}
            className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 transition hover:bg-amber-300"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
