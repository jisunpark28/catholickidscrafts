import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import { PrintToolbar } from "@/components/gospel-sheet/PrintToolbar";
import { GOSPEL_SHEET_CSS, GOSPEL_SHEET_PAGE_CSS } from "@/components/gospel-sheet/sheet-styles";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { keyToSlug, resourcePath, slugToKey, yearLabel } from "@/lib/resource/sheets";
import { getSundaySheet, toGospelSheetView } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Sunday Gospel sheet (print)",
  robots: { index: false, follow: false },
};

/** Print view of a static Resource sheet (no DB). Canonical content lives on /resource/[slug]. */
export default async function ResourcePrintPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const key = slugToKey(slug);
  const sheet = key ? getSundaySheet(key) : null;
  if (!key || !sheet) notFound();
  const level = parseLevelParam(query.level);
  const view = { ...toGospelSheetView(sheet), sundayLabel: yearLabel(key) };

  return (
    <div style={{ background: "#eee", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_PAGE_CSS + GOSPEL_SHEET_CSS }} />
      <PrintToolbar
        slug={keyToSlug(key)}
        level={level}
        gospelRef={sheet.gospelRef}
        usccbUrl=""
        autoPrint={query.autoprint === "1"}
        basePath={`/print/resource/${keyToSlug(key)}`}
        backHref={resourcePath(key, level)}
      />
      <GospelSheet sheet={view} level={level} />
    </div>
  );
}
