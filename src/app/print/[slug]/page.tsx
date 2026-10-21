import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import { PrintToolbar } from "@/components/gospel-sheet/PrintToolbar";
import { GOSPEL_SHEET_CSS, GOSPEL_SHEET_PAGE_CSS } from "@/components/gospel-sheet/sheet-styles";
import { isAdmin } from "@/lib/admin-auth";
import { loadSheetBySlug, parseLevelParam } from "@/lib/gospel-sheet";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sunday Gospel sheet",
  robots: { index: false, follow: false },
};

export default async function PrintSheetPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const level = parseLevelParam(query.level);
  let sheet = await loadSheetBySlug(slug);
  if (!sheet) {
    // Drafts: admins only (DB-verified).
    if (await isAdmin()) sheet = await loadSheetBySlug(slug, true);
  }
  if (!sheet) notFound();

  const embed = query.embed === "1";
  const autoPrint = query.autoprint === "1";

  return (
    <div style={{ background: embed ? "#fff" : "#eee", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_PAGE_CSS + GOSPEL_SHEET_CSS }} />
      {embed ? null : (
        <PrintToolbar
          slug={sheet.slug}
          level={level}
          gospelRef={sheet.gospelRef}
          usccbUrl={sheet.usccbUrl}
          autoPrint={autoPrint}
        />
      )}
      <GospelSheet sheet={sheet} level={level} />
    </div>
  );
}
