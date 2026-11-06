import { getEvergreenPage, getEvergreenPageBySlug, evergreenSeoTitle, evergreenDescription, publicPath } from "@/lib/seo/evergreen-worksheets";
import { HomePdfShell } from "@/components/home/HomePdfShell";
import { ResourceSheetPanel } from "@/components/resource/ResourceSheetPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { getResourceNav } from "@/lib/resource/nav";
import { sheetOpenAllowed, resolveResourceViewer } from "@/lib/resource/resolve-access";
import {
  keyToSlug,
  resourcePath,
  resolveResourceSheet,
  seasonLabel,
  seasonPath,
  sheetAbstract,
  sheetDescription,
  sheetSeason,
  sheetSeoH1,
  sheetSeoH2,
  sheetSeoTitle,
  slugToKey,
  yearLabel,
} from "@/lib/resource/sheets";
import { sundayMassWorksheetPath } from "@/lib/seo/sunday-mass-worksheets";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode, worksheetNode } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Per-viewer print gate (session + country cookie/IP) — rendered on demand.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sheet = resolveResourceSheet(slug);
  const evergreen = sheet ? getEvergreenPage(sheet.key) : null;
  if (sheet && evergreen) return pageMetadata({ title: evergreenSeoTitle(evergreen), description: evergreenDescription(evergreen, sheet), path: publicPath(evergreen) });
  if (!sheet) return {};
  // Canonical SEO parent is the Sunday Mass worksheet page (avoid competing duplicates).
  return pageMetadata({
    title: sheetSeoTitle(sheet),
    absoluteTitle: true,
    description: sheetDescription(sheet),
    path: sundayMassWorksheetPath(sheet.key),
  });
}

export default async function ResourceSheetPage({ params, searchParams }: Props) {
  const [{ slug }, sp, nav, viewer] = await Promise.all([
    params,
    searchParams,
    getResourceNav(),
    resolveResourceViewer(),
  ]);
  const key = slugToKey(slug);
  const sheet = resolveResourceSheet(slug);
  if (!sheet) notFound();
  const evergreen = !key ? getEvergreenPageBySlug(slug) : null;
  if (evergreen) {
    const level = parseLevelParam(sp.level);
    const path = resourcePath(sheet.key);
    const collection = evergreen.kind === "mass" ? "Mass for Kids" : "Virtue Challenge";
    return (
      <HomePdfShell groups={nav.groups} dailyMassLabel={nav.dailyMassLabel}>
        <JsonLd nodes={[breadcrumbNode([
          { name: "Resource", path: "/resource" },
          { name: collection, path: "/resource?view=all" },
          { name: evergreen.name, path },
        ])]} />
        <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
          <Link href="/resource">Resource</Link>{" > "}
          <Link href="/resource?view=all">{collection}</Link>{" > "}{evergreen.name}
        </nav>
        <header className="mt-4">
          <h1 className="text-2xl font-bold">{evergreenSeoTitle(evergreen)}</h1>
          <p className="text-sm text-[#6b7280]">Plus unlocks previews and printing. This Sunday&apos;s sheet is free. Two learning levels.</p>
        </header>
        <ResourceSheetPanel sheet={sheet} level={level} isPlus={viewer.isPlus} canPrint={sheetOpenAllowed(viewer, sheet.key)}
          levelHref={(n) => resourcePath(sheet.key, n)} />
      </HomePdfShell>
    );
  }
  if (!key) notFound();
  if (slug !== keyToSlug(key)) permanentRedirect(resourcePath(key));
  const level = parseLevelParam(sp.level);
  const path = resourcePath(key);
  const canPrint = sheetOpenAllowed(viewer, key);
  const season = sheetSeason(sheet);
  const seasonHref = seasonPath(season);
  const thisSundayHref = viewer.thisSundayKey
    ? resourcePath(viewer.thisSundayKey, level)
    : "/resource";
  const sundayDate =
    viewer.thisSundayKey === key && viewer.thisSundayDate ? viewer.thisSundayDate : undefined;

  return (
    <HomePdfShell groups={nav.groups} dailyMassLabel={nav.dailyMassLabel}>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Resource", path: "/resource" },
            { name: seasonLabel(season), path: seasonHref },
            { name: `${sheet.liturgicalName} (${yearLabel(key)})`, path },
          ]),
          worksheetNode({
            name: sheetSeoTitle(sheet),
            gospelRef: sheet.gospelRef,
            description: sheetDescription(sheet),
            abstract: sheetAbstract(sheet),
            keyVerse: sheet.keyVerseDR,
            pagePath: sundayMassWorksheetPath(key),
            isAccessibleForFree: true,
          }),
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
        <Link href="/resource" className="text-[#335599]">
          Resource
        </Link>{" "}
        ›{" "}
        <Link href={seasonHref} className="text-[#335599]">
          {seasonLabel(season)}
        </Link>{" "}
        › {sheet.liturgicalName}
      </nav>

      <header className="mt-4 min-w-0">
        <h1 className="m-0 break-words text-2xl font-bold leading-tight text-[#1c1c1c] sm:text-3xl">
          {sheetSeoH1(sheet)}
        </h1>
        <h2 className="mt-2 text-lg font-semibold text-[#4b5563]">{sheetSeoH2(sheet)}</h2>
      </header>


      <ResourceSheetPanel
        sheet={sheet}
        level={level}
        sundayDate={sundayDate}
        isPlus={viewer.isPlus}
        canPrint={canPrint}
        thisSundayHref={thisSundayHref}
        levelHref={(n) => (n === 2 ? `${path}?level=2` : path)}
      />
    </HomePdfShell>
  );
}
