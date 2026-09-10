"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logPageView } from "@/lib/actions/tracking";

export default function ViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    logPageView(pathname).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
