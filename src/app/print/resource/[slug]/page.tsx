import { GospelPrintIntro, GOSPEL_PRINT_INTRO_CSS } from "@/components/gospel-sheet/GospelPrintIntro";
import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import { PrintToolbar } from "@/components/gospel-sheet/PrintToolbar";
import { GOSPEL_SHEET_CSS, GOSPEL_SHEET_PAGE_CSS } from "@/components/gospel-sheet/sheet-styles";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { sheetOpenAllowed, resolveResourceViewer } from "@/lib/resource/resolve-access";
import {
  keyToSlug,
  resourcePath,
  sheetDescription,
  sheetSeoTitle,
  slugToKey,
  yearLabel,
} from "@/lib/resource/sheets";
import { sundayMassWorksheetPath } from "@/lib/seo/sunday-mass-worksheets";
import { pageMetadata } from "@/lib/site-metadata";
import { pathWithQuery } from "@/lib/sign-in-callback";
import { isSignedInForEmbed, requireSignInForPage, SIGNED_OUT_PRINT_CSS } from "@/lib/sign-in-gate";
import { getSundaySheet, toGospelSheetView } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const key = slugToKey(slug);
  const sheet = key ? getSundaySheet(key) : null;
  if (!sheet || !key) {
    return { title: "Sunday Gospel sheet (print)", robots: { index: false, follow: false } };
  }
  // Canonical consolidates ranking on the SEO worksheet page; print URL is not sitemap-listed.
  return pageMetadata({
    title: sheetSeoTitle(sheet),
    absoluteTitle: true,
    description: sheetDescription(sheet),
    path: sundayMassWorksheetPath(key),
  });
}

/** Print view of a Resource sheet — free: this Sunday only; Plus: any. Screen shows SEO chrome; print hides it. */
export default async function ResourcePrintPage({ params, searchParams }: Props) {
  const [{ slug }, query, viewer] = await Promise.all([
    params,
    searchParams,
    resolveResourceViewer(),
  ]);
  const key = slugToKey(slug);
  const sheet = key ? getSundaySheet(key) : null;
  if (!key || !sheet) notFound();
  const level = parseLevelParam(query.level);
  const embed = query.embed === "1";
  const autoPrint = query.autoprint === "1";
  // Printing needs a family sign-in (free). The home page preview (embed) still renders signed out,
  // but prints a sign-in notice instead of the sheet.
  const signedIn = embed
    ? await isSignedInForEmbed()
    : Boolean(await requireSignInForPage(pathWithQuery(`/print/resource/${slug}`, query)));
  const canOpen = sheetOpenAllowed(viewer, key);

  // Locked (free viewer, not this Sunday): never render the sheet; send them to Plus.
  if (!canOpen) redirect("/subscribe");

  const view =
    viewer.thisSundayKey === key && viewer.thisSundayDate
      ? toGospelSheetView(sheet, viewer.thisSundayDate)
      : { ...toGospelSheetView(sheet), sundayLabel: yearLabel(key) };

  return (
    <div style={{ background: embed ? "#fff" : "#eee", minHeight: "100vh" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: GOSPEL_SHEET_PAGE_CSS + GOSPEL_SHEET_CSS + GOSPEL_PRINT_INTRO_CSS + (signedIn ? "" : SIGNED_OUT_PRINT_CSS),
        }}
      />
      {embed ? null : (
        <>
          <PrintToolbar
            slug={keyToSlug(key)}
            level={level}
            gospelRef={sheet.gospelRef}
            usccbUrl=""
            autoPrint={autoPrint}
            basePath={`/print/resource/${keyToSlug(key)}`}
            backHref={resourcePath(key, level)}
          />
          <GospelPrintIntro
            liturgicalName={sheet.liturgicalName}
            gospelRef={sheet.gospelRef}
            summary={sheet.levels.level1.story}
            guideHref={sundayMassWorksheetPath(key)}
          />
        </>
      )}
      <GospelSheet sheet={view} level={level} />
    </div>
  );
}
