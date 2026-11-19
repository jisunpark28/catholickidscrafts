import { ActivityTile } from "@/components/resource/activity/ActivityTile";
import { ResourceCardGrid } from "@/components/resource/ResourceCardGrid";
import { ResourcePagination } from "@/components/resource/ResourcePagination";
import type { ResourceActivity } from "@/lib/resource/activities";
import type { SundaySheetContent } from "@/lib/sunday-sheet-content";
import Link from "next/link";

type Props = {
  heading: string;
  q: string;
  sheets: SundaySheetContent[];
  activities: ResourceActivity[];
  level: 1 | 2;
  isPlus: boolean;
  thisSundayKey: string | null;
  clearHref: string;
  page: number;
  resultsHref: string;
  /** Hide the clear link when this is already the All worksheets grid. */
  showClear?: boolean;
};

const PAGE = 24;

/** Right pane when the Worksheets finder is searching or using a Try this filter. */
export function PrintablesWorksheetsResults({
  heading,
  q,
  sheets,
  activities,
  level,
  isPlus,
  thisSundayKey,
  clearHref,
  page,
  resultsHref,
  showClear = true,
}: Props) {
  const items: ({ type: "activity"; activity: ResourceActivity } | { type: "sheet"; sheet: SundaySheetContent })[] = [
    ...activities.map((activity) => ({ type: "activity" as const, activity })),
    ...sheets.map((sheet) => ({ type: "sheet" as const, sheet })),
  ];
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE));
  const currentPage = Math.min(totalPages, Math.max(1, page));
  const shown = items.slice((currentPage - 1) * PAGE, currentPage * PAGE);
  const shownActivities = shown.flatMap((item) => (item.type === "activity" ? [item.activity] : []));
  const shownSheets = shown.flatMap((item) => (item.type === "sheet" ? [item.sheet] : []));
  const empty = !items.length;

  return (
    <section aria-label={q ? "Worksheet search results" : "Worksheet results"} className="space-y-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="m-0 font-serif text-xl font-bold text-[#1c1c1c] sm:text-2xl">{heading}</h2>
          {q && !heading.startsWith("Results") ? (
            <p className="mb-0 mt-1 text-sm text-[#6b5c50]">Results for “{q}”</p>
          ) : null}
        </div>
        {showClear ? (
          <Link href={clearHref} className="text-sm font-semibold text-[#d35400] no-underline hover:underline">
            ✕ {q ? "Clear search" : "All worksheets"}
          </Link>
        ) : null}
      </header>

      {empty ? (
        <p className="rounded-2xl border border-[#e8d9cd] bg-[#fff3e6] px-5 py-4 text-sm text-[#6b5c50]">
          No worksheets match. Try a Sunday name, season, or Gospel word.
        </p>
      ) : null}

      {shownActivities.length ? (
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 xl:grid-cols-4">
          {shownActivities.map((activity) => (
            <li key={`a-${activity.slug}`}>
              <ActivityTile activity={activity} />
            </li>
          ))}
        </ul>
      ) : null}

      {shownSheets.length ? (
        <ResourceCardGrid sheets={shownSheets} level={level} isPlus={isPlus} thisSundayKey={thisSundayKey} />
      ) : null}

      <ResourcePagination
        currentPage={currentPage}
        totalPages={totalPages}
        resultsHref={resultsHref}
        className="bg-transparent"
      />
    </section>
  );
}
