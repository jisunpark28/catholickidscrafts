"use client";

import Link from "next/link";

export type PrintablesMode = "sundays" | "cards";

type Props = {
  mode: PrintablesMode;
  /** Preserve level / sheet / card deep-link params where useful. */
  sundaysHref?: string;
  cardsHref?: string;
};

/**
 * Equal-weight Sundays | Cards sibling toggles for Printables Option E.
 * Not a dropdown and not buried in the footer.
 */
export function PrintablesModeToggle({
  mode,
  sundaysHref = "/resource",
  cardsHref = "/resource?view=cards",
}: Props) {
  const base =
    "flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9773a]";
  return (
    <div
      role="group"
      aria-label="Printables mode"
      className="inline-flex w-full max-w-md overflow-hidden rounded-full border border-[#e8d9cd] bg-[#fffdfa] p-1"
    >
      <Link
        href={sundaysHref}
        aria-current={mode === "sundays" ? "page" : undefined}
        className={`${base} ${
          mode === "sundays"
            ? "bg-[#c9773a] text-white shadow-sm"
            : "text-[#493a30] hover:bg-[#fff2e8]"
        }`}
      >
        Sundays
      </Link>
      <Link
        href={cardsHref}
        aria-current={mode === "cards" ? "page" : undefined}
        className={`${base} ${
          mode === "cards"
            ? "bg-[#c9773a] text-white shadow-sm"
            : "text-[#493a30] hover:bg-[#fff2e8]"
        }`}
      >
        Cards
      </Link>
    </div>
  );
}
