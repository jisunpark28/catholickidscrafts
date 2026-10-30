import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import { GOSPEL_SHEET_CSS, GOSPEL_SHEET_PAGE_CSS } from "@/components/gospel-sheet/sheet-styles";
import { BundlePrintToolbar } from "@/components/resource/BundlePrintToolbar";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { hasCardOriginal } from "@/lib/resource/card-originals";
import { cardDownloadPath, cardsForSunday, cardThumbSrc } from "@/lib/resource/cards";
import { featuredCardFor } from "@/lib/resource/featured-card";
import { resolveResourceViewer } from "@/lib/resource/resolve-access";
import { slugToKey, yearLabel } from "@/lib/resource/sheets";
import { getSundaySheet, toGospelSheetView } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Sunday bundle (print)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const BUNDLE_CSS = `
.bundle-page{break-before:page;page-break-before:always}
.bundle-card{display:flex;justify-content:center;padding-top:.25in}
.bundle-card img{width:6.4in;height:8in;object-fit:contain;border:1px solid #eee;border-radius:8px}
@media screen{.bundle-sheet,.bundle-card{margin:16px auto;background:#fff}}
`;

/** Plus-only print view: this sheet + its picture card. "Save as PDF" makes the bundle PDF. */
export default async function ResourceBundlePrintPage({ params, searchParams }: Props) {
  const [{ slug }, query, viewer] = await Promise.all([params, searchParams, resolveResourceViewer()]);
  const key = slugToKey(slug);
  const sheet = key ? getSundaySheet(key) : null;
  if (!key || !sheet) notFound();
  const level = parseLevelParam(query.level);
  const autoPrint = query.autoprint === "1";

  const isThisSunday = viewer.thisSundayKey === key && viewer.thisSundayDate;
  // This Sunday's bundle is free for everyone; other Sundays' bundles stay Plus.
  if (!viewer.isPlus && !isThisSunday) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-[#1c1c1c]">Plus feature</h1>
        <p className="mt-3 text-sm text-[#4b5563]">
          Bundles for other Sundays are part of Plus. This Sunday&apos;s bundle is free to print.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/subscribe"
            className="rounded-full bg-[#d35400] px-5 py-2.5 text-sm font-semibold text-white no-underline"
          >
            Unlock with Plus
          </Link>
          <Link
            href="/resource"
            className="rounded-full border border-[#e7e3de] px-5 py-2.5 text-sm font-medium text-[#1c1c1c] no-underline"
          >
            Back
          </Link>
        </div>
      </div>
    );
  }

  const view = isThisSunday
    ? toGospelSheetView(sheet, viewer.thisSundayDate!)
    : { ...toGospelSheetView(sheet), sundayLabel: yearLabel(key) };
  // This Sunday: the same card the page features today (free via the download API). Other Sundays: their card.
  const card = isThisSunday ? (featuredCardFor(viewer.country)?.card ?? null) : cardsForSunday(key).primary;
  const backHref = level === 2 ? "/resource?level=2" : "/resource";
  // Before the originals are uploaded, fall back to the public preview so the bundle still prints.
  const cardSrc = card
    ? (await hasCardOriginal(card.id))
      ? `${cardDownloadPath(card.id)}?inline=1`
      : cardThumbSrc(card.id)
    : null;

  return (
    <div style={{ background: "#eee", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_PAGE_CSS + GOSPEL_SHEET_CSS + BUNDLE_CSS }} />
      <BundlePrintToolbar
        autoPrint={autoPrint}
        backHref={backHref}
        title="Sunday bundle: sheet + card"
      />

      <div className="bundle-sheet">
        <GospelSheet sheet={view} level={level} />
      </div>

      {card && cardSrc ? (
        <div className="bundle-card bundle-page">
          {/* Full-size card through the Plus-checked API (no public original URL). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-bundle-img src={cardSrc} alt={`${card.title} picture card`} />
        </div>
      ) : null}
    </div>
  );
}
