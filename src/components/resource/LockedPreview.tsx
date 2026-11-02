"use client";

import Link from "next/link";

type Props = {
  children: React.ReactNode;
  /** Extra classes on the outer wrapper (size, rounding). */
  className?: string;
  /** Where the overlay goes. Pass null when the preview already sits inside a link or button. */
  href?: string | null;
  /** Accessible name of the overlay link. */
  label?: string;
};

const block = (e: React.SyntheticEvent) => e.preventDefault();

/**
 * Plus-locked preview for free visitors: greyscale + faded, lock overlay that links to /subscribe,
 * no right-click / drag / select / copy, and hidden when the page is printed.
 * Deterrent only: the server never sends locked originals (cards use a small blurred preview, print routes redirect).
 */
export function LockedPreview({ children, className = "", href = "/subscribe", label = "Unlock with Plus" }: Props) {
  const pill = (
    <span className="rounded-full bg-[#1c1c1c]/80 px-3 py-1 text-xs font-bold text-white shadow-sm">
      <span aria-hidden>🔒</span> Plus
    </span>
  );
  const overlayCls =
    "absolute inset-0 flex items-center justify-center bg-white/35 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";
  return (
    <span
      data-plus-locked
      className={`relative block cursor-pointer select-none overflow-hidden print:hidden ${className}`}
      style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
      onContextMenu={block}
      onDragStart={block}
      onCopy={block}
      onCut={block}
    >
      <span aria-hidden className="pointer-events-none block opacity-60 grayscale">
        {children}
      </span>
      {href ? (
        <Link href={href} aria-label={label} title={label} className={overlayCls} draggable={false}>
          {pill}
        </Link>
      ) : (
        <span className={overlayCls}>{pill}</span>
      )}
    </span>
  );
}
