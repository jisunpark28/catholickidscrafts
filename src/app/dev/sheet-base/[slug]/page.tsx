import { SheetBaseCaptureHost } from "@/components/resource/SheetBaseCaptureHost";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { sheetBaseRev } from "@/lib/resource/sheet-base";
import { slugToKey, yearLabel } from "@/lib/resource/sheets";
import { getSundaySheet, toGospelSheetView } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Sheet base capture (dev)",
  robots: { index: false, follow: false },
};

/** Dev-only host for Playwright: /dev/sheet-base/a-ot30?level=1 */
export default async function SheetBaseCapturePage({ params, searchParams }: Props) {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SHEET_BASE_CAPTURE !== "1") {
    notFound();
  }
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const key = slugToKey(slug);
  const content = key ? getSundaySheet(key) : null;
  if (!key || !content) notFound();
  const level = parseLevelParam(sp.level);
  const view = { ...toGospelSheetView(content), sundayLabel: yearLabel(key) };
  const rev = sheetBaseRev(content, level);

  return <SheetBaseCaptureHost sheet={view} level={level} rev={rev} sheetKey={key} />;
}
