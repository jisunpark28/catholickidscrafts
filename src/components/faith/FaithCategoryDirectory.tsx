import { LITURGY_TOPIC_LABELS, LITURGY_TOPICS } from "@/lib/liturgy-topics";
import Link from "next/link";

/** Faith & Prayer plus the six liturgical seasons — the existing category routes. */
export const FAITH_CATEGORY_LINKS: readonly { href: string; label: string }[] = [
  { href: "/prayers", label: "Prayers" },
  ...LITURGY_TOPICS.map((slug) => ({ href: `/liturgy/${slug}`, label: LITURGY_TOPIC_LABELS[slug] })),
];

export function FaithCategoryDirectory() {
  return (
    <details className="mt-8 rounded-2xl border border-[#ded3ad] bg-[#fffbed] p-4">
      <summary className="cursor-pointer font-semibold text-[#405329]">
        Browse Faith &amp; Prayer and Church seasons
      </summary>
      <nav id="faith-prayer" aria-label="Faith and Church seasons" className="mt-4">
        <ul className="grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {FAITH_CATEGORY_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-full border border-[#e7d7c3] bg-white px-3 py-2 text-sm font-semibold text-[#405329] no-underline hover:border-[#c9773a]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
