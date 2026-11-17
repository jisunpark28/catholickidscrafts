import { SignInGatedLink } from "@/components/SignInGatedLink";
import { GOSPEL_SHEET_CSS } from "@/components/gospel-sheet/sheet-styles";
import { LockedSheetPreview } from "@/components/resource/LockedSheetPreview";
import { SheetThumb } from "@/components/resource/SheetThumb";
import { SundayActivitySlot } from "@/components/resource/activity/SundayActivitySlot";
import type { ResourceActivity } from "@/lib/resource/activities";
import { resourcePath, resourcePrintPath } from "@/lib/resource/sheets";
import { fullSundayDate } from "@/lib/resource/sunday-bundle";
import { toGospelSheetView, type SundaySheetContent } from "@/lib/sunday-sheet-content";
import Link from "next/link";

/** Short kid/parent liturgical blurb from sheet fields (no separate CMS copy yet). */
function sundayLiturgicalBlurb(sheet: SundaySheetContent): string {
  const story = sheet.levels.level1.story.replace(/\s+/g, " ").trim();
  const first = story.split(/(?<=[.!?])\s+/)[0] ?? story;
  const snippet = first.length > 220 ? `${first.slice(0, 217).replace(/\s+\S*$/, "")}…` : first;
  return `This Sunday is ${sheet.liturgicalName} (${sheet.season}). The Gospel is ${sheet.gospelRef} — ${sheet.levels.level1.title}. ${snippet}`;
}

type SlotActivity = Pick<ResourceActivity, "slug" | "title" | "kind" | "previews" | "access" | "tryThis" | "summary">;

type Props = {
  sheet: SundaySheetContent;
  level: 1 | 2;
  sundayDate: string;
  countryLabel: string;
  canPreview: boolean;
  canPrint: boolean;
  isThisWeekFree: boolean;
  activity?: { activity: SlotActivity; dateLabel: string } | null;
  craft?: SlotActivity | null;
};

const btn =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9773a]";

/**
 * Right article for Sundays mode: liturgical explanation + worksheet + activity/craft recommendation tiles.
 */
