import Image from "next/image";
import type { SidebarIcon } from "@/lib/sidebar-navigation";

/** Hand-drawn pastel pictures for the sidebar buttons (public/images/sidebar). */
const SIDEBAR_PICTURES: Partial<Record<SidebarIcon, string>> = {
  printables: "/images/sidebar/printables.png",
  mass: "/images/sidebar/daily-mass.png",
  play: "/images/sidebar/play.png",
  bible: "/images/sidebar/moms-bible.png",
  questions: "/images/sidebar/qa-cards.png",
  prayer: "/images/sidebar/prayer.png",
};

export function SidebarIllustration({ kind, className = "" }: { kind: SidebarIcon; className?: string }) {
  const picture = SIDEBAR_PICTURES[kind];
  if (picture) {
    return (
      <Image
        src={picture}
        alt=""
        aria-hidden="true"
        width={56}
        height={56}
        unoptimized
        draggable={false}
        className={`object-contain ${className}`}
        data-sidebar-illustration={kind}
      />
    );
  }
  /** My Binder keeps its paper-and-ink drawing (no picture in the reference). */
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" data-sidebar-illustration={kind}>
      <path d="M17 12q-4 0-4 4v49q0 4 4 4l23-.5q15-2 28 .5V16q0-4-4-4-12-3-24 .5-12-3-23-.5Z" fill="currentColor" fillOpacity=".06" />
      <path d="M22 12v57m18-55v54M13 23H8v34h5M45 19q8-2 16-.5M46 62l15 .5" strokeWidth="1.4" />
      <path d="M34 25q-2-4 2-4h8q4 0 3 4-1 3-4 3h-4m-5 12q-2-4 2-4h8q4 0 3 4-1 3-4 3h-4m-5 12q-2-4 2-4h8q4 0 3 4-1 3-4 3h-4" />
      <path d="M17 17v45m47-43v44" strokeWidth=".8" opacity=".4" />
    </svg>
  );
}
