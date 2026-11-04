"use client";

import { useSiteCopy } from "@/components/SiteCopyProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** localStorage flag only (no personal data). */
const DISMISS_KEY = "ckc.kidLoginNoticeDismissed";
/** Pages where children sign in and where parents manage children. */
const NOTICE_PATHS = ["/reader/login", "/kids", "/account"];

/**
 * Pre-announcement of the Kid Code + PIN sign-in (Mom's Bible PR-1b). Hidden unless the
 * SiteCopy key `notice.kid_login_change.enabled` is "on" (Admin → Site copy → Notices & banners).
 * Dismissible per device.
 */
export function KidLoginNoticeBanner() {
  const copy = useSiteCopy();
  const pathname = usePathname() ?? "";
  const [visible, setVisible] = useState(false);

  const enabled = (copy["notice.kid_login_change.enabled"] ?? "").trim().toLowerCase() === "on";
  const text = (copy["notice.kid_login_change.text"] ?? "").trim();
  const linkLabel = (copy["notice.kid_login_change.link"] ?? "").trim();
  const onPath = NOTICE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (!enabled || !onPath || !text) {
      setVisible(false);
      return;
    }
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* storage blocked: show the notice */
    }
    setVisible(!dismissed);
  }, [enabled, onPath, text]);

  if (!visible) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div
      role="status"
      className="flex items-start justify-center gap-3 border-b border-[#bcd7f5] bg-[#eef6ff] px-4 py-2 text-sm text-[var(--color-ink)]"
    >
      <p className="text-center">
        <span className="font-semibold">{text}</span>
        {linkLabel && !pathname.startsWith("/account") ? (
          <>
            {" "}
            <Link href="/account" className="font-bold text-[var(--color-link)] underline">
              {linkLabel}
            </Link>
          </>
        ) : null}
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notice"
        className="shrink-0 px-1 text-base leading-none text-[var(--color-muted)] hover:text-[var(--color-ink)]"
      >
        ×
      </button>
    </div>
  );
}
