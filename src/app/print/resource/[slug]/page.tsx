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
import { sheetConversationQuestions, sundayMassWorksheetPath } from "@/lib/seo/sunday-mass-worksheets";
import { pageMetadata } from "@/lib/site-metadata";
import { getSundaySheet, toGospelSheetView } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import Link from "next/link";
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

const SEO_CHROME_CSS = `
.seo-print-chrome {
  max-width: 816px;
  margin: 0 auto;
  padding: 16px 20px 8px;
  font-family: Georgia, "Times New Roman", serif;
  color: #1f2937;
  background: #fff8f0;
  border-bottom: 1px solid #f0d9b8;
}
.seo-print-chrome h1 {
  margin: 0 0 8px;
  font-size: 1.35rem;
  line-height: 1.3;
}
.seo-print-chrome h2 {
  margin: 14px 0 6px;
  font-size: 1.05rem;
}
.seo-print-chrome p, .seo-print-chrome li {
  font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #374151;
}
.seo-print-chrome ol { margin: 0; padding-left: 1.25rem; }
.seo-print-chrome a { color: #335599; font-weight: 600; }
@media print {
  .seo-print-chrome { display: none !important; }
}
`;

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
  const canOpen = sheetOpenAllowed(viewer, key);

  // Locked (free viewer, not this Sunday): never render the sheet; send them to Plus.
  if (!canOpen) redirect("/subscribe");

  const view =
    viewer.thisSundayKey === key && viewer.thisSundayDate
      ? toGospelSheetView(sheet, viewer.thisSundayDate)
      : { ...toGospelSheetView(sheet), sundayLabel: yearLabel(key) };

  const questions = sheetConversationQuestions(sheet);
  const seoPath = sundayMassWorksheetPath(key);

  return (
    <div style={{ background: embed ? "#fff" : "#eee", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_PAGE_CSS + GOSPEL_SHEET_CSS + SEO_CHROME_CSS }} />
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
          <aside className="seo-print-chrome" aria-label="About this Sunday worksheet">
            <h1>{sheet.liturgicalName} ({yearLabel(key)}) — Catholic kids Gospel worksheet</h1>
            <p>
              <strong>Gospel:</strong> {sheet.gospelRef}.{" "}
              <Link href={seoPath}>Full worksheet guide</Link>
              {" · "}
              <Link href="/bible-verses-for-kids">Bible verses for kids</Link>
              {" · "}
              <Link href="/moms-bible/situations">Mom&apos;s Bible</Link>
            </p>
            <h2>Gospel summary</h2>
            <p>{sheet.levels.level1.story}</p>
            <h2>Family talk</h2>
            <ol>
              {questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </aside>
        </>
      )}
      <GospelSheet sheet={view} level={level} />
    </div>
  );
}