export function PrintablesSundaysArticle({
  sheet,
  level,
  sundayDate,
  countryLabel,
  canPreview,
  canPrint,
  isThisWeekFree,
  activity,
  craft,
}: Props) {
  const lv = level === 2 ? sheet.levels.level2 : sheet.levels.level1;
  const blurb = sundayLiturgicalBlurb(sheet);
  const view = toGospelSheetView(sheet, sundayDate);

  return (
    <article aria-label="Sunday worksheet" className="space-y-5">
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_CSS }} />

      <header className="rounded-[20px] border border-[#eadccd] bg-[#fff3e6] px-5 py-4">
        <p className="m-0 text-xs text-[#6b5c50]">
          {fullSundayDate(sundayDate)}
          <span aria-hidden> · </span>
          {sheet.season}
          <span aria-hidden> · </span>
          {countryLabel}
          {isThisWeekFree ? (
            <>
              <span aria-hidden> · </span>
              <span className="font-semibold text-[#1e7b34]">This week · free</span>
            </>
          ) : null}
        </p>
        <h2 className="m-0 mt-1 font-serif text-2xl font-bold leading-snug text-[#1c1c1c] sm:text-[1.65rem]">
          {sheet.liturgicalName}
        </h2>
        <p className="m-0 mt-1 text-sm text-[#4b5563]">
          {sheet.gospelRef} · “{lv.keyLine}”
        </p>
      </header>

      <section aria-label="Liturgical explanation">
        <h3 className="m-0 font-serif text-lg font-bold text-[#1c1c1c]">This Sunday</h3>
        <p className="mb-0 mt-2 text-sm leading-relaxed text-[#493a30]">{blurb}</p>
      </section>

      <section aria-label="Worksheet" className="rounded-[20px] border border-[#e8d9cd] bg-[#fffdfa] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-[#c9773a]">Worksheet</p>
            <h3 className="m-0 mt-0.5 text-lg font-bold text-[#1c1c1c]">{lv.title}</h3>
          </div>
          {isThisWeekFree ? (
            <span className="rounded-md bg-[#e6f4ea] px-1.5 py-0.5 text-[10px] font-bold text-[#1e7b34]">FREE</span>
          ) : (
            <span className="rounded-md bg-[#d35400] px-1.5 py-0.5 text-[10px] font-bold text-white">PLUS</span>
          )}
        </div>
        <p className="m-0 mt-1 text-xs text-[#6b7280]">
          Gospel story · key verse · family questions
        </p>

        <div className="mt-3 max-h-[340px] overflow-hidden rounded-xl border border-[#eee8e1] bg-white">
          {canPreview ? (
            <Link href={resourcePath(sheet.key, level)} className="block" tabIndex={-1}>
              <SheetThumb sheet={view} level={level} />
            </Link>
          ) : (
            <LockedSheetPreview title={sheet.liturgicalName} />
          )}
        </div>

        {canPreview ? (
          <div className="mt-3 space-y-2 text-sm text-[#493a30]">
            <p className="m-0">
              <span className="font-semibold">Key verse:</span> {sheet.keyVerseDR || lv.keyLine}
            </p>
            <p className="m-0 line-clamp-4">{lv.story}</p>
          </div>
        ) : (
          <p className="m-0 mt-3 text-sm text-[#6b7280]">
            Preview and download for this Sunday unlock with Plus. This week&apos;s free worksheet stays open for
            everyone.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {canPrint ? (
            <SignInGatedLink
              href={resourcePrintPath(sheet.key, level, true)}
              target="_blank"
              rel="noopener"
              className={`${btn} bg-[#c9773a] text-white hover:bg-[#b8470a]`}
            >
              Print
            </SignInGatedLink>
          ) : (
            <Link href="/subscribe" className={`${btn} bg-[#f3f1ee] text-[#9ca3af]`}>
              Get Plus to print
            </Link>
          )}
          {canPreview ? (
            <Link
              href={resourcePath(sheet.key, level)}
              className={`${btn} border border-[#e7e3de] bg-white font-medium text-[#1c1c1c] hover:bg-[#fffdfb]`}
            >
              Open
            </Link>
          ) : (
            <Link href="/subscribe" className={`${btn} border border-[#e7e3de] bg-white font-medium text-[#9ca3af]`}>
              Unlock with Plus
            </Link>
          )}
        </div>
      </section>

      {(activity || craft) && (
        <section aria-label="Recommended for this Sunday" className="space-y-3">
          <h3 className="m-0 font-serif text-lg font-bold text-[#1c1c1c]">Recommended for families</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {activity ? (
              <SundayActivitySlot
                label="Activity"
                activity={activity.activity}
                meta={`${activity.activity.kind} · ${activity.dateLabel}`}
                note={activity.activity.tryThis[0] ? `Try this: ${activity.activity.tryThis[0]}` : activity.activity.summary}
                primaryCls={`${btn} bg-[#c9773a] text-white hover:bg-[#b8470a] disabled:opacity-60`}
                ghostCls={`${btn} border border-[#e7e3de] bg-white font-medium text-[#1c1c1c] hover:bg-[#fffdfb]`}
              />
            ) : null}
            {craft ? (
              <SundayActivitySlot
                label="Craft"
                activity={craft}
                meta={`${craft.kind} · B&W or colour · US Letter`}
                note={craft.summary}
                primaryCls={`${btn} bg-[#c9773a] text-white hover:bg-[#b8470a] disabled:opacity-60`}
                ghostCls={`${btn} border border-[#e7e3de] bg-white font-medium text-[#1c1c1c] hover:bg-[#fffdfb]`}
              />
            ) : null}
          </div>
        </section>
      )}
    </article>
  );
}
