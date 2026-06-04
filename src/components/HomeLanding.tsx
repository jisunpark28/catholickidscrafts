import { PageShell } from "@/components/PageShell";
import { getTptStoreUrl } from "@/lib/tpt";
import Link from "next/link";

const sections = [
  {
    href: "/mass",
    title: "Daily Mass",
    description:
      "See what the Church is celebrating today—then open official readings for Canada or the U.S.",
  },
  {
    href: "/resources",
    title: "Kids Resources",
    description:
      "Crafts and simple lesson ideas by season. Pick Advent, Lent, or Ordinary Time and go.",
  },
  {
    href: "/curriculum",
    title: "Curriculum",
    description:
      "Age-based lesson paths when you want a whole year sketched out—not just one Sunday.",
  },
  {
    href: "/recommendations",
    title: "Recommendations",
    description:
      "Books, videos, and supplies we like—handy when you are building a cart or wish list.",
  },
  {
    href: "/play",
    title: "Play & Learn",
    description:
      "Quick games for church vocabulary, today’s readings, and a little fun—no login.",
  },
];

export function HomeLanding() {
  const tptStore = getTptStoreUrl();

  return (
    <PageShell wide>
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
          For parish &amp; family programs
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
          Help for children&apos;s ministry—without starting from scratch every week
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
          Catholic Kids Crafts is here for catechists, volunteers, and parents in Canada and the
          United States. Plan with the Church calendar, grab a ready activity, and open a game when
          you need something that works in the room.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-[var(--color-muted)]">
          Free planning tools on this site; fuller printable packs on Teachers Pay Teachers when
          you need them.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/mass"
            className="bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)]"
          >
            Plan from today&apos;s Mass
          </Link>
          <Link
            href="/resources"
            className="border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
          >
            Find an activity
          </Link>
          {tptStore ? (
            <a
              href={tptStore}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
            >
              Printable packs (TPT) ↗
            </a>
          ) : (
            <span className="border border-dashed border-[var(--color-border)] px-6 py-3 text-sm text-[var(--color-muted)]">
              TPT store link coming soon
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
          Why we built this
        </Link>
        {" · "}
        <Link href="/affiliate-disclosure" className="font-semibold text-[var(--color-link)]">
          Affiliate disclosure
        </Link>
      </p>
    </PageShell>
  );
}
