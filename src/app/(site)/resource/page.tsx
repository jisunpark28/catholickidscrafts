import { HomePdfShell } from "@/components/home/HomePdfShell";
import { CardsBrowser } from "@/components/resource/CardsBrowser";
import { CustomSheetCardGrid } from "@/components/resource/CustomSheetCardGrid";
import { PrintablesCardsArticle } from "@/components/resource/PrintablesCardsArticle";
import { PrintablesCardsFinder } from "@/components/resource/PrintablesCardsFinder";
import { PrintablesModeToggle } from "@/components/resource/PrintablesModeToggle";
import { PrintablesSundaysArticle } from "@/components/resource/PrintablesSundaysArticle";
import { PrintablesSundaysFinder } from "@/components/resource/PrintablesSundaysFinder";
import { ResourceSearchBar } from "@/components/resource/ResourceSearchBar";
import { UnifiedSearchResults } from "@/components/resource/UnifiedSearchResults";
import { JsonLd } from "@/components/seo/JsonLd";
import { requireFamilySession } from "@/lib/family-auth";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import {
  dailyActivityFor,
  getActivity,
  seasonActivityRecommendations,
  SUNDAY_CRAFT_SLUG,
  torontoDate,
} from "@/lib/resource/activities";
import { upcomingCardDates } from "@/lib/resource/card-calendar";
import { parseCardGroup } from "@/lib/resource/card-groups";
import { relatedWorksheetsById, saintReportWorksheet } from "@/lib/resource/card-related";
import {
  cardsForSunday,
  getPictureCard,
  PICTURE_CARDS,
  toCardListItem,
} from "@/lib/resource/cards";
import { getResourceNav } from "@/lib/resource/nav";
import { listCustomSheets } from "@/lib/resource/custom-sheet-db";
import { featuredCardFor } from "@/lib/resource/featured-card";
import { resolveResourceViewer, sheetOpenAllowed } from "@/lib/resource/resolve-access";
import { parseSeason, RESOURCE_SEASONS, sheetSeason } from "@/lib/resource/sheets";
import { listSundayCalendar, resolveSundayEntry } from "@/lib/resource/sunday-calendar";
import { saintStoryViewsById } from "@/lib/seo/saint-story-view";
import {
  COUNTRY_COOKIE,
  COUNTRY_LABELS,
  pickCountry,
  thisSunday,
  todayIn,
} from "@/lib/resource/this-sunday";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode } from "@/lib/structured-data";
import { getSiteUrl } from "@/lib/site-url";
import { unifiedSearch } from "@/lib/resource/unified-search";
import { getSundaySheet } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import Link from "next/link";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const dynamic = "force-dynamic";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Option E modes + legacy library views. */
type ResourceView = "" | "sundays" | "all" | "custom" | "cards";

function parseView(raw: string | undefined): ResourceView {
  if (raw === "all" || raw === "custom" || raw === "cards" || raw === "sundays") return raw;
  return "";
}

/** "Nov 1" from YYYY-MM-DD. */
function shortDate(ymd: string): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" });
}

function isYmd(v: string | undefined): v is string {
  return Boolean(v && /^\d{4}-\d{2}-\d{2}$/.test(v));
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  // Filtered library views and shared cards stay out of the index.
  const filtered = Boolean(
    one(sp.q) || one(sp.season) || one(sp.view) || one(sp.level) || one(sp.card) || one(sp.cat) || one(sp.page) || one(sp.sunday),
  );
  return pageMetadata({
    title: "Catholic Worksheets and Picture Cards for Kids",
    description:
      "Find this Sunday's Gospel sheet, Mass and virtue worksheets, and Catholic picture cards. Search one resource library by Gospel, saint, topic or season.",
    path: "/resource",
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
  });
}

