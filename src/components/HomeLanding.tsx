import { PageShell } from "@/components/PageShell";
import { getTptStoreUrl } from "@/lib/tpt";
import Link from "next/link";

const sections = [
  {
    href: "/mass",
    title: "Daily Mass",
    description:
      "Today's readings and a liturgical calendar in English (U.S. Roman calendar).",
  },
  {
    href: "/resources",
    title: "Kids Resources",
    description:
      "Crafts and lesson ideas by season—Advent, Lent, Easter, and Ordinary Time.",
  },
  {
    href: "/curriculum",
    title: "Curriculum",
    description: "Age-based paths for families and classrooms.",
  },
  {
    href: "/recommendations",
    title: "Recommendations",
    description: "Books, videos, and supplies we trust for Catholic kids.",
  },
  {
    href: "/play",
    title: "Play & Learn",
    description: "Church explorer, gospel typing, hangman, and emoji photo fun.",
  },
];

export function HomeLanding() {
  const tptStore = getTptStoreUrl();

  return (
    <PageShell wide>
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
          Catholic Kids Crafts
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
          Daily Mass, liturgical-season activities, and resources for Catholic kids
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
          Plan Sunday school and family catechesis with the Church calendar. Free previews on this
          site; full printable packs on Teachers Pay Teachers.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/mass"
            className="bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)]"
          >
            Today&apos;s Mass
          </Link>
          <Link
            href="/resources"
            className="border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
          >
            Browse kids resources
          </Link>
          {tptStore ? (
            <a
              href={tptStore}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
            >
              Teachers Pay Teachers store ↗
            </a>
          ) : (
            <span className="border border-dashed border-[var(--color-border)] px-6 py-3 text-sm text-[var(--color-muted)]">
              TPT store link coming September 2026
            </span>
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="border border-[var(--color-border)] bg-white p-6 transition hover:border-[var(--color-accent)]"
          >
            <h2 className="text-lg font-bold text-[var(--color-ink)]">{s.title}</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{s.description}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[var(--color-link)]">
              Open →
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-[var(--color-muted)]">
        <Link href="/about" className="font-semibold text-[var(--color-link)]">
          About
        </Link>
        {" · "}
        <Link href="/affiliate-disclosure" className="font-semibold text-[var(--color-link)]">
          Affiliate disclosure
        </Link>
      </p>
    </PageShell>
  );
}
