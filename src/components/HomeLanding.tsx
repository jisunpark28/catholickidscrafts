"use client";

import { useCopy } from "@/components/SiteCopyProvider";
import { PageShell } from "@/components/PageShell";
import { getTptStoreUrl } from "@/lib/tpt";
import Link from "next/link";

const sectionKeys = [
  { href: "/mass", title: "home.section.mass.title", desc: "home.section.mass.desc" },
  { href: "/resources", title: "home.section.resources.title", desc: "home.section.resources.desc" },
  { href: "/curriculum", title: "home.section.curriculum.title", desc: "home.section.curriculum.desc" },
  {
    href: "/recommendations",
    title: "home.section.recommendations.title",
    desc: "home.section.recommendations.desc",
  },
  { href: "/play", title: "home.section.play.title", desc: "home.section.play.desc" },
] as const;

export function HomeLanding() {
  const c = useCopy;
  const tptStore = getTptStoreUrl();

  return (
    <PageShell wide>
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
          {c("home.hero.eyebrow", "")}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
          {c("home.hero.title", "")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">{c("home.hero.lead", "")}</p>
        <p className="mt-3 max-w-2xl text-sm text-[var(--color-muted)]">{c("home.hero.sub", "")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/mass"
            className="bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)]"
          >
            {c("home.cta.mass", "Plan from today's Mass")}
          </Link>
          <Link
            href="/resources"
            className="border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
          >
            {c("home.cta.resources", "Find an activity")}
          </Link>
          {tptStore ? (
            <a
              href={tptStore}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
            >
              {c("home.cta.tpt", "Printable packs (TPT) ↗")}
            </a>
          ) : (
            <span className="border border-dashed border-[var(--color-border)] px-6 py-3 text-sm text-[var(--color-muted)]">
              {c("home.cta.tpt_soon", "TPT store link coming soon")}
            </span>
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sectionKeys.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="border border-[var(--color-border)] bg-white p-6 transition hover:border-[var(--color-accent)]"
          >
            <h2 className="text-lg font-bold text-[var(--color-ink)]">{c(s.title, "")}</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{c(s.desc, "")}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[var(--color-link)]">
              {c("home.card.open", "Open →")}
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-[var(--color-muted)]">
        <Link href="/about" className="font-semibold text-[var(--color-link)]">
          {c("home.footer.why", "Why we built this")}
        </Link>
        {" · "}
        <Link href="/affiliate-disclosure" className="font-semibold text-[var(--color-link)]">
          {c("home.footer.affiliate", "Affiliate disclosure")}
        </Link>
      </p>
    </PageShell>
  );
}