export default async function ResourcePage({ searchParams }: Props) {
  const [sp, cookieStore, h, nav, viewer] = await Promise.all([
    searchParams,
    cookies(),
    headers(),
    getResourceNav(),
    resolveResourceViewer(),
  ]);
  const q = (one(sp.q) ?? "").slice(0, 80);
  const season = parseSeason(one(sp.season));
  const level = parseLevelParam(sp.level);
  const viewParam = parseView(one(sp.view));
  const sundayParam = one(sp.sunday);
  const cardGroup = viewParam === "cards" ? parseCardGroup(one(sp.group)) : "";
  const country = pickCountry(undefined, cookieStore.get(COUNTRY_COOKIE)?.value, h.get("x-vercel-ip-country"));

  // Old card share URLs still open their detail panel; Option E defaults Printables to Worksheets (mode key: sundays).
  const searchMode = Boolean(q.trim()) && viewParam !== "cards";
  const sharedCard = viewParam === "cards" ? getPictureCard(one(sp.card)) : null;
  const view: ResourceView = searchMode
    ? "all"
    : sharedCard || viewParam === "cards"
      ? "cards"
      : viewParam === "custom"
        ? "custom"
        : viewParam === "all" || season
          ? "all"
          : "sundays";

  const printablesMode = view === "cards" ? "cards" : view === "sundays" ? "sundays" : null;
  const sunday = thisSunday(country);
  const thisSundayKey = viewer.thisSundayKey ?? sunday?.key ?? null;
  const siteUrl = getSiteUrl();
  const sundayCards = sunday ? cardsForSunday(sunday.key) : { primary: null, more: [] };
  const featured = sunday ? featuredCardFor(country) : null;
  const freeCardId = (featured ?? featuredCardFor(country))?.card.id ?? null;
  const featuredIds = [featured?.card, sundayCards.primary, ...sundayCards.more]
    .filter((c) => c != null)
    .map((c) => c.id)
    .filter((id, i, all) => all.indexOf(id) === i);
  const todayToronto = torontoDate();
  const daily = sunday ? dailyActivityFor(todayToronto) : null;
  const craft = sunday ? getActivity(SUNDAY_CRAFT_SLUG) : null;
  const cardDates =
    (view === "cards" || printablesMode === "cards") && sunday
      ? upcomingCardDates(todayIn(country, new Date()), sunday.date, country)
      : {};
  const searchHits = view === "all" ? unifiedSearch(q, season, thisSundayKey) : [];
  const clearParams = new URLSearchParams({ view: "all" });
  if (season) clearParams.set("season", season);
  if (level === 2) clearParams.set("level", "2");
  const clearHref = `/resource?${clearParams.toString()}`;
  const resultsParams = new URLSearchParams(clearParams);
  if (searchMode) resultsParams.set("q", q.trim());
  const resultsHref = `/resource?${resultsParams.toString()}`;
  const requestedPage = Number(one(sp.page) ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  let customSheets: Awaited<ReturnType<typeof listCustomSheets>> = [];
  let customError: string | null = null;
  if (view === "custom" && viewer.isPlus) {
    const session = await requireFamilySession();
    if (session) {
      try {
        customSheets = await listCustomSheets(session.familyAccountId);
      } catch (e) {
        console.error("[resource] custom list", e);
        customError = "Could not load your custom sheets right now.";
      }
    }
  }

  // Worksheets Option E: ?sunday=YYYY-MM-DD (any past/future Sunday) → romcal Year A/B/C sheet.
  const sundayCalendar = sunday ? listSundayCalendar(country, sunday.date) : [];
  const paramEntry = isYmd(sundayParam) ? resolveSundayEntry(sundayParam, country) : null;
  const selectedSundayDate = paramEntry?.date ?? sunday?.date ?? "";
  const selectedEntry =
    paramEntry ??
    sundayCalendar.find((s) => s.date === selectedSundayDate) ??
    (sunday ? resolveSundayEntry(sunday.date, country) : null);
  const selectedSheet = selectedEntry
    ? getSundaySheet(selectedEntry.key)
    : sunday
      ? getSundaySheet(sunday.key)
      : null;
  const selectedKey = selectedEntry?.key ?? sunday?.key ?? null;
  const canOpenSelected = selectedKey ? sheetOpenAllowed(viewer, selectedKey) : false;
  // Auth hard rules: clear preview only for this-week free (or Plus). Download follows sheetOpenAllowed + SignInGatedLink.
  const canPreviewSelected = viewer.isPlus || canOpenSelected;
  const canPrintSelected = canOpenSelected;
  const isThisWeekFree = Boolean(selectedKey && thisSundayKey && selectedKey === thisSundayKey);
  const selectedSeason = selectedSheet ? sheetSeason(selectedSheet) : null;
  const seasonActivities = selectedSeason ? seasonActivityRecommendations(selectedSeason) : [];
  const seasonRecParams = new URLSearchParams();
  if (selectedSundayDate) seasonRecParams.set("sunday", selectedSundayDate);
  if (level === 2) seasonRecParams.set("level", "2");
  const seasonRecHref = `/resource?${seasonRecParams.toString()}#season-recs`;

  const sundaysHref = level === 2 ? "/resource?level=2" : "/resource";
  const cardsHref =
    level === 2
      ? freeCardId
        ? `/resource?view=cards&level=2`
        : "/resource?view=cards&level=2"
      : "/resource?view=cards";

  const chrome =
    printablesMode != null ? (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PrintablesModeToggle mode={printablesMode} sundaysHref={sundaysHref} cardsHref={cardsHref} />
        <Link href="/resource?view=all" className="text-sm text-[#335599] no-underline hover:underline">
          Search all resources
        </Link>
      </div>
    ) : null;

  const finderSundays =
    selectedEntry && !sundayCalendar.some((s) => s.date === selectedEntry.date)
      ? [...sundayCalendar, selectedEntry].sort((a, b) => a.date.localeCompare(b.date))
      : sundayCalendar;

  const middle =
    printablesMode === "sundays" && sunday ? (
      <PrintablesSundaysFinder
        sundays={finderSundays}
        thisSundayDate={sunday.date}
        selectedDate={selectedSundayDate || sunday.date}
        level={level}
      />
    ) : printablesMode === "cards" ? (
      <PrintablesCardsFinder
        initialQ={viewParam === "cards" ? q : ""}
        level={level}
        freeCardTitle={featured?.card.title ?? null}
        group={cardGroup}
      />
    ) : undefined;

  return (
    <HomePdfShell
      groups={nav.groups}
      dailyMassLabel={nav.dailyMassLabel}
      chrome={chrome ?? undefined}
      middle={middle}
      middleDrawerLabel={printablesMode === "cards" ? "Search cards" : "Pick a worksheet"}
      contentClassName={printablesMode ? "bg-[#fff8f0]" : "bg-white"}
    >
      <JsonLd nodes={[breadcrumbNode([{ name: "Resource", path: "/resource" }])]} />
      <h1 className="sr-only">Catholic worksheets and picture cards</h1>

      {printablesMode == null ? (
        <ResourceSearchBar
          key={`${q}:${season ?? ""}:${view}`}
          state={{ q, season: season ?? "", level, view: view === "cards" ? "all" : view === "sundays" ? "" : view }}
          seasons={RESOURCE_SEASONS}
          isPlus={viewer.isPlus}
        />
      ) : null}

      {view === "all" ? (
        <UnifiedSearchResults
          q={q.trim()}
          hits={searchHits}
          level={level}
          isPlus={viewer.isPlus}
          thisSundayKey={thisSundayKey}
          clearHref={clearHref}
          siteUrl={siteUrl}
          freeCardId={freeCardId}
          page={page}
          resultsHref={resultsHref}
        />
      ) : view === "cards" && printablesMode === "cards" ? (
        <PrintablesCardsArticle
          key={`${cardGroup}|${q}`}
          cards={PICTURE_CARDS.map((c) => toCardListItem(c, cardDates[c.id]))}
          isPlus={viewer.isPlus}
          freeCardId={freeCardId}
          level={level}
          siteUrl={siteUrl}
          featuredIds={featuredIds}
          initialQ={q}
          initialCardId={sharedCard?.id ?? one(sp.card) ?? null}
          saintStories={saintStoryViewsById()}
          initialGroup={cardGroup}
          captions={Object.fromEntries(PICTURE_CARDS.filter((c) => c.cat !== "Saint").map((c) => [c.id, c.text]))}
          relatedWorksheets={relatedWorksheetsById(PICTURE_CARDS)}
          saintWorksheet={saintReportWorksheet()}
        />
      ) : view === "cards" ? (
        <CardsBrowser
          cards={PICTURE_CARDS.map((c) => toCardListItem(c, cardDates[c.id]))}
          isPlus={viewer.isPlus}
          freeCardId={freeCardId}
          level={level}
          siteUrl={siteUrl}
          featuredIds={featuredIds}
          initialQ={q}
          initialCardId={sharedCard?.id ?? null}
          season={season ?? ""}
          onlySunday={false}
        />
      ) : view === "custom" ? (
        <section aria-label="Custom sheets" className="mt-5">
          <div className="mb-4">
            <h2 className="m-0 text-xl font-bold text-[#1c1c1c]">
              My custom sheets{" "}
              <span className="align-middle rounded-md bg-[#d35400] px-1.5 py-0.5 text-[10px] font-bold text-white">
                PLUS
              </span>
            </h2>
            <p className="mb-0 mt-1 text-sm text-[#6b7280]">
              Sheets you edited and saved. Open one to keep editing.
            </p>
          </div>
          {!viewer.isPlus ? (
            <div className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-6 py-8 text-center">
              <p className="m-0 text-sm text-[#4b5563]">
                Sign in to customize this Sunday&apos;s sheet. Saving and reopening custom sheets needs Plus.
              </p>
              <p className="mb-0 mt-2 text-xs font-semibold text-[#6b7280]">One-time payment. No auto-renew.</p>
              <Link
                href="/subscribe"
                className="mt-4 inline-flex rounded-full bg-[#d35400] px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#b8470a]"
              >
                Unlock with Plus
              </Link>
            </div>
          ) : customError ? (
            <p className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-4 text-sm text-[#6b7280]">
              {customError}
            </p>
          ) : (
            <CustomSheetCardGrid
              sheets={customSheets.map((s) => ({
                id: s.id,
                name: s.name,
                baseKey: s.baseKey,
                level: s.level as 1 | 2,
                updatedAt: s.updatedAt.toISOString(),
                thumbUrl: s.thumbUrl,
              }))}
            />
          )}
        </section>
      ) : printablesMode === "sundays" && selectedSheet && selectedSundayDate ? (
        <PrintablesSundaysArticle
          sheet={selectedSheet}
          level={level}
          sundayDate={selectedSundayDate}
          countryLabel={COUNTRY_LABELS[country] ?? country}
          canPreview={canPreviewSelected}
          canPrint={canPrintSelected}
          isThisWeekFree={isThisWeekFree}
          activity={
            isThisWeekFree && daily
              ? {
                  activity: daily.activity,
                  dateLabel: daily.exact
                    ? `Today · ${shortDate(todayToronto)}`
                    : daily.date
                      ? `From ${shortDate(daily.date)}`
                      : "Advent",
                }
              : null
          }
          craft={isThisWeekFree ? craft : null}
          seasonActivities={seasonActivities}
          seasonRecPage={page}
          seasonRecHref={seasonRecHref}
          seasonOverride={selectedSeason ?? undefined}
        />
      ) : (
        <p className="mt-5 rounded-2xl border border-[#e8d9cd] bg-[#fff3e6] px-5 py-4 text-sm text-[#6b5c50]">
          This Sunday&apos;s sheet is not available right now.{" "}
          <Link href="/resource?view=all" className="text-[#c9773a]">
            Browse all resources
          </Link>
          .
        </p>
      )}
    </HomePdfShell>
  );
}
