import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import { PrintToolbar } from "@/components/gospel-sheet/PrintToolbar";
import { GOSPEL_SHEET_CSS, GOSPEL_SHEET_PAGE_CSS } from "@/components/gospel-sheet/sheet-styles";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import {
  evergreenDescription,
  evergreenSeoTitle,
  getEvergreenPageBySlug,
  getEvergreenSheet,
  hubPath,
  publicPath,
} from "@/lib/seo/evergreen-worksheets";
import { pageMetadata } from "@/lib/site-metadata";
import { toGospelSheetView } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getEvergreenPageBySlug(slug);
  const sheet = page ? getEvergreenSheet(page.key) : null;
  if (!page || !sheet) return { title: "Worksheet (print)", robots: { index: false, follow: false } };
  // Canonical points at the public SEO page; print URLs are not sitemap-listed.
  return pageMetadata({
    title: evergreenSeoTitle(page),
    absoluteTitle: true,
    description: evergreenDescription(page, sheet),
    path: publicPath(page),
    robots: { index: false, follow: true },
  });
}

const SEO_CHROME_CSS = `
.seo-print-chrome { max-width: 816px; margin: 0 auto; padding: 16px 20px 8px; font-family: Georgia, "Times New Roman", serif; color: #1f2937; background: #fff8f0; border-bottom: 1px solid #f0d9b8; }
.seo-print-chrome h1 { margin: 0 0 8px; font-size: 1.35rem; line-height: 1.3; }
.seo-print-chrome p { font-family: system-ui, -apple-system, Segoe UI, sans-serif; font-size: 0.95rem; line-height: 1.5; color: #374151; }
.seo-print-chrome a { color: #335599; font-weight: 600; }
@media print { .seo-print-chrome { display: none !important; } }
`;

/** Free print view of an evergreen worksheet (Mass order / Family Virtue Challenge). No Plus gate. */
export default async function EvergreenPrintPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const page = getEvergreenPageBySlug(slug);
  const sheet = page ? getEvergreenSheet(page.key) : null;
  if (!page || !sheet) notFound();
  const level = parseLevelParam(query.level);
  const embed = query.embed === "1";
  const autoPrint = query.autoprint === "1";
  // Never show the internal key (MASS_INTRO, VIR_GRATITUDE) as the date label.
  const view = { ...toGospelSheetView(sheet), slug: page.slug, sundayLabel: sheet.liturgicalName };

  return (
    <div style={{ background: embed ? "#fff" : "#eee", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_PAGE_CSS + GOSPEL_SHEET_CSS + SEO_CHROME_CSS }} />
      {embed ? null : (
        <>
          <PrintToolbar
            slug={page.slug}
            level={level}
            gospelRef={sheet.gospelRef}
            usccbUrl=""
            autoPrint={autoPrint}
            basePath={`/print/evergreen/${page.slug}`}
            backHref={publicPath(page)}
          />
          <aside className="seo-print-chrome" aria-label="About this worksheet">
            <h1>{evergreenSeoTitle(page)}</h1>
            <p>
              {page.kind === "virtue"
                ? "Take it home, hang it on the fridge, color a star each day Monday to Saturday, and ask a parent to sign at the end of the week. "
                : "Bring it to Mass and follow along. "}
              <Link href={publicPath(page)}>Worksheet guide</Link>
              {" · "}
              <Link href={hubPath(page.kind)}>All {page.kind === "virtue" ? "virtue challenges" : "Mass worksheets"}</Link>
            </p>
          </aside>
        </>
      )}
      <GospelSheet sheet={view} level={level} />
    </div>
  );
}
