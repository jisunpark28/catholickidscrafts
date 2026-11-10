"use client";

import { useEffect } from "react";

const SESSION_FLAG = "ckc_visit_sent";

/** Records one public visit per browser session (not used on /admin). */
export function VisitTracker() {
  useEffect(() => {
    let storage: Storage | null = null;
    try {
      storage = window.sessionStorage;
      if (storage.getItem(SESSION_FLAG)) return;
    } catch {
      storage = null;
    }

    void fetch("/api/analytics/visit", { method: "POST", keepalive: true }).catch(() => {});

    try {
      storage?.setItem(SESSION_FLAG, "1");
    } catch {
      // sessionStorage unavailable (privacy mode): counted once per page load instead.
    }
  }, []);

  return null;
}