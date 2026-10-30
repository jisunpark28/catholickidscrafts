import { GOSPEL_SHEET_CSS } from "@/components/gospel-sheet/sheet-styles";
import { cardKindLabel, cardSharePath, cardThumbSrc, type PictureCard } from "@/lib/resource/card-meta";
import { resourcePath, resourcePrintPath } from "@/lib/resource/sheets";
import { bundlePrintPath, fullSundayDate, seasonIcon } from "@/lib/resource/sunday-bundle";
import { toGospelSheetView, type SundaySheetContent } from "@/lib/sunday-sheet-content";
import Image from "next/image";
import Link from "next/link";
import { SundayCardButtons } from "./SundayCardButtons";
import { SheetThumb } from "./SheetThumb";

type Props = {
  sheet: SundaySheetContent;
  level: 1 | 2;
  sundayDate: string;
  countryLabel: string;
  siteUrl: string;
  card: PictureCard | null;
  moreCards: PictureCard[];
  /** e.g. "Nov 1" for the card meta line. */
  cardDateLabel?: string;
};

const colBox = "flex min-w-0 flex-col rounded-2xl border border-[#e8e0d6] bg-white p-4";
const colLabel = "m-0 text-[11px] font-bold uppercase tracking-wide text-[#d35400]";
const btn =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";

const COLOR_LABEL: Record<string, string> = {
  green: "Green",
  violet: "Violet",
  white: "White",
  red: "Red",
  rose: "Rose",
  gold: "Gold",
};
const COLOR_DOT: Record<string, string> = {
  green: "#3f8f4f",
  violet: "#7a4fa0",
  white: "#ffffff",
  red: "#c0392b",
  rose: "#e48fa8",
  gold: "#d4a63a",
};

