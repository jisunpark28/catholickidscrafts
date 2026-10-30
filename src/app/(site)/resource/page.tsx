import { HomePdfShell } from "@/components/home/HomePdfShell";
import { CardsBrowser } from "@/components/resource/CardsBrowser";
import { CustomSheetCardGrid } from "@/components/resource/CustomSheetCardGrid";
import { ResourceCardGrid } from "@/components/resource/ResourceCardGrid";
import { ResourceSearchBar } from "@/components/resource/ResourceSearchBar";
import { ResourceTabs } from "@/components/resource/ResourceTabs";
import { SundayBundle } from "@/components/resource/SundayBundle";
import { UnifiedSearchResults } from "@/components/resource/UnifiedSearchResults";
import { JsonLd } from "@/components/seo/JsonLd";
import { requireFamilySession } from "@/lib/family-auth";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { upcomingCardDates } from "@/lib/resource/card-calendar";
import {
  cardsForSunday,
  getPictureCard,
  PICTURE_CARDS,
  toCardListItem,
} from "@/lib/resource/cards";
import { getResourceNav } from "@/lib/resource/nav";
import { listCustomSheets } from "@/lib/resource/custom-sheet-db";
import { featuredCardFor } from "@/lib/resource/featured-card";
import { resolveResourceViewer } from "@/lib/resource/resolve-access";
import { parseSeason, RESOURCE_SEASONS, searchSheets } from "@/lib/resource/sheets";
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

type ResourceView = "" | "all" | "custom" | "cards";

function parseView(raw: string | undefined): ResourceView {
  if (raw === "all" || raw === "custom" || raw === "cards") return raw;
  return "";
}

/** "Nov 1" from YYYY-MM-DD. */
function shortDate(ymd: string): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" });
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  // Any filtered / tab / card view (incl. the Plus-gated Cards tab) stays out of the index.
  const filtered = Boolean(
    one(sp.q) || one(sp.season) || one(sp.view) || one(sp.level) || one(sp.card) || one(sp.cat),
  );
  return pageMetadata({
    title: "Sunday Gospel Activity Sheets for Catholic Kids",
    description:
      "Free printable Sunday Gospel activity sheets for every Sunday and feast. Find this Sunday's sheet or search by Gospel, topic or season, then print Level 1 or Level 2.",
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
  const country = pickCountry(undefined, cookieStore.get(COUNTRY_COOKIE)?.value, h.get("x-vercel-ip-country"));

  // A text search shows one unified results view (sheets + cards); the tab stays in the URL
  // so "Clear search" returns to it. A season filter alone still opens the Weekly Sheet list.
  const searchMode = Boolean(q.trim());
  const view: ResourceView =
    viewParam === "custom" || viewParam === "cards"
      ? viewParam
      : viewParam === "all" || (!searchMode && season)
        ? "all"
        : "";

  const sunday = view === "" || view === "cards" ? thisSunday(country) : null;
  const sheet = sunday ? getSundaySheet(sunday.key) : null;
  const results = view === "all" && !searchMode ? searchSheets({ q: "", season }) : [];
  const thisSundayKey = viewer.thisSundayKey ?? sunday?.key ?? null;
  const siteUrl = getSiteUrl();
  const sundayCards = sunday ? cardsForSunday(sunday.key) : { primary: null, more: [] };
  // Today's card (feast/saint by date, else this Sunday's, else the season card), picked per request.
  const featured = sunday ? featuredCardFor(country) : null;
  const featuredIds = [featured?.card, sundayCards.primary, ...sundayCards.more]
    .filter((c) => c != null)
    .map((c) => c.id)
    .filter((id, i, all) => all.indexOf(id) === i);
  const cardDates = view === "cards" && sunday ? upcomingCardDates(todayIn(country, new Date()), sunday.date, country) : {};
  const cardsSundayOnly = view === "cards" && !searchMode && one(sp.sunday) === "1";
  const searchHits = searchMode ? unifiedSearch(q, season, thisSundayKey) : [];
  const clearParams = new URLSearchParams();
  if (view) clearParams.set("view", view);
  if (season && view !== "") clearParams.set("season", season);
  if (level === 2) clearParams.set("level", "2");
  const clearHref = `/resource${clearParams.toString() ? `?${clearParams.toString()}` : ""}`;

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

  return (
    <HomePdfShell groups={nav.groups} dailyMassLabel={nav.dailyMassLabel}>
      <JsonLd nodes={[breadcrumbNode([{ name: "Resource", path: "/resource" }])]} />
      <h1 className="sr-only">Sunday Gospel activity sheets</h1>
      <ResourceSearchBar
        state={{ q, season: season ?? "", level, view, sunday: cardsSundayOnly }}
        seasons={RESOURCE_SEASONS}
        isPlus={viewer.isPlus}
      />
      <ResourceTabs
        active={searchMode ? null : view === "" ? "sunday" : view === "all" ? "sheets" : view}
        level={level}
      />

      {searchMode ? (
        <UnifiedSearchResults
          q={q.trim()}
          hits={searchHits}
          level={level}
          isPlus={viewer.isPlus}
          thisSundayKey={thisSundayKey}
          clearHref={clearHref}
          siteUrl={siteUrl}
        />
      ) : view === "cards" ? (
        <CardsBrowser
          cards={PICTURE_CARDS.map((c) => toCardListItem(c, cardDates[c.id]))}
          isPlus={viewer.isPlus}
          siteUrl={siteUrl}
          featuredIds={featuredIds}
          initialQ={q}
          initialCardId={getPictureCard(one(sp.card))?.id ?? featuredIds[0] ?? null}
          season={season ?? ""}
          onlySunday={cardsSundayOnly}
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
                Custom sheets are a Plus feature. Edit any Sunday sheet, save your version, and reopen it here.
              </p>
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
      ) : view === "all" ? (
        <section aria-label="Search results" className="mt-5">
          {results.length ? (
            <ResourceCardGrid
              sheets={results}
              level={level}
              isPlus={viewer.isPlus}
              thisSundayKey={thisSundayKey}
            />
          ) : (
            <p className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-4 text-sm text-[#6b7280]">
              No sheets match. Try a Gospel name (e.g. “Luke”), a story (e.g. “lost sheep”) or{" "}
              <Link href="/resource" className="text-[#d35400]">
                go back to this Sunday
              </Link>
              .
            </p>
          )}
        </section>
      ) : sunday && sheet ? (
        <SundayBundle
          sheet={sheet}
          level={level}
          sundayDate={sunday.date}
          countryLabel={COUNTRY_LABELS[country] ?? country}
          siteUrl={siteUrl}
          card={featured?.card ?? null}
          moreCards={[sundayCards.primary, ...sundayCards.more].filter(
            (c): c is NonNullable<typeof c> => c != null && c.id !== featured?.card.id,
          )}
          cardDateLabel={
            featured
              ? featured.reason === "today"
                ? `Today · ${featured.card.when ?? shortDate(featured.today)}`
                : featured.reason === "sunday"
                  ? shortDate(featured.sundayDate)
                  : "Season card"
              : undefined
          }
        />
      ) : (
        <p className="mt-5 rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-4 text-sm text-[#6b7280]">
          This Sunday&apos;s sheet is not available right now.{" "}
          <Link href="/resource?view=all" className="text-[#d35400]">
            Browse all sheets
          </Link>
          .
        </p>
      )}
    </HomePdfShell>
  );
}
