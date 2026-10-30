import { GOSPEL_SHEET_CSS } from "@/components/gospel-sheet/sheet-styles";
import { cardSharePath } from "@/lib/resource/card-meta";
import { resourcePath, resourcePrintPath, yearLabel } from "@/lib/resource/sheets";
import type { SearchHit } from "@/lib/resource/unified-search";
import { toGospelSheetView } from "@/lib/sunday-sheet-content";
import Link from "next/link";
import { CardTile } from "./CardTile";
import { PlusLockButton } from "./PlusLockDialog";
import { SheetThumb } from "./SheetThumb";

type Props = {
  q: string;
  hits: SearchHit[];
  level: 1 | 2;
  isPlus: boolean;
  thisSundayKey: string | null;
  /** Where "Clear search" goes (the tab the search started from). */
  clearHref: string;
  siteUrl: string;
  /** Today's featured card (free for everyone). */
  freeCardId?: string | null;
  limit?: number;
};

const typeBadge = (label: string, tone: "sheet" | "card") => (
  <span
    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
      tone === "sheet" ? "bg-[#e8f0fb] text-[#335599]" : "bg-[#fdeee2] text-[#b8470a]"
    }`}
  >
    {label}
  </span>
);

/** One ranked results grid for a search from any tab: Weekly Sheets and Cards together. */
export function UnifiedSearchResults({ q, hits, level, isPlus, thisSundayKey, clearHref, siteUrl, freeCardId = null, limit = 48 }: Props) {
  const shown = hits.slice(0, limit);
  return (
    <section aria-label="Search results" className="mt-5">
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_CSS }} />
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-lg font-bold text-[#1c1c1c]">
          Results for “{q}”
        </h2>
        <Link href={clearHref} className="text-sm font-semibold text-[#d35400] no-underline hover:underline">
          ✕ Clear search
        </Link>
      </div>

      {hits.length ? (
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 xl:grid-cols-4">
          {shown.map((h) => {
            if (h.type === "card") {
              const c = h.card;
              return (
                <li key={`c-${c.id}`}>
                  <CardTile
                    card={c}
                    isPlus={isPlus}
                    isFree={c.id === freeCardId}
                    level={level}
                    siteUrl={siteUrl}
                    openHref={cardSharePath(c.id)}
                    typeBadge={typeBadge("Card", "card")}
                  />
                </li>
              );
            }
            const s = h.sheet;
            const lv = level === 2 ? s.levels.level2 : s.levels.level1;
            // Free (incl. signed-out): only this Sunday's sheet opens; others stay locked (unchanged rule).
            const unlocked = isPlus || s.key === thisSundayKey;
            const thumb = (
              <span className="relative block aspect-[4/5] overflow-hidden rounded-lg bg-white">
                <SheetThumb sheet={{ ...toGospelSheetView(s), sundayLabel: yearLabel(s.key) }} level={level} />
                <span className="absolute left-1.5 top-1.5">{typeBadge("Weekly Sheet", "sheet")}</span>
                {unlocked ? (
                  s.key === thisSundayKey && !isPlus ? (
                    <span className="absolute right-1.5 top-1.5 rounded-md bg-[#e6f4ea] px-1.5 py-0.5 text-[10px] font-bold text-[#1e7b34]">
                      FREE
                    </span>
                  ) : null
                ) : (
                  <span className="absolute right-1.5 top-1.5 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-[#d35400] shadow-sm">
                    🔒 PLUS
                  </span>
                )}
              </span>
            );
            const meta = (
              <span className="block px-1 pt-2">
                <span className="block text-xs font-bold tracking-wide text-[#d35400]">{s.key}</span>
                <span className="block truncate text-sm font-bold text-[#1c1c1c]">{lv.title}</span>
                <span className="block truncate text-xs text-[#6b7280]">{s.liturgicalName}</span>
                <span className="block truncate text-xs text-[#6b7280]">{s.gospelRef}</span>
              </span>
            );
            const pill = "inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-semibold no-underline";
            const ghost =
              "inline-flex items-center gap-1 rounded-full border border-[#e7e3de] bg-white px-3 py-1.5 text-sm font-medium no-underline";
            return (
              <li key={`s-${s.key}`}>
                {unlocked ? (
                  <div className="flex h-full flex-col rounded-xl border border-[#e7e3de] bg-white p-1.5">
                    <Link href={resourcePath(s.key, level)} className="block no-underline" tabIndex={-1}>
                      {thumb}
                    </Link>
                    {meta}
                    <div className="mt-auto flex flex-wrap gap-1.5 px-1 pb-1 pt-2.5">
                      <Link href={resourcePath(s.key, level)} className={`${pill} bg-[#d35400] text-white hover:bg-[#b8470a]`}>
                        Open
                      </Link>
                      <a
                        href={resourcePrintPath(s.key, level, true)}
                        target="_blank"
                        rel="noopener"
                        className={`${ghost} text-[#1c1c1c] hover:bg-[#fffdfb]`}
                      >
                        🖨 Print
                      </a>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex h-full cursor-not-allowed flex-col rounded-xl border border-[#e7e3de] bg-white p-1.5"
                    aria-disabled="true"
                    title="Plus members only (this Sunday's sheet is free)"
                  >
                    <span className="block opacity-60">{thumb}</span>
                    {meta}
                    <div className="mt-auto px-1 pb-1 pt-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        <PlusLockButton level={level} className={`${pill} cursor-pointer bg-[#e7e3de] text-[#6b7280]`}>
                          Open
                        </PlusLockButton>
                        <PlusLockButton level={level} className={`${ghost} cursor-pointer text-[#9ca3af]`}>
                          🖨 Print
                        </PlusLockButton>
                      </div>
                      <p className="m-0 mt-1.5 text-xs text-[#6b7280]">
                        🔒 Plus members only ·{" "}
                        <Link href="/subscribe" className="cursor-pointer font-semibold text-[#d35400] hover:underline">
                          Get Plus
                        </Link>
                      </p>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-4 text-sm text-[#6b7280]">
          Nothing matches. Try a Gospel (e.g. “Luke 15”), a story (e.g. “lost sheep”), a saint or a feast.
        </p>
      )}
      {hits.length > shown.length ? (
        <p className="mt-4 text-center text-sm text-[#6b7280]">
          Showing the best matches. Add a word to narrow your search.
        </p>
      ) : null}
      {!isPlus && hits.length ? (
        <p className="mt-3 text-center text-xs text-[#6b7280]">
          Free: print this Sunday&apos;s sheet. Plus: every sheet, plus card downloads (PNG 4:5) and sharing ·{" "}
          <Link href="/subscribe" className="font-semibold text-[#d35400]">
            Get Plus
          </Link>
        </p>
      ) : null}
    </section>
  );
}
