import { HomeBackdrop } from "@/components/home/HomeBackdrop";
import { HomePdfShell } from "@/components/home/HomePdfShell";
import { SundaySheetHero } from "@/components/home/SundaySheetHero";
import { getSituation } from "@/data/moms-bible/situations";
import { emailConfigured } from "@/lib/email";
import { cardShortTitle, getHomeToday, type HomeHighlight, type HomeToday } from "@/lib/home/home-today";
import { loadHomeSundaySheet } from "@/lib/home-sunday-sheet";
import { getPublicContactEmail } from "@/lib/site-contact";
import { activityPath, CRAFTS_LIST_PATH, homeActivityPicks, homeCraftPicks } from "@/lib/resource/activities";
import type { ResourceSeason } from "@/lib/resource/sheets";
import { buildHomePdfNav } from "@/lib/home-pdf-nav";
import { getPublishedHomeSections } from "@/lib/home-sections";
import { getLiturgicalSeason } from "@/lib/liturgical-season";
import { pageMetadata } from "@/lib/site-metadata";
import { SITE_DESCRIPTION, worksheetNode } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import type { RomcalCountry } from "@/lib/sheet-keys/countries";
import type { Metadata } from "next";
import Link from "next/link";

/**
 * Home page body, shared by `/` (default calendar) and the per-country static variants under
 * `/home-variant/[country]` that next.config.ts rewrites `/` to (lib/home-variants). Reads no
 * cookies, headers or session, so every variant is a static (ISR) page: today's banner, Sunday
 * sheet and season picks come from getHomeToday for the variant's country at render time. The
 * signed-in bits (Save to My Binder) load in the browser (SiteSessionProvider).
 */
export const homeMetadata: Metadata = pageMetadata({
  title: "Catholic Kids Crafts | Free Mass, Bible & Prayer Activities",
  absoluteTitle: true,
  description: SITE_DESCRIPTION,
  path: "/",
});

/** Mom's Bible chips: existing situations only; emoji and title are read from the situation data. */
const MOM_CHIP_KEYS = ["feeling-sad", "afraid-of-the-dark", "great-job", "big-day"] as const;
const SITUATIONS_PATH = "/moms-bible/situations";

/** Days ahead searched for the next liturgical season start ("Advent starts Nov 29"). */
const SEASON_LOOKAHEAD_DAYS = 45;
const DAY = 86_400_000;

function shortDate(ymd: string, weekday = false): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    ...(weekday ? { weekday: "short" as const } : {}),
    month: "short",
    day: "numeric",
  });
}

function nextSeasonStart(ymd: string, current: string): { name: string; date: string } | null {
  const t = Date.parse(`${ymd}T00:00:00Z`);
  for (let i = 1; i <= SEASON_LOOKAHEAD_DAYS; i++) {
    const at = new Date(t + i * DAY);
    const name = getLiturgicalSeason(at).name;
    if (name !== current) return { name, date: at.toISOString().slice(0, 10) };
  }
  return null;
}

/** "Today: St. Leo the Great · Tomorrow: St. Martin of Tours" from getHomeToday only. */
function bannerText(today: HomeToday): { main: string | null; next: string | null } {
  const card = today.banner.card;
  const celebration = today.celebration && !today.celebration.isFeria ? today.celebration.name : null;
  const when = (date: string, daysAway: number) => (daysAway === 1 ? "Tomorrow" : shortDate(date, true));
  if (card?.relation === "today") {
    const tomorrow = today.highlights.find((h) => h.kind === "card" && h.date && h.date === addDay(today.date));
    return { main: `Today: ${card.shortTitle}`, next: tomorrow ? `Tomorrow: ${cardShortTitle(tomorrow)}` : null };
  }
  return {
    main: celebration ? `Today: ${celebration}` : null,
    next: card ? `${when(card.date, card.daysAway)}: ${card.shortTitle}` : null,
  };
}

function addDay(ymd: string): string {
  return new Date(Date.parse(`${ymd}T00:00:00Z`) + DAY).toISOString().slice(0, 10);
}

/** Season whose crafts lead the home "Crafts" row (Advent from the weeks before it). */
function homeCraftSeason(current: string, upcoming: string | null): ResourceSeason | null {
  if (current === "Advent" || upcoming === "Advent") return "advent";
  if (current === "Christmas Season") return "christmas";
  if (current === "Lent" || current === "Holy Week") return "lent";
  if (current === "Easter" || current === "Easter Season") return "easter";
  return null;
}

function highlightIcon(h: HomeHighlight): string {
  if (h.href.startsWith("/catholic-mass-for-kids")) return "⛪";
  if (h.href.startsWith("/liturgy/")) return "📅";
  return "✨";
}

