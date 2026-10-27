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
  sheetDescription,
  sheetNeighbors,
  sheetSeason,
  sheetSeoH1,
  sheetSeoH2,
  sheetSeoTitle,
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
    title: sheetSeoTitle(sheet),
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
  const canPrint = sheetOpenAllowed(viewer, key);
  const season = sheetSeason(sheet);
  const seasonHref = seasonPath(season);
  const thisSundayHref = viewer.thisSundayKey
    ? resourcePath(viewer.thisSundayKey, level)
    : "/resource";
  const sundayDate =
    viewer.thisSundayKey === key && viewer.thisSundayDate ? viewer.thisSundayDate : undefined;
  const { prev, next } = sheetNeighbors(key);
  const prevSheet = prev ? getSundaySheet(prev) : null;
  const nextSheet = next ? getSundaySheet(next) : null;

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

      <header className="mt-4 max-w-3xl">
        <h1 className="m-0 text-2xl font-bold leading-tight text-[#1c1c1c] sm:text-3xl">
          {sheetSeoH1(sheet)}
        </h1>
        <h2 className="mt-2 text-lg font-semibold text-[#4b5563]">{sheetSeoH2(sheet)}</h2>
      </header>

      {!canPrint ? (
        <p className="mt-4 max-w-2xl rounded-xl border border-[#efe6da] bg-[#fdfaf7] px-4 py-3 text-sm text-[#4b5563]">
          Read the full Level 1 &amp; Level 2 text below.{" "}
          <strong className="text-[#1c1c1c]">Print and Edit</strong> need Plus (this Sunday stays
          free).{" "}
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
        headingLevel="h3"
        isPlus={viewer.isPlus}
        canPrint={canPrint}
        thisSundayHref={thisSundayHref}
        levelHref={(n) => (n === 2 ? `${path}?level=2` : path)}
        heading={`${level === 2 ? l2.title : l1.title}`}
        subheading={
          <>
            {sheet.liturgicalName} · {yearLabel(key)} · {seasonLabel(season)} · {sheet.gospelRef}
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
        {l1.activity?.title ? (
          <p>
            <strong>Activity:</strong> {l1.activity.title}
            {l1.activity.intro ? ` — ${l1.activity.intro}` : null}
          </p>
        ) : null}
        {l1.actions?.length ? (
          <>
            <p className="mb-1 font-semibold">Try this</p>
            <ul>
              {l1.actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </>
        ) : null}
        <p className="italic">{l1.prayer}</p>

        <h3 className="mt-5 text-base font-bold">Level 2: {l2.title}</h3>
        <p>{l2.story}</p>
        <p>
          <strong>Key line:</strong> {l2.keyLine}
        </p>
        {l2.activity?.title ? (
          <p>
            <strong>Activity:</strong> {l2.activity.title}
            {l2.activity.intro ? ` — ${l2.activity.intro}` : null}
          </p>
        ) : null}
        {l2.actions?.length ? (
          <>
            <p className="mb-1 font-semibold">Try this</p>
            <ul>
              {l2.actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </>
        ) : null}

        <h3 className="mt-5 text-base font-bold">Talk about it</h3>
        <ul>
          {[...l1.questions, ...l2.questions].map((qq) => (
            <li key={qq}>{qq}</li>
          ))}
        </ul>
        <h3 className="mt-5 text-base font-bold">Prayer</h3>
        <p className="italic">{l2.prayer || l1.prayer}</p>
      </article>

      {prevSheet || nextSheet ? (
        <nav
          aria-label="Adjacent Sunday sheets"
          className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 border-t border-[#efe6da] pt-6 text-sm sm:flex-row sm:justify-between"
        >
          {prevSheet ? (
            <Link
              href={resourcePath(prevSheet.key, level)}
              className="font-semibold text-[#335599] hover:underline"
            >
              ← Previous: {yearLabel(prevSheet.key)} {prevSheet.liturgicalName}
            </Link>
          ) : (
            <span />
          )}
          {nextSheet ? (
            <Link
              href={resourcePath(nextSheet.key, level)}
              className="font-semibold text-[#335599] hover:underline sm:text-right"
            >
              Next: {yearLabel(nextSheet.key)} {nextSheet.liturgicalName} →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </HomePdfShell>
  );
}
