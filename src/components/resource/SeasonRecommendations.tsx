import { ActivityTile } from "@/components/resource/activity/ActivityTile";
import { ResourcePagination } from "@/components/resource/ResourcePagination";
import {
  SEASON_REC_PAGE_SIZE,
  type ResourceActivity,
} from "@/lib/resource/activities";
import { seasonLabel, type ResourceSeason } from "@/lib/resource/sheets";

type TileActivity = Pick<
  ResourceActivity,
  "slug" | "title" | "kind" | "summary" | "seasons" | "previews" | "access" | "editable"
>;

type Props = {
  season: ResourceSeason;
  activities: TileActivity[];
  page: number;
  /** Base href for pagination (`page` query rewritten); include hash for scroll. */
  resultsHref: string;
};

/**
 * Season-matched craft/activity recommendations under the Printables Worksheets article.
 * Reuses library ActivityTile + ResourcePagination (prev/next + page numbers).
 */
export function SeasonRecommendations({ season, activities, page, resultsHref }: Props) {
  if (!activities.length) return null;
  const pages = Math.max(1, Math.ceil(activities.length / SEASON_REC_PAGE_SIZE));
  const currentPage = Math.min(pages, Math.max(1, page));
  const shown = activities.slice(
    (currentPage - 1) * SEASON_REC_PAGE_SIZE,
    currentPage * SEASON_REC_PAGE_SIZE,
  );
  const label = seasonLabel(season);

  return (
    <section id="season-recs" aria-label={`${label} activities and crafts`} className="space-y-3">
      <div>
        <h3 className="m-0 font-serif text-lg font-bold text-[#1c1c1c]">
          {label} activities &amp; crafts
        </h3>
        <p className="mb-0 mt-1 text-sm text-[#6b5c50]">
          Matching this Sunday&apos;s season
          {activities.length > SEASON_REC_PAGE_SIZE
            ? ` · ${activities.length} printables`
            : null}
        </p>
      </div>
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
        {shown.map((activity) => (
          <li key={activity.slug} className="min-w-0">
            <ActivityTile activity={activity} />
          </li>
        ))}
      </ul>
      <ResourcePagination currentPage={currentPage} totalPages={pages} resultsHref={resultsHref} />
    </section>
  );
}
