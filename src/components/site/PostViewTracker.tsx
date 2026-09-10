"use client";

import { useEffect, useRef } from "react";
import { incrementPostViews } from "@/lib/actions/tracking";

export default function PostViewTracker({ slug }: { slug: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    incrementPostViews(slug).catch(() => {});
  }, [slug]);

  return null;
}
