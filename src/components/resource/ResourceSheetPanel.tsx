import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import { GOSPEL_SHEET_CSS } from "@/components/gospel-sheet/sheet-styles";
import { resourceEditPath } from "@/lib/resource/sheet-edit-path";
import { resourcePrintPath, yearLabel } from "@/lib/resource/sheets";
import { toGospelSheetView, type SundaySheetContent } from "@/lib/sunday-sheet-content";
import Link from "next/link";
import { SheetFit } from "./SheetFit";

type Props = {
  sheet: SundaySheetContent;
  level: 1 | 2;
  /** Sunday date (YYYY-MM-DD) when shown as "this Sunday"; otherwise the sheet is undated. */
  sundayDate?: string;
  /** Builds the href for the Level 1 / Level 2 toggle. Omit when the page already has one. */
  levelHref?: (level: 1 | 2) => string;
  /** Optional title row above the sheet (omit when the page header already names the sheet). */
  heading?: React.ReactNode;
  subheading?: React.ReactNode;
  headingLevel?: "h1" | "h2" | "h3";
  /** When false, Edit links to /subscribe instead of the Fabric editor. */
  isPlus?: boolean;
  /**
   * When false, Print/PDF go to subscribe (or thisSundayHref) instead of the print route.
   * Sheet preview + body text stay visible for SEO.
   */
  canPrint?: boolean;
  /** Optional fallback when print is locked (e.g. this Sunday’s sheet). */
  thisSundayHref?: string | null;
  /** Optional block between the title row and the sheet (e.g. this Sunday's picture card). */
  beforeSheet?: React.ReactNode;
};

/**
 * Print deterrent for sheets the viewer may not print (free account, not this Sunday).
 * Browser Ctrl+P is not blocked (by design); the printout shows a notice instead of the sheet.
 */
const PRINT_LOCK_CSS = `
.ckc-print-lock-msg{display:none}
@media print{
  .ckc-print-locked-sheet{display:none!important}
  .ckc-print-lock-msg{display:block!important;margin:1in auto;max-width:6.5in;padding:24px;border:2px solid #d35400;border-radius:12px;font:16px/1.5 system-ui,sans-serif;color:#1c1c1c;text-align:center}
}`;

const btn =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";

function ActionButtons({
  sheetKey,
  level,
  isPlus = false,
  canPrint = true,
  thisSundayHref = null,
}: {
  sheetKey: string;
  level: 1 | 2;
  isPlus?: boolean;
  canPrint?: boolean;
  thisSundayHref?: string | null;
}) {
  const printHref = resourcePrintPath(sheetKey, level, true);
  const lockedHref = "/subscribe";
  return (
    <>
      {canPrint ? (
        <a
          href={printHref}
          target="_blank"
          rel="noopener"
          className={`${btn} border-[#d35400] bg-[#d35400] font-semibold text-white hover:bg-[#b8470a]`}
        >
          🖨 Print
        </a>
      ) : (
        <Link
          href={lockedHref}
          className={`${btn} border-[#d35400] bg-[#d35400] font-semibold text-white hover:bg-[#b8470a]`}
          title="Print needs Plus (this Sunday is free)"
        >
          🖨 Print
          <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">PLUS</span>
        </Link>
      )}
      {canPrint ? (
        <a
          href={printHref}
          target="_blank"
          rel="noopener"
          className={`${btn} border-[#e7e3de] bg-white text-[#1c1c1c] hover:bg-[#fffdfb]`}
          title="Opens the print dialog: choose “Save as PDF”"
        >
          ⬇ PDF
        </a>
      ) : (
        <Link
          href={thisSundayHref || lockedHref}
          className={`${btn} border-[#e7e3de] bg-white text-[#1c1c1c] hover:bg-[#fffdfb]`}
          title="PDF export needs Plus, or print this Sunday free"
        >
          ⬇ PDF
          <span className="rounded-md bg-[#f5ebe0] px-1.5 py-0.5 text-[10px] font-bold text-[#d35400]">PLUS</span>
        </Link>
      )}
      <Link
        href={isPlus ? resourceEditPath(sheetKey, level) : "/subscribe"}
        className={`${btn} border-[#e7e3de] bg-[#f9f9f9] text-[#6b7280] hover:bg-white`}
        title={isPlus ? "Edit on the locked base sheet" : "Editing needs Plus"}
      >
        <span aria-hidden>🔒</span> Edit
        <span className="rounded-md bg-[#d35400] px-1.5 py-0.5 text-[10px] font-bold text-white">PLUS</span>
      </Link>
    </>
  );
}

/** Large on-screen sheet with Print / PDF / locked Edit (Plus) — desktop toolbar + mobile sticky bar. */
export function ResourceSheetPanel({
  sheet,
  level,
  sundayDate,
  levelHref,
  heading,
  subheading,
  headingLevel = "h2",
  isPlus = false,
  canPrint = true,
  thisSundayHref = null,
  beforeSheet = null,
}: Props) {
  const H = headingLevel;
  const actions = (
    <ActionButtons
      sheetKey={sheet.key}
      level={level}
      isPlus={isPlus}
      canPrint={canPrint}
      thisSundayHref={thisSundayHref}
    />
  );
  return (
    <section aria-label="Sunday sheet" className="pb-24 sm:pb-0">
      <div
        className={`mb-4 mt-5 flex flex-wrap items-end gap-3 ${heading ? "justify-between" : "justify-end"}`}
      >
        {heading ? (
          <div className="min-w-0">
            <H className="m-0 text-xl font-bold text-[#1c1c1c] sm:text-2xl">{heading}</H>
            {subheading ? <div className="mt-1 text-sm text-[#6b7280]">{subheading}</div> : null}
          </div>
        ) : null}
        <div className="hidden flex-wrap items-center gap-2 sm:flex">
          {levelHref ? (
            <div
              className="inline-flex overflow-hidden rounded-full border border-[#e7e3de] bg-white text-sm"
              role="group"
              aria-label="Level"
            >
              {([1, 2] as const).map((n) => (
                <Link
                  key={n}
                  href={levelHref(n)}
                  scroll={false}
                  aria-current={n === level ? "true" : undefined}
                  className={`px-3 py-2 font-medium no-underline ${n === level ? "bg-[#f5ebe0] font-semibold text-[#1c1c1c]" : "text-[#4b5563] hover:bg-[#fffdfb]"}`}
                >
                  Level {n}
                </Link>
              ))}
            </div>
          ) : null}
          {actions}
        </div>
      </div>
      {beforeSheet ? <div className="mb-5 print:hidden">{beforeSheet}</div> : null}
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_CSS + (canPrint ? "" : PRINT_LOCK_CSS) }} />
      <div className={canPrint ? undefined : "ckc-print-locked-sheet"}>
        <SheetFit>
          <GospelSheet
            sheet={
              sundayDate
                ? toGospelSheetView(sheet, sundayDate)
                : { ...toGospelSheetView(sheet), sundayLabel: yearLabel(sheet.key) }
            }
            level={level}
          />
        </SheetFit>
      </div>
      {canPrint ? null : (
        <div className="ckc-print-lock-msg" role="note">
          <p>
            <strong>Printing this sheet is a Plus feature — this Sunday&apos;s sheet is free.</strong>
          </p>
          <p>Print this Sunday&apos;s sheet or unlock the full library at catholickidscrafts.com/resource</p>
        </div>
      )}

      {/* Mobile mockup: sticky Print / PDF / Edit */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8e0d6] bg-white/95 p-3 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">{actions}</div>
      </div>
    </section>
  );
}
