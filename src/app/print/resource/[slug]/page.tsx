import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import { PrintToolbar } from "@/components/gospel-sheet/PrintToolbar";
import { GOSPEL_SHEET_CSS, GOSPEL_SHEET_PAGE_CSS } from "@/components/gospel-sheet/sheet-styles";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { sheetOpenAllowed, resolveResourceViewer } from "@/lib/resource/resolve-access";
import { keyToSlug, resourcePath, slugToKey, yearLabel } from "@/lib/resource/sheets";
import { getSundaySheet, toGospelSheetView } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Sunday Gospel sheet (print)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Print view of a Resource sheet — free: this Sunday only; Plus: any. */
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
  const canOpen = sheetOpenAllowed(viewer, key);

  // Locked (free viewer, not this Sunday): never render the sheet; send them to Plus.
  if (!canOpen) redirect("/subscribe");

  const view =
    viewer.thisSundayKey === key && viewer.thisSundayDate
      ? toGospelSheetView(sheet, viewer.thisSundayDate)
      : { ...toGospelSheetView(sheet), sundayLabel: yearLabel(key) };

  return (
    <div style={{ background: embed ? "#fff" : "#eee", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_PAGE_CSS + GOSPEL_SHEET_CSS }} />
      {embed ? null : (
        <PrintToolbar
          slug={keyToSlug(key)}
          level={level}
          gospelRef={sheet.gospelRef}
          usccbUrl=""
          autoPrint={autoPrint}
          basePath={`/print/resource/${keyToSlug(key)}`}
          backHref={resourcePath(key, level)}
        />
      )}
      <GospelSheet sheet={view} level={level} />
    </div>
  );
}
