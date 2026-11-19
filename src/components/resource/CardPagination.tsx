import Link from "next/link";

export type CardPageItem = number | "ellipsis";

/**
 * Windowed page list: every page when there are 10 or fewer; otherwise first and
 * last plus a short window around the current page, with ellipses in the gaps.
 */
export function cardPageItems(currentPage: number, totalPages: number, siblingCount = 2): CardPageItem[] {
  if (totalPages < 1) return [];
  const current = Math.min(Math.max(1, currentPage), totalPages);
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;
  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + 2 * siblingCount;
    return [...range(1, leftCount), "ellipsis", totalPages];
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + 2 * siblingCount;
    return [1, "ellipsis", ...range(totalPages - rightCount + 1, totalPages)];
  }
  return [1, "ellipsis", ...range(leftSibling, rightSibling), "ellipsis", totalPages];
}

/** Keep view/group/q/card (and any other params) and set or drop `page`. Page 1 omits the param. */
export function cardPageHref(resultsHref: string, page: number): string {
  const url = new URL(resultsHref, "https://resource.local");
  if (page <= 1) url.searchParams.delete("page");
  else url.searchParams.set("page", String(page));
  return url.pathname + url.search + url.hash;
}

export function CardPagination({
  currentPage,
  totalPages,
  resultsHref,
}: {
  currentPage: number;
  totalPages: number;
  resultsHref: string;
}) {
  if (totalPages <= 1) return null;
  const arrowClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c9773a] bg-transparent text-[#c9773a] no-underline transition hover:border-[#9d451d] hover:text-[#9d451d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c9773a]";
  const chevron = (direction: "previous" | "next") => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "previous" ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} />
    </svg>
  );
  return (
    <nav
      aria-label="Cards pages"
      className="mx-auto mt-4 grid w-full max-w-[720px] grid-cols-[36px_minmax(0,1fr)_36px] items-center gap-2 bg-transparent px-2 py-4 sm:gap-6 sm:px-5"
    >
      {currentPage > 1 ? (
        <Link href={cardPageHref(resultsHref, currentPage - 1)} scroll={false} aria-label="Previous page" rel="prev" className={arrowClass}>
          {chevron("previous")}
        </Link>
      ) : (
        <span aria-label="Previous page" aria-disabled="true" className={arrowClass + " pointer-events-none border-[#e8d9cd] text-[#e8d9cd]"}>
          {chevron("previous")}
        </span>
      )}
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-0.5 gap-y-1 bg-transparent sm:flex-nowrap">
        {cardPageItems(currentPage, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} aria-hidden="true" className="flex h-9 min-w-9 items-center justify-center bg-transparent px-1 text-sm text-[#806454]">
              …
            </span>
          ) : (
            <Link
              key={item}
              href={cardPageHref(resultsHref, item)}
              scroll={false}
              aria-label={"Page " + item}
              aria-current={item === currentPage ? "page" : undefined}
              className={
                "flex h-9 min-w-9 items-center justify-center bg-transparent px-1.5 text-sm no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9773a] " +
                (item === currentPage ? "font-semibold text-[#c9773a]" : "font-normal text-[#806454] hover:text-[#9d451d]")
              }
            >
              {item}
            </Link>
          ),
        )}
      </div>
      {currentPage < totalPages ? (
        <Link href={cardPageHref(resultsHref, currentPage + 1)} scroll={false} aria-label="Next page" rel="next" className={arrowClass}>
          {chevron("next")}
        </Link>
      ) : (
        <span aria-label="Next page" aria-disabled="true" className={arrowClass + " pointer-events-none border-[#e8d9cd] text-[#e8d9cd]"}>
          {chevron("next")}
        </span>
      )}
    </nav>
  );
}
