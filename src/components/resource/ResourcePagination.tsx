import Link from "next/link";

/** Ten-page groups keep every result reachable through the previous/next arrows. */
export function resourcePageNumbers(currentPage: number, totalPages: number): number[] {
  const start = Math.floor((currentPage - 1) / 10) * 10 + 1;
  return Array.from({ length: Math.min(10, totalPages - start + 1) }, (_, i) => start + i);
}

export function resourcePageHref(resultsHref: string, page: number): string {
  const url = new URL(resultsHref, "https://resource.local");
  url.searchParams.set("page", String(page));
  return url.pathname + url.search + url.hash;
}

export function ResourcePagination({ currentPage, totalPages, resultsHref }: {
  currentPage: number;
  totalPages: number;
  resultsHref: string;
}) {
  if (totalPages <= 1) return null;
  const arrowClass = "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] text-[#7b8188] no-underline transition hover:border-[#aeb5bb] hover:text-[#374151] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00a86b]";
  const chevron = (direction: "previous" | "next") => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "previous" ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} />
    </svg>
  );
  return (
    <nav aria-label="Resource results pages" className="mx-auto mt-6 grid w-full max-w-[720px] grid-cols-[36px_minmax(0,1fr)_36px] items-center gap-2 bg-white px-2 py-6 sm:gap-6 sm:px-5">
      {currentPage > 1 ? (
        <Link href={resourcePageHref(resultsHref, currentPage - 1)} aria-label="Previous page" rel="prev" className={arrowClass}>
          {chevron("previous")}
        </Link>
      ) : (
        <span aria-label="Previous page" aria-disabled="true" className={arrowClass + " pointer-events-none text-[#dce0e3]"}>
          {chevron("previous")}
        </span>
      )}
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-y-1 sm:flex-nowrap">
        {resourcePageNumbers(currentPage, totalPages).map((number) => (
          <Link key={number} href={resourcePageHref(resultsHref, number)} aria-label={"Page " + number} aria-current={number === currentPage ? "page" : undefined}
            className={"flex h-9 basis-1/5 items-center justify-center rounded text-sm no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00a86b] sm:basis-[10%] " + (number === currentPage ? "font-semibold text-[#00b878]" : "font-normal text-[#6b7280] hover:text-[#00a86b]")}>
            {number}
          </Link>
        ))}
      </div>
      {currentPage < totalPages ? (
        <Link href={resourcePageHref(resultsHref, currentPage + 1)} aria-label="Next page" rel="next" className={arrowClass}>
          {chevron("next")}
        </Link>
      ) : (
        <span aria-label="Next page" aria-disabled="true" className={arrowClass + " pointer-events-none text-[#dce0e3]"}>
          {chevron("next")}
        </span>
      )}
    </nav>
  );
}
