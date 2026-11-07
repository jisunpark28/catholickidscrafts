import type { HomePdfGroup } from "@/lib/home-pdf-nav";
import Link from "next/link";

/** Categories formerly expanded in the sidebar remain reachable in the existing faith hub. */
export function FaithNavigationDirectory({ groups }: { groups: HomePdfGroup[] }) {
  return <section id="faith-prayer" aria-labelledby="faith-prayer-title" className="my-8 scroll-mt-28 rounded-2xl border border-[#ded3ad] bg-[#fffbed] p-5 sm:p-6">
    <h2 id="faith-prayer-title" className="text-2xl font-bold text-[#405329]">Faith &amp; Prayer</h2>
    <p className="mt-2 text-sm text-[#655f4d]">Explore prayers, our Catholic faith, and the seasons of the Church year.</p>
    <div className="mt-5 grid gap-6 sm:grid-cols-2">
      {groups.filter((group) => group.id === "faith" || group.id === "liturgical-year").map((group) => <div key={group.id}>
        <h3 className="font-bold text-[#405329]">{group.title}</h3>
        <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">{group.items.map((item) => <li key={item.id}>
          <Link href={item.href} className="inline-flex min-h-11 items-center rounded-full border border-[#ded3ad] bg-white px-4 py-2 text-sm text-[#405329] no-underline hover:bg-[#edf0df] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#607537]">{item.label}</Link>
        </li>)}</ul>
      </div>)}
    </div>
  </section>;
}