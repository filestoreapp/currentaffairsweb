"use client";

import { useEffect, useRef, useState } from "react";

// Marketing stats shown on the homepage hero. Edit the numbers here —
const STATS = [
  { value: 50, suffix: "+", label: "Mock Tests" },
  { value: 120, suffix: "+", label: "PYQ Papers" },
  { value: 200, suffix: "+", label: "Practice Quizzes" },
  { value: 500, suffix: "+", label: "Study Notes" },
  { value: 10000, suffix: "+", label: "Practice Questions" },
  { value: 25000, suffix: "+", label: "Happy Aspirants" },
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
