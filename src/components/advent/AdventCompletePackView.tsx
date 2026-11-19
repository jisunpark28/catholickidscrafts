import { PackActivityDownloads } from "@/components/advent/PackActivityDownloads";
import { PackDownloadAll } from "@/components/advent/PackDownloadAll";
import { GOSPEL_SHEET_CSS } from "@/components/gospel-sheet/sheet-styles";
import { SheetThumb } from "@/components/resource/SheetThumb";
import {
  ADVENT_PACK_DATES,
  ADVENT_PACK_PATH,
  adventPackOutline,
  packItemAnchor,
  packSheetAnchor,
  packWeekAnchor,
  type AdventPackItemView,
  type AdventPackSheetLinks,
  type AdventPackWeek,
} from "@/lib/advent-complete-2026";
import { activityAccessNow } from "@/lib/resource/activities";
import { signInPath } from "@/lib/sign-in-callback";
import { yearLabel } from "@/lib/resource/sheets";
import { getSundaySheet, toGospelSheetView } from "@/lib/sunday-sheet-content";
import Image from "next/image";
import Link from "next/link";

const primary =
  "inline-flex items-center justify-center rounded-full bg-[#d35400] px-5 py-2.5 text-sm font-extrabold text-white no-underline hover:bg-[#b8470a]";
const ghost =
  "inline-flex items-center justify-center rounded-full border-2 border-[#d35400] bg-white px-5 py-2 text-sm font-extrabold text-[#d35400] no-underline hover:bg-[#fff6ef]";
const chip =
  "inline-flex items-center justify-center rounded-full border border-[#eadccd] bg-white px-3 py-1.5 text-xs font-bold text-[#1f2937] no-underline hover:bg-[#fff6ef]";

function roleLabel(item: AdventPackItemView): string {
  if (item.outsidePack) return "Outside pack";
  if (item.continued) return "Home · continued";
  if (item.role === "craft") return "Class craft";
  if (item.role === "home") return "Home";
  return "Bonus";
}

function SheetActions({ sheet }: { sheet: AdventPackSheetLinks }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <Link href={sheet.printL1} className={chip} target="_blank" rel="noopener">
        Print L1
      </Link>
      <Link href={sheet.printL2} className={chip} target="_blank" rel="noopener">
        Print L2
      </Link>
      <Link href={sheet.editL1} className={chip}>
        Edit L1
      </Link>
      <Link href={sheet.editL2} className={chip}>
        Edit L2
      </Link>
    </div>
  );
}

function SheetRow({
  weekId,
  sheet,
  unlocked,
}: {
  weekId: string;
  sheet: AdventPackSheetLinks;
  unlocked: boolean;
}) {
  const content = getSundaySheet(sheet.key);
  const view = content ? { ...toGospelSheetView(content), sundayLabel: yearLabel(sheet.key) } : null;
  const anchor = packSheetAnchor(weekId);

  return (
    <li id={anchor} className="scroll-mt-24 rounded-2xl border border-[#f1e4d6] bg-white p-3">
      <Link href={sheet.openHref} className="flex gap-3 no-underline text-inherit hover:opacity-95">
        <div className="w-[4.5rem] shrink-0 sm:w-[5.5rem]">
          {view ? <SheetThumb sheet={view} level={1} /> : <div className="aspect-[816/1056] rounded-xl bg-[#f3ebe3]" />}
        </div>
        <div className="min-w-0 flex-1 self-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#d35400]">Gospel sheet</p>
          <p className="font-bold leading-snug text-[#1f2937]">
            {sheet.l1Title} <span className="font-medium text-[#6b7280]">·</span> {sheet.l2Title}
          </p>
          <p className="text-sm text-[#6b7280]">
            {sheet.liturgicalName} · {sheet.gospelRef}
          </p>
        </div>
      </Link>
      {unlocked ? <SheetActions sheet={sheet} /> : null}
    </li>
  );
}

