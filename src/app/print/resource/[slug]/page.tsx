import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import { PrintToolbar } from "@/components/gospel-sheet/PrintToolbar";
import { GOSPEL_SHEET_CSS, GOSPEL_SHEET_PAGE_CSS } from "@/components/gospel-sheet/sheet-styles";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { sheetOpenAllowed, resolveResourceViewer } from "@/lib/resource/resolve-access";
import { keyToSlug, resourcePath, slugToKey, yearLabel } from "@/lib/resource/sheets";
import { getSundaySheet, toGospelSheetView } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  const canOpen = sheetOpenAllowed(viewer, key);

  if (!canOpen) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-[#1c1c1c]">Print locked</h1>
        <p className="mt-3 text-sm text-[#4b5563]">
          Free accounts can print this Sunday&apos;s worksheet only. Plus unlocks the full library.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/subscribe"
            className="rounded-full bg-[#d35400] px-5 py-2.5 text-sm font-semibold text-white no-underline"
          >
            Unlock with Plus
          </Link>
          <Link
            href={viewer.thisSundayKey ? resourcePath(viewer.thisSundayKey, level) : "/resource"}
            className="rounded-full border border-[#e7e3de] px-5 py-2.5 text-sm font-medium text-[#1c1c1c] no-underline"
          >
            Back
          </Link>
        </div>
      </div>
    );
  }

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
