"use client";

import { useSiteSession } from "@/components/SiteSessionProvider";
import type { HeaderSessionResponse } from "@/lib/header-session";
import { getSiteUrl } from "@/lib/site-url";
import { usePathname } from "next/navigation";

/**
 * Canonical page URL. The path drops any "?" or "#" part; an explicit `query` ("prayer=hail-mary")
 * and/or `hash` ("rosary") keep one view of the page (callers without them are unchanged).
 */
function canonicalPageUrl(pathname: string, query?: string, hash?: string): string {
  const pathOnly = pathname.split("?")[0]?.split("#")[0] || "/";
  const withSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  const trimmed = withSlash.length > 1 && withSlash.endsWith("/") ? withSlash.slice(0, -1) : withSlash;
  const q = (query ?? "").split("#")[0]!.replace(/^\?/, "");
  const h = (hash ?? "").replace(/^#/, "");
  return `${getSiteUrl()}${trimmed}${q ? `?${q}` : ""}${h ? `#${h}` : ""}`;
}

function isChildOrKidMode(session: HeaderSessionResponse): boolean {
  return session.family?.childMode === true || session.reader?.type === "sub";
}

function ClassroomIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3.5" y="4.5" width="17" height="11.5" rx="1.5" />
      <path d="M8 20.5h8M12 16v4.5" />
      <path d="M7 8.5h6M7 11.5h10" />
    </svg>
  );
}

/**
 * Teacher-facing share link for Google Classroom. Hidden in kid/child mode so a
 * handed-off browser never shows a classroom.google.com link. Hidden until the
 * site session is ready so the link does not flash first. `query` / `hash` keep one view of the page
 * in the shared link (for example "prayer=hail-mary" or hash "rosary" on /prayers).
 */
export function ShareToClassroomButton({
  className,
  query,
  hash,
}: {
  className?: string;
  query?: string;
  hash?: string;
}) {
  const { ready, session } = useSiteSession();
  const pathname = usePathname();

  if (!ready || isChildOrKidMode(session)) return null;

  const shareHref = `https://classroom.google.com/share?url=${encodeURIComponent(canonicalPageUrl(pathname, query, hash))}`;
  const classes = [
    "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#7f9a5a] bg-[#fdfaf7] px-3 py-1.5 text-sm font-semibold text-[#405329] no-underline hover:bg-[#edf0df] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400] print:hidden",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a href={shareHref} target="_blank" rel="noopener noreferrer" className={classes}>
      <ClassroomIcon />
      Share to Classroom
    </a>
  );
}
