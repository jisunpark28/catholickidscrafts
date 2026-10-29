import { HomePdfShell } from "@/components/home/HomePdfShell";
import { ResourceSheetPanel } from "@/components/resource/ResourceSheetPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { getResourceNav } from "@/lib/resource/nav";
import { sheetOpenAllowed, resolveResourceViewer } from "@/lib/resource/resolve-access";
import {
  keyToSlug,
  resourcePath,
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
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode, worksheetNode } from "@/lib/structured-data";
import { getSundaySheet } from "@/lib/sunday-sheet-content";
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
  const key = slugToKey(slug);
  const sheet = key ? getSundaySheet(key) : null;
  if (!sheet) return {};
  return pageMetadata({
    title: sheetSeoTitle(sheet),
    absoluteTitle: true,
    description: sheetDescription(sheet),
    path: resourcePath(sheet.key),
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
  const sheet = key ? getSundaySheet(key) : null;
  if (!key || !sheet) notFound();
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
            pagePath: path,
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

      {!canPrint ? (
        <p className="mt-4 max-w-2xl rounded-xl border border-[#efe6da] bg-[#fdfaf7] px-4 py-3 text-sm text-[#4b5563]">
          Preview the sheet below. <strong className="text-[#1c1c1c]">Print and Edit</strong> need
          Plus (this Sunday stays free).{" "}
          <Link href="/subscribe" className="font-semibold text-[#d35400] hover:underline">
            Unlock with Plus
          </Link>
          {viewer.thisSundayKey ? (
            <>
              {" · "}
              <Link href={thisSundayHref} className="font-semibold text-[#335599] hover:underline">
                This Sunday&apos;s sheet
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

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
