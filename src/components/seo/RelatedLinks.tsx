import Link from "next/link";

export type RelatedLink = { href: string; label: string; hint?: string };

/** "Keep exploring" block: plain crawlable links with natural anchor text. */
export function RelatedLinks({ heading = "Keep exploring", links }: { heading?: string; links: RelatedLink[] }) {
  if (links.length === 0) return null;
  return (
    <nav aria-label={heading} className="mt-10 rounded-2xl border border-[var(--color-border)] bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-[var(--color-ink)]">{heading}</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded-xl bg-[#fbf6f0] px-4 py-3 font-semibold text-[var(--color-link)] hover:underline"
            >
              {l.label} →
            </Link>
            {l.hint ? <p className="mt-1 px-1 text-sm text-[var(--color-muted)]">{l.hint}</p> : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
