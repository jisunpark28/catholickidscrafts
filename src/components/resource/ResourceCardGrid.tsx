import { GOSPEL_SHEET_CSS } from "@/components/gospel-sheet/sheet-styles";
import { resourcePath, resourcePrintPath } from "@/lib/resource/sheets";
import { toGospelSheetView, type SundaySheetContent } from "@/lib/sunday-sheet-content";
import Link from "next/link";
import { SheetThumb } from "./SheetThumb";

type Props = {
  sheets: SundaySheetContent[];
  level: 1 | 2;
  /** Plus members can open any card; free only thisSundayKey. */
  isPlus?: boolean;
  thisSundayKey?: string | null;
};

/** Search results: thumbnail + key code + Open / Print (matches resource mockup). */
export function ResourceCardGrid({
  sheets,
  level,
  isPlus = false,
  thisSundayKey = null,
}: Props) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_CSS }} />
      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {sheets.map((sheet) => {
          const title = level === 2 ? sheet.levels.level2.title : sheet.levels.level1.title;
          const view = toGospelSheetView(sheet);
          const canOpen = isPlus || (thisSundayKey != null && sheet.key === thisSundayKey);
          const openHref = canOpen ? resourcePath(sheet.key, level) : resourcePath(sheet.key, level);
          return (
            <li
              key={sheet.key}
              className="flex flex-col rounded-2xl border border-[#e7e3de] bg-white p-3 shadow-[0_1px_3px_rgba(28,28,28,0.04)]"
            >
              <Link href={openHref} className="block no-underline" tabIndex={-1}>
                <div className="relative">
                  <SheetThumb sheet={{ ...view, sundayLabel: sheet.key }} level={level} />
                  {!canOpen ? (
                    <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#1c1c1c]/45 text-sm font-semibold text-white">
                      🔒 Plus
                    </span>
                  ) : null}
                </div>
              </Link>
              <div className="mt-3 px-1 text-xs font-bold tracking-wide text-[#d35400]">{sheet.key}</div>
              <h3 className="mb-0.5 mt-0.5 px-1 text-base font-bold leading-snug text-[#1c1c1c]">
                <Link href={openHref} className="text-inherit no-underline hover:underline">
                  {title}
                </Link>
              </h3>
              <div className="px-1 text-sm text-[#6b7280]">{sheet.liturgicalName}</div>
              <div className="px-1 text-sm text-[#6b7280]">{sheet.gospelRef}</div>
              <div className="mt-auto flex gap-2 px-1 pb-1 pt-3">
                {canOpen ? (
                  <>
                    <Link
                      href={resourcePath(sheet.key, level)}
                      className="rounded-full bg-[#d35400] px-4 py-1.5 text-sm font-semibold text-white no-underline hover:bg-[#b8470a]"
                    >
                      Open
                    </Link>
                    <a
                      href={resourcePrintPath(sheet.key, level, true)}
                      target="_blank"
                      rel="noopener"
                      className="rounded-full border border-[#e7e3de] px-4 py-1.5 text-sm font-medium text-[#1c1c1c] no-underline hover:bg-[#fffdfb]"
                    >
                      🖨 Print
                    </a>
                  </>
                ) : (
                  <>
                    <Link
                      href={resourcePath(sheet.key, level)}
                      className="rounded-full border border-[#e7e3de] bg-[#f9f9f9] px-4 py-1.5 text-sm font-medium text-[#6b7280] no-underline hover:bg-white"
                      title="Preview locked — Plus opens the full sheet"
                    >
                      🔒 Details
                    </Link>
                    <Link
                      href="/subscribe"
                      className="rounded-full bg-[#d35400] px-4 py-1.5 text-sm font-semibold text-white no-underline hover:bg-[#b8470a]"
                    >
                      Plus
                    </Link>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
