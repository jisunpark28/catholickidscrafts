"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Records a public page view (not used on /admin). */
export function VisitTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    void fetch("/api/analytics/visit", { method: "POST", keepalive: true });
  }, [pathname]);

  return null;
}
