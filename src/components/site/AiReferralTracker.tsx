"use client";

import { useEffect } from "react";

/** AI-assistant domains (including their subdomains) to attribute. */
const AI_REFERRERS = [
  "chatgpt.com",
  "perplexity.ai",
  "claude.ai",
  "gemini.google.com",
] as const;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * AI-referral tracking (2026-11-16). On page load, if the visitor arrived
 * from an AI assistant, fire a GA event so a segment can be built on it:
 *   event: "ai_referral"
 *   parameter: ai_source = the matched domain (e.g. "chatgpt.com")
 * Privacy: only the referrer domain is sent — no personal data, no URL
 * path, no query string. Never breaks the page: guarded + try/catch, and
 * the gtag stub in the root layout queues into dataLayer even if the GA
 * library itself is blocked. Note: with Consent Mode v2 the event is only
 * stored for visitors who accepted analytics cookies.
 */
export default function AiReferralTracker() {
  useEffect(() => {
    try {
      const ref = document.referrer;
      if (!ref) return;
      const host = new URL(ref).hostname.toLowerCase();
      const matched = AI_REFERRERS.find(
        (d) => host === d || host.endsWith(`.${d}`)
      );
      if (!matched) return;
      if (typeof window.gtag === "function") {
        window.gtag("event", "ai_referral", { ai_source: matched });
      }
    } catch {
      // Referrer parsing / gtag failure must never break the page.
    }
  }, []);

  return null;
}
