import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { ResourceCard, ResourceCardGrid } from "@/components/ResourceCard";
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

function joinSeasonTitles(titles: string[]): string {
  if (titles.length <= 1) return titles[0] ?? "";
  if (titles.length === 2) return `${titles[0]} and ${titles[1]}`;
  return `${titles.slice(0, -1).join(", ")}, and ${titles[titles.length - 1]}`;
}

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
        <PageHeader title={copyText(copy, "resources.page.title", "Kids Resources")} />

        <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Loading search…</p>}>
          <ResourcesToolbar />
        </Suspense>

        <p className="text-sm text-[var(--color-muted)]">
          {results.length} {results.length === 1 ? "resource" : "resources"}
          {q ? ` matching “${q}”` : ""}
          {periodLabel ? ` in ${periodLabel}` : ""}
        </p>

        {results.length > 0 ? (
          <ResourceCardGrid>
            {results.map((post) => (
              <ResourceCard key={post.slug} post={post} />
            ))}
          </ResourceCardGrid>
        ) : (
          <p className="mt-10 border border-[var(--color-border)] bg-white p-8 text-center text-[var(--color-muted)]">
            No resources found. Try another word or season.
          </p>
        )}
      </PageShell>
    );
  }

  const all = await getAllResources(sort);

  const periodPosts = await Promise.all(
    periods.map(async (p) => ({
      period: p,
      posts: await getResourcesByPeriod(p.id, sort),
    })),
  );
  const filledPeriods = periodPosts.filter(({ posts }) => posts.length > 0);
  const emptySeasonTitles = periodPosts
    .filter(({ posts }) => posts.length === 0)
    .map(({ period: p }) => p.title);

  const emptySeasonsNote =
    all.length === 0
      ? ""
      : emptySeasonTitles.length === 1
        ? copyText(copy, "resources.empty.one_season", "No {season} resources are published yet.").replace(
            "{season}",
            emptySeasonTitles[0],
          )
        : emptySeasonTitles.length > 1
          ? copyText(
              copy,
              "resources.empty.many_seasons",
              "No published resources yet for {seasons}.",
            ).replace("{seasons}", joinSeasonTitles(emptySeasonTitles))
          : "";

  return (
    <PageShell wide>
      <PageHeader title={copyText(copy, "resources.page.title", "Kids Resources")} />

      <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Loading search…</p>}>
        <ResourcesToolbar />
      </Suspense>

      {filledPeriods.length > 0 ? (
        <nav className="mb-10 flex flex-wrap gap-2">
          {filledPeriods.map(({ period: p, posts }) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className="rounded-full bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent)] hover:text-white"
            >
              {p.title}
              <span className="ml-2 text-[var(--color-muted)]">({posts.length})</span>
            </a>
          ))}
        </nav>
      ) : null}

      <div className="space-y-16">
        {filledPeriods.map(({ period: p, posts }) => (
          <section key={p.id} id={p.id} className="scroll-mt-24 space-y-6">
            <div className="rounded-2xl bg-[var(--color-surface)] px-6 py-5 sm:px-8">
              <h2 className="text-2xl font-bold text-[var(--color-ink)]">{p.title}</h2>
              <p className="mt-2 max-w-3xl text-[var(--color-muted)]">{p.description}</p>
            </div>

            <ResourceCardGrid>
              {posts.map((post) => (
                <ResourceCard key={post.slug} post={post} />
              ))}
            </ResourceCardGrid>
          </section>
        ))}
      </div>

      {emptySeasonsNote ? (
        <p className="mt-12 text-sm text-[var(--color-muted)]">{emptySeasonsNote}</p>
      ) : null}

      {all.length === 0 && (
        <p className="text-[var(--color-muted)]">No resources published yet.</p>
      )}
    </PageShell>
  );
}
