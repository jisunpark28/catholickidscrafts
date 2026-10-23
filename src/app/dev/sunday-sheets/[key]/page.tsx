import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import { GOSPEL_SHEET_CSS, GOSPEL_SHEET_PAGE_CSS } from "@/components/gospel-sheet/sheet-styles";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { toSheetKey } from "@/lib/sheet-keys";
import { getSundaySheet, toGospelSheetView } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ key: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sunday sheet preview (dev)",
  robots: { index: false, follow: false },
};

/** Dev-only mockup of static sheet content, with labelled illustration placeholders. */
export default async function DevSundaySheetPage({ params, searchParams }: Props) {
  if (process.env.NODE_ENV === "production") notFound();
  const [{ key }, query] = await Promise.all([params, searchParams]);
  const sheet = getSundaySheet(key);
  if (!sheet) notFound();
  const level = parseLevelParam(query.level);
  const rawDate = Array.isArray(query.date) ? query.date[0] : query.date;
  const date = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : undefined;
  let mapped: string | null = null;
  try {
    mapped = date ? toSheetKey(date, "canada") : null;
  } catch {
    mapped = null;
  }
  const mismatch = date && mapped !== key;

  return (
    <div style={{ background: "#eee", minHeight: "100vh", paddingTop: 1 }}>
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_PAGE_CSS + GOSPEL_SHEET_CSS }} />
      {mismatch ? (
        <p className="gs-screen-only" style={{ textAlign: "center", color: "#a00", margin: 8 }}>
          {date} maps to {mapped ?? "no Sunday"} in Canada, not {key}.
        </p>
      ) : null}
      <GospelSheet sheet={toGospelSheetView(sheet, date)} level={level} art={sheet.art} />
    </div>
  );
}