/** "This Sunday" bundle (mockup a-bundle): header · Weekly Sheet · Cards · Activities · Crafts. */
export function SundayBundle({
  sheet,
  level,
  sundayDate,
  countryLabel,
  siteUrl,
  card,
  moreCards,
  cardDateLabel,
}: Props) {
  const lv = level === 2 ? sheet.levels.level2 : sheet.levels.level1;
  const sheetSections = ["Story", "Trace the words", lv.activity?.title ?? lv.heartTitle].filter(Boolean);
  const others = moreCards.slice(0, 2).map((c) => c.title);

  return (
    <section aria-label="This Sunday bundle" className="mt-5 space-y-4">
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_CSS }} />

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#eadccd] bg-[#fdf7f1] px-5 py-4">
        <span aria-hidden className="text-4xl leading-none">
          {seasonIcon(sheet.season)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 flex flex-wrap items-center gap-x-1.5 text-xs text-[#6b7280]">
            <span>{fullSundayDate(sundayDate)}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full border border-[#9ca3af]"
                style={{ background: COLOR_DOT[sheet.color] ?? "#c9c1b6" }}
              />
              {COLOR_LABEL[sheet.color] ?? sheet.color}
            </span>
            <span aria-hidden>·</span>
            <span>{sheet.season}</span>
            <span aria-hidden>·</span>
            <span>{countryLabel}</span>
          </p>
          <h2 className="m-0 mt-0.5 text-xl font-bold leading-snug text-[#1c1c1c] sm:text-2xl">
            {sheet.liturgicalName} — {lv.title}
          </h2>
          <p className="m-0 mt-0.5 text-sm text-[#4b5563]">
            {sheet.gospelRef} · Key line: <strong className="text-[#1c1c1c]">“{lv.keyLine}”</strong>
          </p>
        </div>
        <a
          href={bundlePrintPath(sheet.key, level)}
          target="_blank"
          rel="noopener"
          title="Sheet + picture card in one print — choose “Save as PDF”"
          className={`${btn} bg-[#d35400] text-white hover:bg-[#b8470a]`}
        >
          ⬇ Download full bundle (PDF)
        </a>
      </div>

      {/* Four columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Weekly Sheet — this Sunday is free for everyone */}
        <article className={colBox} aria-label="Weekly Sheet">
          <div className="flex items-start justify-between gap-2">
            <p className={colLabel}>Weekly Sheet</p>
            <span className="rounded-md bg-[#e6f4ea] px-1.5 py-0.5 text-[10px] font-bold text-[#1e7b34]">FREE</span>
          </div>
          <h3 className="m-0 mt-0.5 text-base font-bold text-[#1c1c1c]">{lv.title}</h3>
          <p className="m-0 text-xs text-[#6b7280]">{sheetSections.join(" · ")}</p>
          <Link href={resourcePath(sheet.key, level)} className="mt-3 block max-h-[300px] overflow-hidden rounded-xl" tabIndex={-1}>
            <SheetThumb sheet={toGospelSheetView(sheet, sundayDate)} level={level} />
          </Link>
          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            <a
              href={resourcePrintPath(sheet.key, level, true)}
              target="_blank"
              rel="noopener"
              className={`${btn} bg-[#d35400] text-white hover:bg-[#b8470a]`}
            >
              🖨 Print
            </a>
            <Link
              href={resourcePath(sheet.key, level)}
              className={`${btn} border border-[#e7e3de] bg-white font-medium text-[#1c1c1c] hover:bg-[#fffdfb]`}
            >
              Open
            </Link>
          </div>
        </article>

        {/* Cards — today's card; Download (PNG 4:5) + Share are free here */}
        <article className={colBox} aria-label="Cards">
          <div className="flex items-start justify-between gap-2">
            <p className={colLabel}>Cards</p>
            <span className="rounded-md bg-[#e6f4ea] px-1.5 py-0.5 text-[10px] font-bold text-[#1e7b34]">FREE</span>
          </div>
          {card ? (
            <>
              <h3 className="m-0 mt-0.5 text-base font-bold text-[#1c1c1c]">
                <Link href={cardSharePath(card.id)} className="text-inherit no-underline hover:underline">
                  {card.title}
                </Link>
              </h3>
              <p className="m-0 text-xs text-[#6b7280]">
                {[cardKindLabel(card.cat), cardDateLabel, "PNG 4:5"].filter(Boolean).join(" · ")}
              </p>
              <Link href={cardSharePath(card.id)} className="mt-3 block overflow-hidden rounded-xl border border-[#eee8e1] bg-[#fbf7f1]" tabIndex={-1}>
                <Image
                  src={cardThumbSrc(card.id)}
                  alt={`${card.title} picture card`}
                  width={432}
                  height={540}
                  unoptimized
                  className="mx-auto block h-auto max-h-[300px] w-auto"
                />
              </Link>
              <p className="m-0 mt-2 text-xs italic text-[#4b5563]">
                {card.text}
                {card.ref ? <span className="not-italic text-[#6b7280]"> ({card.ref})</span> : null}
              </p>
              <p className="m-0 mt-1 text-xs">
                <Link href="/resource?view=cards" className="text-[#d35400] no-underline hover:underline">
                  + {others.length ? `${others.join(", ")} and ` : ""}more cards
                </Link>
              </p>
              <div className="mt-auto pt-3">
                <SundayCardButtons
                  card={card}
                  siteUrl={siteUrl}
                  primaryCls={`${btn} bg-[#d35400] text-white hover:bg-[#b8470a]`}
                  ghostCls={`${btn} border border-[#e7e3de] bg-white font-medium text-[#1c1c1c] hover:bg-[#fffdfb]`}
                />
              </div>
            </>
          ) : (
            <p className="m-0 mt-2 text-sm text-[#6b7280]">
              <Link href="/resource?view=cards" className="text-[#d35400]">
                Browse all picture cards
              </Link>
            </p>
          )}
        </article>

        {(["Activities", "Crafts"] as const).map((kind) => (
          <article key={kind} className={`${colBox} bg-[#fcfbfa]`} aria-label={kind}>
            <p className={colLabel}>{kind}</p>
            <h3 className="m-0 mt-0.5 text-base font-bold text-[#9ca3af]">Coming soon</h3>
            <div className="mt-3 flex min-h-[160px] flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#ebe5de] px-4 text-center">
              <span aria-hidden className="text-3xl">
                {kind === "Activities" ? "🎲" : "✂️"}
              </span>
              <p className="m-0 mt-2 text-xs text-[#6b7280]">
                {kind === "Activities"
                  ? "Games and group activities for each Sunday are on the way."
                  : "Craft templates for each Sunday are on the way."}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
