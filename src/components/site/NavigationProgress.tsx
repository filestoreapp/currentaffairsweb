"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Slim top progress bar that appears the moment a visitor taps an
 * internal link and completes when the new page lands. Purely
 * perceived-performance: it makes every navigation feel instant and
 * responsive instead of "frozen".
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const timers = useRef<number[]>([]);

  // Start the bar on any internal link tap.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="/"]'
      );
      if (!anchor || anchor.target === "_blank") return;
      // Same-page hash jumps don't navigate.
      const url = new URL(anchor.href);
      if (url.pathname === window.location.pathname && url.hash) return;
      setActive(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Crawl forward while waiting; bail out after 6s no matter what.
  useEffect(() => {
    if (!active) return;
    setWidth(12);
    timers.current = [
      window.setTimeout(() => setWidth(55), 250),
      window.setTimeout(() => setWidth(80), 1000),
      window.setTimeout(() => setWidth(92), 2500),
      window.setTimeout(() => setActive(false), 6000),
    ];
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [active]);

  // Finish when the route actually changes.
  useEffect(() => {
    if (!active) return;
    setWidth(100);
    const t = window.setTimeout(() => {
      setActive(false);
      setWidth(0);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  if (!active && width === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
    >
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-[width] duration-300 ease-out"
        style={{ width: `${active ? width : 100}%` }}
      />
    </div>
  );
}