export async function HomeView({ country }: { country: RomcalCountry }) {
  const [copy, sections, sheet] = await Promise.all([
    getSiteCopyMap(),
    getPublishedHomeSections(),
    loadHomeSundaySheet(country),
  ]);
  const today = getHomeToday(undefined, country);
  const contactEmail = getPublicContactEmail();
  const groupInquiryHref = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent("Group / parish inquiry")}`
    : null;

  const { groups } = buildHomePdfNav(sections, {
    gallery: "Gallery",
    curriculum: copyText(copy, "global.nav.curriculum", "Curriculum"),
    resources: copyText(copy, "home.hub.cta_resources", "Kids Resources"),
    play: copyText(copy, "global.nav.play_learn", "Play & Learn"),
  });

  const emailEnabled = emailConfigured();
  const banner = bannerText(today);
  const bannerLabel = [`${today.season.label} · ${shortDate(today.date, true)}`, banner.main, banner.next]
    .filter(Boolean)
    .join(". ");
  const shareHref = today.sunday && sheet?.key === today.sunday.key ? today.sunday.worksheetUrl : "/";
  const word = today.kidMission.word.split("");
  const chips = MOM_CHIP_KEYS.flatMap((key) => {
    const s = getSituation(key);
    return s ? [{ key: s.key, emoji: s.emoji, title: s.title, href: `${SITUATIONS_PATH}#s-${s.key}` }] : [];
  });
  const upcoming = nextSeasonStart(today.date, today.season.name);
  // The activity sheets are Advent ones: show the row in Advent and in the weeks before it.
  const activityPicks =
    today.season.name === "Advent" || upcoming?.name === "Advent" ? homeActivityPicks(today.date) : [];
  const craftSeason = homeCraftSeason(today.season.name, upcoming?.name ?? null);
  const craftPicks = homeCraftPicks(craftSeason);

  return (
    <HomePdfShell groups={groups} dailyMassLabel={copyText(copy, "home.hub.cta_mass", "Daily Mass")}>
      {sheet ? (
        <JsonLd
          nodes={[
            worksheetNode({
              name: sheet.title,
              gospelRef: sheet.gospelRef,
              description: `Free printable Sunday Gospel sheet for ${sheet.liturgicalName} (${sheet.gospelRef}), in two levels.`,
              pagePath: "/",
              isAccessibleForFree: true,
            }),
          ]}
        />
      ) : null}
      <h1 className="sr-only">
        {copyText(copy, "home.hub.title", "Catholic crafts, prayers, and games for kids")}
      </h1>
      <p className="sr-only">
        {copyText(copy, "home.hub.subtitle", "Free liturgical activities for catechists and parents.")}
      </p>
      <div className="relative isolate pb-16 pt-2 sm:pt-3">
        <HomeBackdrop />

        {/* Today banner: season, date and today's (or the next) card. */}
        <Link
          href={today.banner.href}
          aria-label={`${bannerLabel}. ${today.banner.label.replace(/\s*→$/, "")}`}
          className="flex flex-wrap items-center gap-2 rounded-[18px] border border-[#cfe0c7] border-l-8 border-l-[#8fae86] bg-gradient-to-r from-[#e3eedd] to-[#f3f8ef] px-3 py-2.5 text-[#1f2937] no-underline sm:flex-nowrap sm:gap-3 sm:pl-4"
        >
          <span className="h-3 w-3 shrink-0 rounded-full bg-[#4f7a4a]" aria-hidden />
          <span className="min-w-0 flex-1 basis-[calc(100%-4rem)] text-sm sm:basis-auto sm:text-[15px]">
            <b className="text-[#4f7a4a]">
              {today.season.label} · {shortDate(today.date, true)}
            </b>
            {banner.main ? <> &nbsp;🌿 {banner.main}</> : null}
            {banner.next ? <span className="text-[#55615a]"> · {banner.next}</span> : null}
          </span>
          {today.banner.card ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={today.banner.card.thumb}
              alt=""
              width={34}
              height={42}
              className="h-[42px] w-[34px] shrink-0 rounded-md border-2 border-white object-cover shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
            />
          ) : null}
          <span className="w-full whitespace-nowrap rounded-full border-2 border-[#4f7a4a] bg-white px-4 py-1.5 text-center text-sm font-extrabold text-[#4f7a4a] sm:w-auto">
            {today.banner.label}
          </span>
        </Link>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1.55fr_1fr] xl:gap-[18px]">
          {sheet ? (
            <section
              aria-labelledby="home-sunday-title"
              className="flex flex-col justify-center rounded-[26px] border border-[#f1e4d6] bg-gradient-to-br from-[#fff1e2] via-[#fdfaf7] to-[#fdfaf7] p-4 shadow-[0_14px_32px_-18px_rgba(211,84,0,0.4)] sm:col-span-2 sm:p-[22px] xl:col-span-1 xl:row-span-2"
            >
              <SundaySheetHero
                slug={sheet.slug}
                title={sheet.title}
                liturgicalName={sheet.liturgicalName}
                sundayLabel={sheet.sundayLabel}
                gospelRef={sheet.gospelRef}
                printBasePath={sheet.printBasePath}
                shareHref={shareHref}
                groupInquiryHref={groupInquiryHref}
                emailEnabled={emailEnabled}
              />
            </section>
          ) : null}

          {/* Today's Kid Mission: the word comes from this Sunday's Level 1 sheet (getHomeToday). */}
          <section
            aria-labelledby="home-kid-title"
            className="rounded-[26px] border border-[#dbe5f7] bg-gradient-to-br from-[#e3ecfb] via-[#f8faff] to-[#f8faff] px-5 py-[18px]"
          >
            <div className="flex items-center justify-between">
              <h2 id="home-kid-title" className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#3b6fd8]">
                Today&apos;s Kid Mission
              </h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/sidebar/daily-mass.png" alt="" width={46} height={46} className="h-[46px] w-[46px] object-contain" />
            </div>
            <div className="mb-1.5 mt-3.5 flex flex-wrap gap-2" role="img" aria-label={`Type the word ${today.kidMission.word}`}>
              {word.map((ch, i) => (
                <span
                  key={`${ch}-${i}`}
                  className={`flex h-[52px] w-12 items-center justify-center rounded-xl border-2 border-b-[6px] text-2xl font-black sm:h-[58px] sm:w-[54px] sm:text-[28px] ${
                    i < 2
                      ? "border-[#2b57b6] bg-[#3b6fd8] text-white"
                      : i === 2
                        ? "border-[#3b6fd8] bg-white text-[#2b4f9e] shadow-[0_0_0_4px_#3b6fd833]"
                        : "border-[#c9d8f5] bg-white text-[#2b4f9e]"
                  }`}
                >
                  {ch}
                </span>
              ))}
            </div>
            <p className="mb-3 text-[13px] text-[#5b6b8a]">Type the word, win a sticker ⭐</p>
            <div className="flex gap-2.5">
              <Link
                href="/daily-mass"
                className="flex-1 whitespace-nowrap rounded-full bg-[#3b6fd8] px-1.5 py-3 text-center text-sm font-extrabold text-white no-underline hover:bg-[#2b57b6]"
              >
                ⌨️ Type &amp; Get Sticker
              </Link>
              <Link
                href="/play/church"
                className="flex-1 whitespace-nowrap rounded-full border-2 border-[#3b6fd8] bg-white px-1.5 py-2.5 text-center text-sm font-extrabold text-[#2b57b6] no-underline hover:bg-[#f3f7ff]"
              >
                ⛪ Play Mass Game
              </Link>
            </div>
          </section>

          {/* Mom's Bible: chips are existing situations and open that situation on /moms-bible/situations. */}
          <section
            aria-labelledby="home-mom-title"
            className="rounded-[26px] border border-[#f3e6b5] bg-gradient-to-br from-[#fdf3c7] via-[#fffdf5] to-[#fffdf5] px-5 py-[18px]"
          >
            <div className="flex items-center justify-between">
              <h2 id="home-mom-title" className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#a87b00]">
                Mom&apos;s Bible · Today my child is…
              </h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/sidebar/moms-bible.png" alt="" width={46} height={46} className="h-[46px] w-[46px] object-contain" />
            </div>
            <ul className="my-3.5 flex flex-wrap gap-2">
              {chips.map((c) => (
                <li key={c.key}>
                  <Link
                    href={c.href}
                    className="inline-block rounded-full border-[1.5px] border-[#ecd98f] bg-white px-3.5 py-2 text-sm font-bold text-[#5a4500] no-underline hover:bg-[#fffaf0]"
                  >
                    <span aria-hidden>{c.emoji}</span> {c.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/kids"
              className="block rounded-full bg-[#a87b00] px-3 py-3 text-center text-[15px] font-extrabold text-white no-underline hover:bg-[#8f6900]"
            >
              🔑 Kid Code Login
            </Link>
          </section>
        </div>

        {/* Season picks: two upcoming cards, then two curated links (getHomeToday.highlights). */}
        <section aria-labelledby="home-season-title" className="mt-7">
          <h2 id="home-season-title" className="mb-3 flex flex-wrap items-baseline gap-x-2.5 text-xl font-bold text-[#1f2937]">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#d35400]">Coming up</span>
            {upcoming ? `${upcoming.name} starts ${shortDate(upcoming.date)}` : today.season.label}
          </h2>
          <ul className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
            {today.highlights.map((h, i) => (
              <li key={`${h.href}-${i}`}>
                <Link
                  href={h.href}
                  className="block h-full overflow-hidden rounded-[20px] border border-[#f1e4d6] bg-white text-[#1f2937] no-underline shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)] hover:shadow-[0_10px_22px_-12px_rgba(0,0,0,0.35)]"
                >
                  {h.kind === "card" && h.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={h.thumb}
                      alt=""
                      loading="lazy"
                      className="block aspect-[4/3] w-full bg-[#fbf6f0] object-cover object-[center_40%]"
                    />
                  ) : (
                    <span className="flex aspect-[4/3] w-full items-center justify-center bg-[#fbf6f0] text-5xl" aria-hidden>
                      {highlightIcon(h)}
                    </span>
                  )}
                  <span className="block px-3 pb-3 pt-2.5">
                    <span className="block text-xs font-extrabold text-[#d35400]">
                      {h.kind === "card" && h.date ? shortDate(h.date) : today.season.label}
                    </span>
                    <span className="block text-[15px] font-bold leading-snug">
                      {h.kind === "card" ? cardShortTitle(h) : h.title}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Activities & crafts: today's scheduled sheet, the next ones, and the Plus craft (homeActivityPicks). */}
        {activityPicks.length > 0 ? (
          <section aria-labelledby="home-activities-title" className="mt-5">
            <h2
              id="home-activities-title"
              className="mb-3 flex flex-wrap items-baseline gap-x-2.5 text-xl font-bold text-[#1f2937]"
            >
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#d35400]">Activities &amp; crafts</span>
              Print, colour and make for Advent
              <Link
                href="/resource?view=all&season=advent"
                className="ml-auto text-sm font-bold text-[#d35400] no-underline hover:underline"
              >
                See all →
              </Link>
            </h2>
            <ul className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
              {activityPicks.map(({ activity, label, access }) => (
                <li key={activity.slug}>
                  <Link
                    href={activityPath(activity.slug)}
                    className="relative block h-full overflow-hidden rounded-[20px] border border-[#f1e4d6] bg-white text-[#1f2937] no-underline shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)] hover:shadow-[0_10px_22px_-12px_rgba(0,0,0,0.35)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activity.previews.color}
                      alt=""
                      loading="lazy"
                      className="block aspect-[4/3] w-full bg-[#fbf6f0] object-cover object-top"
                    />
                    {access === "plus" ? (
                      <span aria-hidden className="absolute right-2 top-2 rounded-full bg-[#d35400] px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-white">
                        PLUS
                      </span>
                    ) : null}
                    <span className="block px-3 pb-3 pt-2.5">
                      <span className="block text-xs font-extrabold text-[#d35400]">{label}</span>
                      <span className="block text-[15px] font-bold leading-snug">{activity.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Crafts: the Plus craft templates, this season's first (homeCraftPicks). Centre crop shows the finished craft. */}
        {craftPicks.length > 0 ? (
          <section aria-labelledby="home-crafts-title" className="mt-5">
            <h2 id="home-crafts-title" className="mb-3 flex flex-wrap items-baseline gap-x-2.5 text-xl font-bold text-[#1f2937]">
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#d35400]">Crafts</span>
              Cut, fold and glue
              <Link href={CRAFTS_LIST_PATH} className="ml-auto text-sm font-bold text-[#d35400] no-underline hover:underline">
                See all →
              </Link>
            </h2>
            <ul className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
              {craftPicks.map((craft) => (
                <li key={craft.slug}>
                  <Link
                    href={activityPath(craft.slug)}
                    className="relative block h-full overflow-hidden rounded-[20px] border border-[#f1e4d6] bg-white text-[#1f2937] no-underline shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)] hover:shadow-[0_10px_22px_-12px_rgba(0,0,0,0.35)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={craft.previews.color}
                      alt=""
                      loading="lazy"
                      className="block aspect-[4/3] w-full bg-[#fbf6f0] object-cover object-center"
                    />
                    <span aria-hidden className="absolute right-2 top-2 rounded-full bg-[#d35400] px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-white">
                      PLUS
                    </span>
                    <span className="block px-3 pb-3 pt-2.5">
                      <span className="block text-xs font-extrabold text-[#d35400]">{craft.kind} · Plus</span>
                      <span className="block text-[15px] font-bold leading-snug">{craft.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </HomePdfShell>
  );
}
