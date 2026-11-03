"use client";

import { useEffect, useRef, useState } from "react";

// Homepage hero stats — REAL counts, verified 2026-11-03 (no "+" suffix: exact numbers).
// Mock Tests 8: sitemap (6 Kerala PSC + 2 University Assistant).
// PSC Updates 368: psc-updates URLs in sitemap. (Replaces "PYQ Papers": no
// verifiable PYQ-paper count exists — /pyqs redirects to /exams, nothing in sitemap.)
// Practice Quizzes 149: 148 in DB on 2026-11-02 + 2026-11-03 digest quiz.
// Study Notes 254: published current-affairs posts in sitemap.
// Practice Questions 2270: 2265 in DB on 2026-11-02 + 5 in today's digest quiz.
// Telegram Members 2363: Bot API getChatMemberCount on @Daily_CurrentAffairs_Malayalam.
// (Replaces "Happy Aspirants": no such metric exists.)
const STATS = [
  { value: 8, suffix: "", label: "Mock Tests" },
  { value: 368, suffix: "", label: "PSC Updates" },
  { value: 149, suffix: "", label: "Practice Quizzes" },
  { value: 254, suffix: "", label: "Study Notes" },
  { value: 2270, suffix: "", label: "Practice Questions" },
  { value: 2363, suffix: "", label: "Telegram Members" },
];

function useCountUp(target: number, start: boolean, duration = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return n;
}

function Stat({
  value,
  suffix,
  label,
  start,
}: {
  value: number;
  suffix: string;
  label: string;
  start: boolean;
}) {
  const n = useCountUp(value, start);
  return (
    <div className="flex flex-col">
      <dd className="order-1 text-3xl font-extrabold tabular-nums text-white">
        {n.toLocaleString("en-IN")}
        {suffix}
      </dd>
      <dt className="order-2 mt-1 block text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </dt>
    </div>
  );
}

export default function HeroStats() {
  const ref = useRef<HTMLDListElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <dl
      ref={ref}
      className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-x-4 gap-y-6 sm:mt-10 sm:max-w-3xl sm:grid-cols-3 sm:gap-6 lg:grid-cols-6"
    >
      {STATS.map((s) => (
        <Stat key={s.label} {...s} start={visible} />
      ))}
    </dl>
  );
}
