import { PackActivityDownloads } from "@/components/advent/PackActivityDownloads";
import {
  ADVENT_PACK_DATES,
  ADVENT_PACK_PATH,
  adventPackOutline,
  type AdventPackItemView,
  type AdventPackSheetLinks,
  type AdventPackWeek,
} from "@/lib/advent-complete-2026";
import { signInPath } from "@/lib/sign-in-callback";
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

function SheetActions({ sheet, unlocked }: { sheet: AdventPackSheetLinks; unlocked: boolean }) {
  if (!unlocked) return null;
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

function ItemRow({ item, unlocked }: { item: AdventPackItemView; unlocked: boolean }) {
  return (
    <li className="rounded-2xl border border-[#f1e4d6] bg-white px-3.5 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#d35400]">
            {roleLabel(item)}
            {item.activity.access === "plus" ? " · Plus" : " · Sign-in"}
          </p>
          <p className="font-bold text-[#1f2937]">{item.activity.title}</p>
        </div>
        {unlocked ? (
          <div className="flex flex-wrap items-center gap-1.5">
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
      </div>
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
    <article className="rounded-[24px] border border-[#eadccd] bg-gradient-to-br from-[#fffaf4] to-white p-4 sm:p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-[#1f2937]">
          {week.label}
          <span className="ml-2 text-sm font-semibold text-[#6b7280]">{week.dateLabel}</span>
        </h2>
        {!unlocked ? (
          <span className="text-xs font-extrabold uppercase tracking-wide text-[#9a6b3a]">Preview</span>
        ) : null}
      </header>

      {sheet ? (
        <div className="mt-3 rounded-2xl border border-[#f1e4d6] bg-white/80 px-3.5 py-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#d35400]">Gospel sheet</p>
          <p className="font-bold text-[#1f2937]">
            {sheet.l1Title} <span className="font-medium text-[#6b7280]">·</span> {sheet.l2Title}
          </p>
          <p className="text-sm text-[#6b7280]">
            {sheet.liturgicalName} · {sheet.gospelRef}
          </p>
          <SheetActions sheet={sheet} unlocked={unlocked} />
        </div>
      ) : null}

      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <ItemRow key={`${week.id}-${item.slug}-${item.role}-${item.continued ? "c" : "n"}`} item={item} unlocked={unlocked} />
        ))}
      </ul>
    </article>
  );
}

function PackFooterBridge() {
  return (
    <footer className="mt-8 border-t border-[#eadccd] pt-5 text-sm text-[#5b6575]">
      <p>
        Advent wreath &amp; family calendar: free with sign-in in{" "}
        <Link href="/resource" className="font-semibold text-[#d35400] hover:underline">
          Printables
        </Link>
        .
      </p>
      <p className="mt-1">Christmas crafts come in a separate Christmas Pack.</p>
    </footer>
  );
}

export function AdventCompletePackView({ isPlus }: { isPlus: boolean }) {
  const outline = adventPackOutline();

  return (
    <div className="relative isolate">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#d35400]">
        2026 Advent Pack · {ADVENT_PACK_DATES}
      </p>
      <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-[#1f2937] sm:text-4xl">Advent Complete</h1>
      <p className="mt-1.5 max-w-2xl text-base text-[#5b6575]">
        4 Sunday sheets (Year B) + 8 crafts &amp; activities for class and home.
      </p>

      {isPlus ? (
        <p className="mt-3 text-sm text-[#6b7280]">
          Customize only where an editor exists: Free 3 activities, Advent Candle Craft, and Gospel sheets.
        </p>
      ) : (
        <div className="mt-5 rounded-[22px] border border-[#eadccd] bg-[#fff6ef] px-4 py-4 sm:px-5">
          <p className="font-bold text-[#1f2937]">Plus unlocks this pack</p>
          <p className="mt-1 text-sm text-[#5b6575]">
            This Sunday&apos;s sheet stays free under Option E. The full Advent pack is Plus.
          </p>
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

      <PackFooterBridge />
    </div>
  );
}