function ItemRow({
  weekId,
  item,
  unlocked,
}: {
  weekId: string;
  item: AdventPackItemView;
  unlocked: boolean;
}) {
  const anchor = packItemAnchor(weekId, item.slug, item.role);

  return (
    <li id={anchor} className="scroll-mt-24 rounded-2xl border border-[#f1e4d6] bg-white p-3">
      <Link href={item.openHref} className="flex gap-3 no-underline text-inherit hover:opacity-95">
        <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl border border-[#f1e4d6] bg-[#fbf6f0] sm:h-[5.5rem] sm:w-[5.5rem]">
          <Image
            src={item.activity.previews.color}
            alt=""
            fill
            sizes="88px"
            className="object-cover object-top"
          />
        </div>
        <div className="min-w-0 flex-1 self-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#d35400]">
            {roleLabel(item)}
            {activityAccessNow(item.activity) === "plus" ? " · Plus" : " · Free this week"}
          </p>
          <p className="font-bold leading-snug text-[#1f2937]">{item.activity.title}</p>
        </div>
      </Link>
      {unlocked ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Link href={item.openHref} className={chip}>
            Open
          </Link>
          {item.editHref ? (
            <Link href={item.editHref} className={chip}>
              Customize
            </Link>
          ) : null}
          <PackActivityDownloads slug={item.activity.slug} />
        </div>
      ) : null}
    </li>
  );
}

function WeekCard({
  week,
  sheet,
  items,
  unlocked,
}: {
  week: AdventPackWeek;
  sheet: AdventPackSheetLinks | null;
  items: AdventPackItemView[];
  unlocked: boolean;
}) {
  return (
    <article
      id={packWeekAnchor(week.id)}
      className="scroll-mt-24 rounded-[24px] border border-[#eadccd] bg-gradient-to-br from-[#fffaf4] to-white p-4 sm:p-5"
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-[#1f2937]">
          {week.label}
          <span className="ml-2 text-sm font-semibold text-[#6b7280]">{week.dateLabel}</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {!unlocked ? (
            <span className="text-xs font-extrabold uppercase tracking-wide text-[#9a6b3a]">Preview</span>
          ) : (
            <PackDownloadAll scope={week.id} label="Download week" />
          )}
        </div>
      </header>

      <ul className="mt-3 space-y-2">
        {sheet ? <SheetRow weekId={week.id} sheet={sheet} unlocked={unlocked} /> : null}
        {items.map((item) => (
          <ItemRow
            key={`${week.id}-${item.slug}-${item.role}-${item.continued ? "c" : "n"}`}
            weekId={week.id}
            item={item}
            unlocked={unlocked}
          />
        ))}
      </ul>
    </article>
  );
}

export function AdventCompletePackView({ isPlus }: { isPlus: boolean }) {
  const outline = adventPackOutline();

  return (
    <div className="relative isolate">
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_CSS }} />
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#d35400]">
        2026 Advent Pack · {ADVENT_PACK_DATES}
      </p>
      <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-[#1f2937] sm:text-4xl">Advent Complete</h1>

      {isPlus ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <PackDownloadAll scope="all" label="Download all" />
          <p className="text-sm text-[#6b7280]">
            Customize: Free 3, Advent Candle Craft, Gospel sheets.
          </p>
        </div>
      ) : (
        <div className="mt-5 rounded-[22px] border border-[#eadccd] bg-[#fff6ef] px-4 py-4 sm:px-5">
          <p className="font-bold text-[#1f2937]">Plus unlocks this pack</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/subscribe" className={primary}>
              Get Plus
            </Link>
            <Link href={signInPath(ADVENT_PACK_PATH)} className={ghost}>
              Sign in
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {outline.map(({ week, sheet, items }) => (
          <WeekCard key={week.id} week={week} sheet={sheet} items={items} unlocked={isPlus} />
        ))}
      </div>
    </div>
  );
}
