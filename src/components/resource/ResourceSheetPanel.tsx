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
  heading: React.ReactNode;
  subheading: React.ReactNode;
  headingLevel?: "h1" | "h2";
  /** When false, Edit links to /subscribe instead of the Fabric editor. */
  isPlus?: boolean;
};

const btn =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";

function ActionButtons({
  sheetKey,
  level,
  isPlus = false,
}: {
  sheetKey: string;
  level: 1 | 2;
  isPlus?: boolean;
}) {
  const printHref = resourcePrintPath(sheetKey, level, true);
  return (
    <>
      <a
        href={printHref}
        target="_blank"
        rel="noopener"
        className={`${btn} border-[#d35400] bg-[#d35400] font-semibold text-white hover:bg-[#b8470a]`}
      >
        🖨 Print
      </a>
      <a
        href={printHref}
        target="_blank"
        rel="noopener"
        className={`${btn} border-[#e7e3de] bg-white text-[#1c1c1c] hover:bg-[#fffdfb]`}
        title="Opens the print dialog: choose “Save as PDF”"
      >
        ⬇ PDF
      </a>
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
}: Props) {
  const H = headingLevel;
  return (
    <section aria-label="Sunday sheet" className="pb-24 sm:pb-0">
      <div className="mb-4 mt-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <H className="m-0 text-xl font-bold text-[#1c1c1c] sm:text-2xl">{heading}</H>
          <div className="mt-1 text-sm text-[#6b7280]">{subheading}</div>
        </div>
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
          <ActionButtons sheetKey={sheet.key} level={level} isPlus={isPlus} />
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_CSS }} />
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

      {/* Mobile mockup: sticky Print / PDF / Edit */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8e0d6] bg-white/95 p-3 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
          <ActionButtons sheetKey={sheet.key} level={level} isPlus={isPlus} />
        </div>
      </div>
    </section>
  );
}
