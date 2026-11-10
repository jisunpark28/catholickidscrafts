import Link from "next/link";
/** Existing Gospel/book hubs remain one click away from the Mom's Bible entry reader. */
export function BibleExploreLinks() {
  return <nav aria-label="Explore the Bible" className="flex flex-wrap gap-2">
    {[["Today's Gospel", "/daily-mass"], ["Old Testament", "/bible/genesis"], ["New Testament", "/bible/matthew"], ["When my child is…", "/moms-bible/situations"]].map(([label, href]) =>
      <Link key={href} href={href} className="inline-flex min-h-11 items-center rounded-full border border-[#ded3ad] bg-[#fffbed] px-4 py-2 text-sm font-medium text-[#405329] no-underline hover:bg-[#edf0df] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#607537]">{label}</Link>)}
  </nav>;
}