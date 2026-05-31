import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { ResourceCard } from "@/components/ResourceCard";
import {
  getAllResources,
  getLiturgicalPeriod,
  getResourcesByPeriod,
  LITURGICAL_PERIODS,
} from "@/lib/content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kids Resources",
  description: "Catholic kids crafts and lesson plans by liturgical season.",
};

export default async function ResourcesPage() {
  const all = await getAllResources();

  const periodCounts = await Promise.all(
    LITURGICAL_PERIODS.map(async (period) => ({
      period,
      count: (await getResourcesByPeriod(period.id)).length,
    })),
  );

  const periodPosts = await Promise.all(
    LITURGICAL_PERIODS.map(async (period) => ({
      period,
      posts: await getResourcesByPeriod(period.id),
    })),
  );

  return (
    <PageShell wide>
      <PageHeader
        title="Kids Resources"
        subtitle="Crafts, worksheets, and lesson plans grouped by liturgical season—so you can plan Advent, Lent, Easter, and Ordinary Time with your class."
      />

      <nav className="mb-12 flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-6">
        {periodCounts.map(({ period, count }) => (
          <a
            key={period.id}
            href={`#${period.id}`}
            className="border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            {period.title}
            {count > 0 && (
              <span className="ml-2 text-[var(--color-muted)]">({count})</span>
            )}
          </a>
        ))}
      </nav>

      <div className="space-y-16">
        {periodPosts.map(({ period, posts }) => {
          const meta = getLiturgicalPeriod(period.id);

          return (
            <section key={period.id} id={period.id} className="scroll-mt-24">
              <div className="border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 sm:px-8">
                <h2 className="text-2xl font-bold text-[var(--color-ink)]">{meta.title}</h2>
                <p className="mt-2 max-w-3xl text-[var(--color-muted)]">{meta.description}</p>
              </div>

              {posts.length > 0 ? (
                <div className="border border-t-0 border-[var(--color-border)]">
                  {posts.map((post) => (
                    <ResourceCard key={post.slug} post={post} />
                  ))}
                </div>
              ) : (
                <p className="border border-t-0 border-[var(--color-border)] bg-white px-6 py-8 text-sm text-[var(--color-muted)]">
                  No resources in this season yet. Check back soon.
                </p>
              )}
            </section>
          );
        })}
      </div>

      {all.length === 0 && (
        <p className="text-[var(--color-muted)]">No resources published yet.</p>
      )}
    </PageShell>
  );
}
