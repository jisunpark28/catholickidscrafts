import { HomePdfShell } from "@/components/home/HomePdfShell";
import { ResourceLockedPanel } from "@/components/resource/ResourceLockedPanel";
import { ResourceSheetPanel } from "@/components/resource/ResourceSheetPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { getResourceNav } from "@/lib/resource/nav";
import { sheetOpenAllowed, resolveResourceViewer } from "@/lib/resource/resolve-access";
import {
  keyToSlug,
  resourcePath,
  seasonLabel,
  sheetDescription,
  sheetSeason,
  slugToKey,
  yearLabel,
} from "@/lib/resource/sheets";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode, worksheetNode } from "@/lib/structured-data";
import { getSundaySheet, listSundaySheetKeys } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return listSundaySheetKeys().map((key) => ({ slug: keyToSlug(key) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const key = slugToKey(slug);
  const sheet = key ? getSundaySheet(key) : null;
  if (!sheet) return {};
  return pageMetadata({
    title: `${sheet.levels.level1.title}: ${sheet.liturgicalName}, ${yearLabel(sheet.key)}`,
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
  const l1 = sheet.levels.level1;
  const l2 = sheet.levels.level2;
  const path = resourcePath(key);
  const canOpen = sheetOpenAllowed(viewer, key);
  const thisSundayHref = viewer.thisSundayKey
    ? resourcePath(viewer.thisSundayKey, level)
    : "/resource";

  return (
    <HomePdfShell groups={nav.groups} dailyMassLabel={nav.dailyMassLabel}>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Resource", path: "/resource" },
            { name: `${sheet.liturgicalName} (${yearLabel(key)})`, path },
          ]),
          worksheetNode({
            name: `${l1.title}: ${sheet.liturgicalName}`,
            gospelRef: sheet.gospelRef,
            description: sheetDescription(sheet),
            pagePath: path,
            isAccessibleForFree: canOpen && !viewer.isPlus,
          }),
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
        <Link href="/resource" className="text-[#335599]">
          Resource
        </Link>{" "}
        › {sheet.liturgicalName}
      </nav>

      {!canOpen ? (
        <ResourceLockedPanel
          liturgicalName={sheet.liturgicalName}
          gospelRef={sheet.gospelRef}
          yearLabel={yearLabel(key)}
          thisSundayHref={thisSundayHref}
        />
      ) : (
        <>
          <ResourceSheetPanel
            sheet={sheet}
            level={level}
            headingLevel="h1"
            isPlus={viewer.isPlus}
            levelHref={(n) => (n === 2 ? `${path}?level=2` : path)}
            heading={`${level === 2 ? l2.title : l1.title}`}
            subheading={
              <>
                {sheet.liturgicalName} · {yearLabel(key)} · {seasonLabel(sheetSeason(sheet))} ·{" "}
                {sheet.gospelRef}
              </>
            }
          />

          <article className="mx-auto mt-8 max-w-3xl text-[15px] leading-relaxed text-[#1c1c1c]">
            <h2 className="text-lg font-bold">About this Sunday&apos;s Gospel</h2>
            <p className="text-[#4b5563]">
              {sheet.liturgicalName} · {yearLabel(key)} · Gospel: {sheet.gospelRef}
            </p>
            <blockquote className="my-3 border-l-[3px] border-[#d35400] pl-4 italic text-[#4b5563]">
              {sheet.keyVerseDR}
            </blockquote>
            <h3 className="mt-5 text-base font-bold">Level 1: {l1.title}</h3>
            <p>{l1.story}</p>
            <p>
              <strong>Key line:</strong> {l1.keyLine}
            </p>
            <h3 className="mt-5 text-base font-bold">Level 2: {l2.title}</h3>
            <p>{l2.story}</p>
            <h3 className="mt-5 text-base font-bold">Talk about it</h3>
            <ul>
              {[...l1.questions, ...l2.questions].map((qq) => (
                <li key={qq}>{qq}</li>
              ))}
            </ul>
            <h3 className="mt-5 text-base font-bold">Prayer</h3>
            <p className="italic">{l2.prayer || l1.prayer}</p>
          </article>
        </>
      )}
    </HomePdfShell>
  );
}
