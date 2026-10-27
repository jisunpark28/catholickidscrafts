import { HomePdfShell } from "@/components/home/HomePdfShell";
import { ResourceCardGrid } from "@/components/resource/ResourceCardGrid";
import { ResourceSearchBar } from "@/components/resource/ResourceSearchBar";
import { ResourceSheetPanel } from "@/components/resource/ResourceSheetPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { getResourceNav } from "@/lib/resource/nav";
import {
  parseSeason,
  parseYear,
  RESOURCE_SEASONS,
  resourcePath,
  searchSheets,
  seasonLabel,
  sheetSeason,
  yearLabel,
} from "@/lib/resource/sheets";
import { resolveResourceViewer } from "@/lib/resource/resolve-access";
import {
  COUNTRY_COOKIE,
  COUNTRY_LABELS,
  countryOptions,
  formatSundayDate,
  pickCountry,
  thisSunday,
} from "@/lib/resource/this-sunday";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode } from "@/lib/structured-data";
import { getSundaySheet } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import Link from "next/link";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const dynamic = "force-dynamic";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Boolean(one(sp.q) || one(sp.year) || one(sp.season) || one(sp.level) || one(sp.country));
  return pageMetadata({
    title: "Sunday Gospel Activity Sheets for Catholic Kids",
    description:
      "Free printable Sunday Gospel activity sheets for every Sunday and feast of Years A, B and C. Find this Sunday's sheet or search by Gospel, topic or season, then print Level 1 or Level 2.",
    path: "/resource",
    // Filtered and search views are duplicates of the main page and the per-sheet pages.
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
  });
}

export default async function ResourcePage({ searchParams }: Props) {
  const [sp, cookieStore, h, nav, viewer] = await Promise.all([
    searchParams,
    cookies(),
    headers(),
    getResourceNav(),
    resolveResourceViewer(),
  ]);
  const q = (one(sp.q) ?? "").slice(0, 80);
  const year = parseYear(one(sp.year));
  const season = parseSeason(one(sp.season));
  const level = parseLevelParam(sp.level);
  const country = pickCountry(one(sp.country), cookieStore.get(COUNTRY_COOKIE)?.value, h.get("x-vercel-ip-country"));
  const searching = Boolean(q.trim() || year || season);

  const sunday = searching ? null : thisSunday(country);
  const sheet = sunday ? getSundaySheet(sunday.key) : null;
  const results = searching ? searchSheets({ q, year, season }) : [];
  const thisSundayKey = viewer.thisSundayKey ?? sunday?.key ?? null;

  const keep = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const all = { country: one(sp.country), ...patch };
    for (const [k, v] of Object.entries(all)) if (v) p.set(k, v);
    const s = p.toString();
    return `/resource${s ? `?${s}` : ""}`;
  };

  const filterText = [q.trim() ? `“${q.trim()}”` : "", year ? `Year ${year}` : "", season ? seasonLabel(season) : ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <HomePdfShell groups={nav.groups} dailyMassLabel={nav.dailyMassLabel}>
      <JsonLd nodes={[breadcrumbNode([{ name: "Resource", path: "/resource" }])]} />
      <h1 className="sr-only">Sunday Gospel activity sheets</h1>
      <ResourceSearchBar
        state={{ q, year: year ?? "", season: season ?? "", country, level }}
        seasons={RESOURCE_SEASONS}
        countries={countryOptions()}
        countryCookie={COUNTRY_COOKIE}
        thisSundayActive={!searching}
      />

      {searching ? (
        <section aria-label="Search results" className="mt-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="m-0 text-xl font-bold text-[#1c1c1c]">
                {results.length} {results.length === 1 ? "sheet" : "sheets"}
                {filterText ? <> match {filterText}</> : null}
              </h2>
              <p className="mb-0 mt-1 text-sm text-[#6b7280]">
                Showing {results.length} · Level {level} · sorted by relevance
              </p>
            </div>
            <div
              className="inline-flex items-center rounded-full border border-[#e7e3de] bg-white px-3.5 py-2 text-sm font-medium text-[#1c1c1c]"
              title="More sort options coming soon"
            >
              Sort: Relevance
            </div>
          </div>
          {results.length ? (
            <ResourceCardGrid
              sheets={results}
              level={level}
              isPlus={viewer.isPlus}
              thisSundayKey={thisSundayKey}
            />
          ) : (
            <p className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-4 text-sm text-[#6b7280]">
              No sheets match. Try a Gospel name (e.g. “Luke”), a story (e.g. “lost sheep”) or{" "}
              <Link href={keep({})} className="text-[#d35400]">
                go back to this Sunday
              </Link>
              .
            </p>
          )}
        </section>
      ) : sunday && sheet ? (
        <ResourceSheetPanel
          sheet={sheet}
          level={level}
          sundayDate={sunday.date}
          isPlus={viewer.isPlus}
          heading={<>This Sunday · {formatSundayDate(sunday.date)}</>}
          subheading={
            <>
              {sheet.liturgicalName} · {yearLabel(sheet.key)} · {seasonLabel(sheetSeason(sheet))} ·{" "}
              {COUNTRY_LABELS[country] ?? country} ·{" "}
              <Link href={resourcePath(sheet.key, level)} className="text-[#335599]">
                Sheet page
              </Link>
            </>
          }
        />
      ) : (
        <p className="mt-5 rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-4 text-sm text-[#6b7280]">
          This Sunday&apos;s sheet is not available right now. Search above to find any sheet.
        </p>
      )}
    </HomePdfShell>
  );
}
