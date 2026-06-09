import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { ResourceCard } from "@/components/ResourceCard";
import { ResourcesToolbar } from "@/components/ResourcesToolbar";
import {
  getAllResources,
  getResourcesByPeriod,
  searchPublishedResources,
} from "@/lib/content";
import {
  getLiturgicalPeriodWithCopy,
  getLiturgicalPeriodsWithCopy,
  parseLiturgicalPeriodParam,
} from "@/lib/content-types";
import { parseResourceSortParam } from "@/lib/resource-sort";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kids Resources",
  description: "Catholic kids crafts and lesson plans by liturgical season.",
  ...canonicalForPath("/resources"),
};

type Props = {
  searchParams: Promise<{ q?: string; period?: string; sort?: string }>;
};

export default async function ResourcesPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q;
  const period = parseLiturgicalPeriodParam(params.period);
  const sort = parseResourceSortParam(params.sort);
  const hasFilter = Boolean(q?.trim() || period);
  const copy = await getSiteCopyMap();
  const periods = getLiturgicalPeriodsWithCopy(copy);

  if (hasFilter) {
    const results = await searchPublishedResources({ q, period, sort });
    const periodLabel = period ? getLiturgicalPeriodWithCopy(period, copy).title : null;

    return (
      <PageShell wide>
        <PageHeader
          title={copyText(copy, "resources.page.title", "Kids Resources")}
          subtitle={copyText(copy, "resources.page.subtitle", "")}
          programNote={copyText(copy, "resources.page.program_note", "")}
        />

        <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Loading search…</p>}>
          <ResourcesToolbar />
        </Suspense>

        <p className="text-sm text-[var(--color-muted)]">
          {results.length} {results.length === 1 ? "resource" : "resources"}
          {q ? ` matching “${q}”` : ""}
          {periodLabel ? ` in ${periodLabel}` : ""}
        </p>

        {results.length > 0 ? (
          <div className="mt-6 border border-[var(--color-border)]">
            {results.map((post) => (
              <ResourceCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="mt-10 border border-[var(--color-border)] bg-white p-8 text-center text-[var(--color-muted)]">
            No resources found. Try another word or season.
          </p>
        )}
      </PageShell>
    );
  }

  const all = await getAllResources(sort);

  const periodCounts = await Promise.all(
    periods.map(async (p) => ({
      period: p,
      count: (await getResourcesByPeriod(p.id, sort)).length,
    })),
  );

  const periodPosts = await Promise.all(
    periods.map(async (p) => ({
      period: p,
      posts: await getResourcesByPeriod(p.id, sort),
    })),
  );

  return (
    <PageShell wide>
      <PageHeader
        title={copyText(copy, "resources.page.title", "Kids Resources")}
        subtitle={copyText(copy, "resources.page.subtitle", "")}
        programNote={copyText(copy, "resources.page.program_note", "")}
      />

      <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Loading search…</p>}>
        <ResourcesToolbar />
      </Suspense>

      <nav className="mb-12 flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-6">
        {periodCounts.map(({ period: p, count }) => (
          <a
            key={p.id}
            href={`#${p.id}`}
            className="border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            {p.title}
            {count > 0 && (
              <span className="ml-2 text-[var(--color-muted)]">({count})</span>
            )}
          </a>
        ))}
      </nav>

      <div className="space-y-16">
        {periodPosts.map(({ period: p, posts }) => {
          return (
            <section key={p.id} id={p.id} className="scroll-mt-24">
              <div className="border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 sm:px-8">
                <h2 className="text-2xl font-bold text-[var(--color-ink)]">{p.title}</h2>
                <p className="mt-2 max-w-3xl text-[var(--color-muted)]">{p.description}</p>
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
