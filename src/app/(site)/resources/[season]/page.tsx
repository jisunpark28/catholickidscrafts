import { HomePdfShell } from "@/components/home/HomePdfShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getResourceNav } from "@/lib/resource/nav";
import {
  parseSeason,
  RESOURCE_SEASONS,
  RESOURCE_YEARS,
  resourcePath,
  searchSheets,
  seasonLabel,
  seasonPath,
  seasonSeoDescription,
  seasonSeoTitle,
  sheetYear,
  type ResourceSeason,
  type ResourceYear,
} from "@/lib/resource/sheets";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode } from "@/lib/structured-data";
import type { SundaySheetContent } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ season: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return RESOURCE_SEASONS.map((s) => ({ season: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { season: raw } = await params;
  const season = parseSeason(raw);
  if (!season) return {};
  const sheets = searchSheets({ season });
  return pageMetadata({
    title: seasonSeoTitle(season),
    description: seasonSeoDescription(season, sheets.length),
    path: seasonPath(season),
  });
}

function groupByYear(sheets: SundaySheetContent[]): {
  year: ResourceYear | null;
  label: string;
  sheets: SundaySheetContent[];
}[] {
  const buckets = new Map<string, SundaySheetContent[]>();
  for (const sheet of sheets) {
    const y = sheetYear(sheet.key);
    const k = y ?? "shared";
    const list = buckets.get(k) ?? [];
    list.push(sheet);
    buckets.set(k, list);
  }
  const order: Array<ResourceYear | "shared"> = [...RESOURCE_YEARS, "shared"];
  return order
    .filter((k) => buckets.has(k))
    .map((k) => {
      const list = buckets.get(k)!;
      return {
        year: k === "shared" ? null : k,
        label: k === "shared" ? "Every year" : `Year ${k}`,
        sheets: list,
      };
    });
}

export default async function ResourcesSeasonPage({ params }: Props) {
  const { season: raw } = await params;
  const season = parseSeason(raw);
  if (!season) notFound();

  const [nav, sheets] = await Promise.all([getResourceNav(), Promise.resolve(searchSheets({ season }))]);
  const groups = groupByYear(sheets);
  const path = seasonPath(season);
  const title = seasonSeoTitle(season);

  return (
    <HomePdfShell groups={nav.groups} dailyMassLabel={nav.dailyMassLabel}>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Printables", path: "/resources" },
            { name: seasonLabel(season), path },
          ]),
        ]}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
        <Link href="/resources" className="text-[#335599] hover:underline">
          Printables
        </Link>{" "}
        › {seasonLabel(season)}
      </nav>

      <SeasonTabs active={season} />

      <h1 className="mt-4 text-3xl font-bold text-[#1c1c1c]">{title}</h1>
      <p className="mt-2 max-w-2xl text-[#6b7280]">
        {seasonSeoDescription(season, sheets.length)} Browse every sheet below — full Level 1 and Level
        2 text is free to read. Print this Sunday free; Plus unlocks Print and Edit for the whole
        library.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/resource" className="font-semibold text-[#335599] hover:underline">
          Open the Resource library
        </Link>
        {" · "}
        <Link href="/resource?view=all" className="font-semibold text-[#335599] hover:underline">
          Search all sheets
        </Link>
      </p>

      {groups.map((g) => (
        <section key={g.label} className="mt-8">
          <h2 className="text-xl font-bold text-[#1c1c1c]">{g.label}</h2>
          <ul className="mt-3 list-none divide-y divide-[#efe6da] rounded-2xl border border-[#efe6da] bg-white p-0">
            {g.sheets.map((sheet) => (
              <li key={sheet.key}>
                <Link
                  href={resourcePath(sheet.key)}
                  className="flex flex-col gap-0.5 px-4 py-3 no-underline hover:bg-[#fffdfb] sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <span className="font-semibold text-[#1c1c1c]">{sheet.liturgicalName}</span>
                  <span className="text-sm text-[#6b7280]">
                    {sheet.gospelRef} · {sheet.levels.level1.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </HomePdfShell>
  );
}

function SeasonTabs({ active }: { active: ResourceSeason }) {
  return (
    <nav
      aria-label="Liturgical seasons"
      className="mt-4 flex flex-wrap gap-2 border-b border-[#efe6da] pb-3"
    >
      {RESOURCE_SEASONS.map((s) => {
        const on = s.id === active;
        return (
          <Link
            key={s.id}
            href={seasonPath(s.id)}
            aria-current={on ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold no-underline ${
              on
                ? "bg-[#1c1c1c] text-white"
                : "border border-[#e7e3de] bg-white text-[#1c1c1c] hover:bg-[#fffdfb]"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
