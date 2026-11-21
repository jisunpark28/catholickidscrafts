/** Run: tsx scripts/test-activities.ts */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import MODEL from "../src/data/activities/happy-new-church-year.model.json";
import seedJson from "../prisma/data/liturgy-qa-cards.json";
import {
  activityDownloadPath,
  activityForTryThis,
  CRAFTS_LIST_PATH,
  dailyActivityFor,
  FAMILY_ADVENT_CALENDAR_SLUG,
  HOME_CRAFT_PICKS,
  homeCraftPicks,
  HOME_ACTIVITY_PICKS,
  homeActivityPicks,
  homeActivityRowVisible,
  activityAccessInWeekOf,
  isActivityFreeInWeekOf,
  isActivityFreeThisWeek,
  annunciationDate,
  lectionaryCycle,
  recurringActivitySlug,
  SAINT_REPORT_SLUG,
  SUNDAY_CRAFT_SLUG,
  torontoDate,
  activityEditPath,
  activityFileName,
  activityPath,
  getActivity,
  listActivities,
  RESOURCE_ACTIVITIES,
} from "../src/lib/resource/activities";
import {
  applyBox,
  parseActivityDoc,
  parsePath,
  rawBounds,
  resized,
  transformedSegments,
  withVariant,
  type ActivityEl,
} from "../src/lib/resource/activity-doc";
import { getActivityModel } from "../src/lib/resource/activity-models";
import { PRAYER_SHEET_ROWS } from "../src/lib/resource/prayer-sheet-list";
import { buildResourcesSitemap } from "../src/lib/sitemap-entries";
import { createActivityDownloadHandler, type ActivityDownloadDeps } from "../src/lib/resource/activity-download";
import { ActivityFileUnavailableError } from "../src/lib/resource/activity-files";
import { craftBlobPathname } from "../src/lib/resource/craft-blobs";
import { weekSundayOf } from "../src/lib/resource/week";
import { getLiturgicalSeason } from "../src/lib/liturgical-season";
import { NextResponse } from "next/server";

async function main() {
  const a = getActivity("happy-new-church-year");
  assert.ok(a);
  assert.equal(activityPath(a.slug), "/resource/activity/happy-new-church-year");
  assert.equal(activityEditPath(a.slug), "/resource/activity/happy-new-church-year/edit");
  assert.equal(activityDownloadPath(a.slug, "color"), "/api/resource/activities/happy-new-church-year/download?variant=color");
  assert.equal(activityFileName(a, "bw"), "catholickidscrafts-happy-new-church-year.pdf");
  assert.deepEqual(a.seasons, ["advent"]);
  assert.ok(!("age" in a) && !("grade" in a), "activities have no age/grade field");

  for (const act of RESOURCE_ACTIVITIES) {
    for (const v of ["bw", "color"] as const) {
      await fs.access(path.join("public", act.previews[v]));
      if (act.storage === "blob") continue;
      const pdf = await fs.readFile(path.join("assets", "activities", act.slug, act.files[v]));
      assert.equal(pdf.subarray(0, 5).toString(), "%PDF-", `${act.slug} ${v} is a PDF`);
    }
    // PDFs must not be public.
    await assert.rejects(fs.access(path.join("public", act.files.bw)));
  }

  const doc = parseActivityDoc(MODEL);
  assert.ok(doc, "model parses");
  assert.equal(doc.width, 612);
  assert.equal(doc.height, 792);
  const kinds = new Map<string, number>();
  for (const el of doc.elements) kinds.set(el.kind, (kinds.get(el.kind) ?? 0) + 1);
  const dots = doc.elements.filter((e) => e.name === "Dot");
  assert.ok(dots.length > 200, "write-in lines are individual dots");
  assert.ok(doc.elements.some((e) => e.group === "Doodle: 4 candles"));
  for (const t of ["Happy New Church Year", "Colour the seasons of the Church year.", "Jesus", "My favorite feast:", "This Advent I will:", "catholickidscrafts.com"]) {
    assert.ok(doc.elements.some((e) => e.kind === "text" && e.text === t), t);
  }
  assert.ok(
    doc.elements.some((e) => e.kind === "text" && e.text === "The new Church year begins on the First Sunday of Advent."),
  );
  const color = withVariant(doc, "color");
  const changed = color.elements.filter((e, i) => e.fill !== doc.elements[i]!.fill);
  assert.ok(changed.length >= 9, "colour variant recolours the wheel and the key");
  assert.deepEqual(withVariant(color, "bw").elements.map((e) => e.fill), doc.elements.map((e) => e.fill));

  // Geometry helpers.
  assert.deepEqual(parsePath("M0 0 L10 0 C1 2 3 4 5 6 Z").map((s) => s.op), ["m", "l", "c", "h"]);
  const line = doc.elements.find((e) => e.kind === "line")! as Exclude<ActivityEl, { kind: "text" }>;
  const from = applyBox(line, rawBounds(line));
  const big = resized(line, from, { x: from.x, y: from.y, w: from.w * 2, h: from.h * 2 }) as typeof line;
  const nb = applyBox(big, rawBounds(big));
  assert.ok(Math.abs(nb.w - from.w * 2) < 1e-6 && Math.abs(nb.x - from.x) < 1e-6);
  assert.equal(transformedSegments(big).length, 2);

  // Bad input is rejected.
  assert.equal(parseActivityDoc({ ...doc, elements: [{ ...doc.elements[0], fill: "red; x" }] }), null);
  assert.equal(parseActivityDoc({ ...doc, elements: [{ ...doc.elements[0], kind: "image" }] }), null);
  assert.equal(parseActivityDoc({ ...doc, elements: [doc.elements[0], doc.elements[0]] }), null, "duplicate ids");

  // Access checks stay on the server.
  const route = await fs.readFile("src/app/api/resource/activities/[slug]/download/route.ts", "utf8");
  assert.ok(
    route.includes("guard: parentApiGuard") && route.includes("hasPlus: familyHasPlus") && route.includes("plusRequired: plusRequiredResponse"),
    "route wires the real session and Plus checks",
  );
  const dl = await fs.readFile("src/lib/resource/activity-download.ts", "utf8");
  assert.ok(dl.includes("deps.guard()"), "download needs a signed-in parent");
  assert.ok(dl.includes("private, no-store"));
  const ed = await fs.readFile("src/app/api/resource/activities/[slug]/editor/route.ts", "utf8");
  assert.ok(ed.includes("parentApiGuard()") && ed.includes("familyHasPlus("), "editor model needs Plus");
  const page = await fs.readFile("src/app/(site)/resource/activity/[slug]/page.tsx", "utf8");
  assert.ok(!page.includes("activity-models") && !page.includes("cookies("), "detail page stays static and never ships the model");

  // Plus-only downloads (everything not free this week) are checked on the server too, per request.
  assert.ok(dl.includes("isActivityFreeThisWeek(") && dl.includes("deps.hasPlus(") && dl.includes("deps.plusRequired()"));
  assert.ok(dl.indexOf("deps.guard()") < dl.indexOf("deps.hasPlus(") && dl.indexOf("deps.hasPlus(") < dl.indexOf("deps.readPdf("), "401 before 402 before any file");

  // Same order at runtime, with the session, Plus and Blob reads mocked.
  {
    const calls: string[] = [];
    const json = (status: number) => NextResponse.json({ status }, { status });
    const deps = (o: { signedIn: boolean; plus: boolean; file?: "ok" | "missing" | "down"; now?: string }): ActivityDownloadDeps => ({
      guard: async () => (calls.push("guard"), o.signedIn ? { session: { familyAccountId: "fam1" } } : { error: json(401) }),
      hasPlus: async () => (calls.push("plus"), o.plus),
      plusRequired: () => json(402),
      rateLimitState: async () => (calls.push("limit"), { blocked: false }),
      recordRateLimit: async () => calls.push("record"),
      readPdf: async (act, variant) => {
        calls.push(`read:${act.storage}:${variant}`);
        if (o.file === "down") throw new ActivityFileUnavailableError("down");
        if (o.file === "missing") return null;
        return { body: new Blob(["%PDF-1.4 test"]).stream(), size: 13 };
      },
      isUnavailable: (e) => e instanceof ActivityFileUnavailableError,
      // Monday Dec 7, 2026 (Toronto) unless a test passes another time.
      now: () => new Date(o.now ?? "2026-12-07T17:00:00Z"),
    });
    const run = async (slug: string, o: Parameters<typeof deps>[0], variant = "color") => {
      calls.length = 0;
      const res = await createActivityDownloadHandler(deps(o))(
        new Request(`http://x/api/resource/activities/${slug}/download?variant=${variant}`),
        { params: Promise.resolve({ slug }) },
      );
      return { status: res.status, calls: [...calls], res };
    };
    let r = await run("magi-gifts", { signedIn: false, plus: false, file: "ok" });
    assert.deepEqual([r.status, r.calls], [401, ["guard"]], "signed out: 401, no Plus check, no Blob read");
    r = await run("magi-gifts", { signedIn: true, plus: false, file: "ok" });
    assert.deepEqual([r.status, r.calls], [402, ["guard", "plus"]], "not Plus: 402, no Blob read");
    r = await run("magi-gifts", { signedIn: true, plus: true, file: "ok" });
    assert.deepEqual([r.status, r.calls], [200, ["guard", "plus", "limit", "read:blob:color", "record"]], "Plus: Blob read after the checks");
    assert.equal(r.res.headers.get("content-type"), "application/pdf");
    assert.equal(r.res.headers.get("cache-control"), "private, no-store");
    assert.match(r.res.headers.get("content-disposition") ?? "", /catholickidscrafts-magi-gifts-color\.pdf/);
    assert.equal(await r.res.text(), "%PDF-1.4 test", "the blob is streamed through the route");
    assert.ok(![...r.res.headers.values()].some((v) => /blob\.vercel-storage|crafts\//.test(v)), "no Blob URL or pathname in the response");
    r = await run("visitation-popup", { signedIn: true, plus: true, file: "missing" }, "bw");
    assert.deepEqual([r.status, r.calls.at(-1)], [404, "read:blob:bw"]);
    r = await run("visitation-popup", { signedIn: true, plus: true, file: "down" });
    assert.equal(r.status, 503, "Blob not reachable");
    r = await run("prepare-the-way", { signedIn: true, plus: false, file: "ok", now: "2026-12-03T17:00:00Z" }, "bw");
    assert.deepEqual([r.status, r.calls], [200, ["guard", "limit", "read:bundle:bw", "record"]], "Advent week 1 weekday: free, no Plus check");
    r = await run("light-the-advent-candle", { signedIn: true, plus: false, file: "ok", now: "2026-12-06T17:00:00Z" }, "bw");
    assert.equal(r.status, 200, "Second Sunday of Advent 2026: the wreath sheet is free");
    r = await run("light-the-advent-candle", { signedIn: true, plus: false, file: "ok", now: "2027-12-12T17:00:00Z" }, "bw");
    assert.equal(r.status, 200, "Gaudete Sunday 2027: the wreath sheet is free");
    r = await run("roses-for-mary", { signedIn: true, plus: false, file: "ok", now: "2027-12-12T17:00:00Z" }, "bw");
    assert.equal(r.status, 200, "Guadalupe on an Advent Sunday still unlocks that week");
    r = await run(FAMILY_ADVENT_CALENDAR_SLUG, { signedIn: true, plus: false, file: "ok", now: "2027-12-01T17:00:00Z" }, "bw");
    assert.equal(r.status, 200, "family calendar is free through Advent in another year");
    r = await run(FAMILY_ADVENT_CALENDAR_SLUG, { signedIn: true, plus: false, file: "ok", now: "2026-11-01T17:00:00Z" }, "bw");
    assert.equal(r.status, 402, "family calendar stays Plus before Advent");
    r = await run("prepare-the-way", { signedIn: true, plus: false, file: "ok", now: "2026-11-19T15:00:00Z" }, "bw");
    assert.deepEqual([r.status, r.calls], [402, ["guard", "plus"]], "not this week's sheet: Plus only");
    r = await run("prepare-the-way", { signedIn: true, plus: true, file: "ok", now: "2026-11-19T15:00:00Z" }, "bw");
    assert.equal(r.status, 200, "Plus downloads any week");
    r = await run(SAINT_REPORT_SLUG, { signedIn: true, plus: false, file: "ok" }, "bw");
    assert.deepEqual([r.status, r.calls], [402, ["guard", "plus"]], "no scheduled date: Plus only");
    r = await run("nope", { signedIn: true, plus: true, file: "ok" });
    assert.deepEqual([r.status, r.calls], [404, []]);
  }

  // Craft PDFs live only in the private Blob store, under server-only pathnames.
  for (const act of RESOURCE_ACTIVITIES) {
    if (act.storage === "blob") {
      assert.ok(act.kind === "Craft" && !act.editable, `${act.slug}: only ready-made crafts use Blob`);
      assert.equal(craftBlobPathname(act, "bw"), `crafts/${act.slug}/${act.slug}.pdf`);
      assert.equal(craftBlobPathname(act, "color"), `crafts/${act.slug}/${act.slug}-color.pdf`);
      await assert.rejects(fs.access(path.join("assets", "activities", act.slug)), `${act.slug}: no PDF folder under assets/`);
    } else {
      assert.equal(craftBlobPathname(act, "bw"), null);
    }
  }
  const assetDirs = await fs.readdir(path.join("assets", "activities"));
  assert.deepEqual(
    assetDirs.sort(),
    RESOURCE_ACTIVITIES.filter((a) => a.storage === "bundle").map((a) => a.slug).sort(),
    "assets/activities holds only the editor-backed sheets",
  );
  // Server-only modules never reach a client component or page.
  const srcFiles = (await fs.readdir("src", { recursive: true })).map(String).filter((f) => /\.(tsx?|jsx?)$/.test(f));
  for (const f of srcFiles) {
    const text = await fs.readFile(path.join("src", f), "utf8");
    if (/^\s*["']use client["']/.test(text)) {
      assert.ok(!/craft-blobs|activity-files|card-originals|@vercel\/blob/.test(text), `${f} must not import server-only Blob code`);
    }
    if (/(^|[\\/])page\.tsx$/.test(f)) assert.ok(!/craft-blobs|activity-files/.test(text), `${f} must not import craft storage`);
  }
  const nextConfig = await fs.readFile("next.config.ts", "utf8");
  assert.ok(!nextConfig.includes("crafts"), "craft PDFs are not traced into the bundle");

  const sitemap = new Set(buildResourcesSitemap().map((e) => new URL(e.url).pathname));
  for (const act of RESOURCE_ACTIVITIES) {
    assert.ok(sitemap.has(activityPath(act.slug)), `sitemap ${act.slug}`);
    assert.ok(!sitemap.has(activityEditPath(act.slug)));
  }

  // Every editable activity has a valid editor model; none has age fields; slugs are unique.
  assert.equal(new Set(RESOURCE_ACTIVITIES.map((x) => x.slug)).size, RESOURCE_ACTIVITIES.length);
  const editPage = await fs.readFile("src/app/(site)/resource/activity/[slug]/edit/page.tsx", "utf8");
  assert.ok(editPage.includes("filter((a) => a.editable)") && editPage.includes("!activity?.editable"), "no editor page without a model");
  for (const act of RESOURCE_ACTIVITIES.filter((x) => !x.editable)) {
    assert.equal(getActivityModel(act.slug), null, `${act.slug} has no editor model`);
    assert.ok(act.access === "plus" && act.kind === "Craft", `${act.slug} is a Plus craft`);
    for (const k of Object.keys(act)) assert.ok(!/^(age|ages|ageRange|minAge|maxAge|grade|grades)$/i.test(k), `${act.slug}: no ${k}`);
    assert.ok(!/\bages?\b|\bgrade\b|years old/i.test(JSON.stringify([act.title, act.summary, act.description])), `${act.slug} mentions no ages`);
  }
  for (const act of RESOURCE_ACTIVITIES.filter((x) => x.editable)) {
    const m = getActivityModel(act.slug);
    assert.ok(m && parseActivityDoc(m), `${act.slug} model parses`);
    assert.equal(m.slug, act.slug);
    assert.ok(m.elements.length < 5000);
    assert.ok(m.elements.some((e) => e.kind === "text" && e.text === "catholickidscrafts.com"), `${act.slug} footer`);
    assert.ok(m.elements.some((e) => e.palette), `${act.slug} has a colour palette`);
    for (const k of Object.keys(act)) assert.ok(!/^(age|ages|ageRange|minAge|maxAge|grade|grades)$/i.test(k), `${act.slug}: no ${k}`);
    // Prayer worksheets quote official prayer text ("before all ages", "for age upon age"): not an age label.
    const sheetText = m.elements.filter((e) => e.kind === "text").map((e) => (e as { text: string }).text);
    const pageText = act.kind === "Prayer worksheet" ? sheetText.map((t) => t.replace(/\bages?\b/gi, "")) : sheetText;
    const words = JSON.stringify([act.title, act.summary, act.description, pageText]);
    assert.ok(!/\bages?\b|\bgrade\b|years old/i.test(words), `${act.slug} mentions no ages`);
  }

  // Catalog gate: "plus" for the crafts and the Saint Report Worksheet; the rest are free only in their scheduled week.
  const craft = getActivity(SUNDAY_CRAFT_SLUG);
  assert.ok(craft && craft.access === "plus" && craft.kind === "Craft");
  const UPLOADED = ["advent-bank", "advent-lantern", "fiat-flag", "gabriel-wings", "joseph-lily", "birthday-card", "swaddle-baby", "gloria-trumpet", "shepherd-crook", "bethlehem-star", "magi-gifts",
    "angel-choir", "baptism-dove-mobile", "christmas-eve-lantern", "emmanuel-door-hanger", "epiphany-chalk-blessing", "flight-into-egypt", "heart-ornaments",
    "holy-family-mobile", "john-the-baptist-card", "magi-finger-puppets", "manger-banner", "newborn-king-crown", "pondering-heart", "visitation-popup"];
  assert.equal(new Set(RESOURCE_ACTIVITIES.map((x) => x.title)).size, RESOURCE_ACTIVITIES.length, "titles are unique");
  assert.deepEqual(
    RESOURCE_ACTIVITIES.filter((x) => x.access === "plus").map((x) => x.slug),
    [SUNDAY_CRAFT_SLUG, SAINT_REPORT_SLUG, ...UPLOADED, ...PRAYER_SHEET_ROWS.map((r) => r[0])],
  );
  // Prayer worksheets: Plus, editable, never a day's free sheet.
  for (const [slug] of PRAYER_SHEET_ROWS) {
    const a = getActivity(slug)!;
    assert.ok(a.access === "plus" && a.editable && a.kind === "Prayer worksheet", slug);
    assert.ok(!isActivityFreeInWeekOf(a, "2026-12-06"), `${slug} is not free in Advent`);
  }
  for (const slug of UPLOADED) {
    const c = getActivity(slug)!;
    assert.ok(c.kind === "Craft" && !c.editable && c.tryThis.length === 0 && c.seasons.length > 0, slug);
    assert.ok(listActivities().some((x) => x.slug === slug), `${slug} is in the Printables library`);
    assert.ok(c.previews.color.endsWith(`/${slug}/preview-color.webp`));
  }

  // Home "Crafts" row: four Plus crafts, this season's first, never the Advent Candle Craft (shown above).
  for (const season of ["advent", "christmas", "lent", null] as const) {
    const picks = homeCraftPicks(season);
    assert.equal(picks.length, HOME_CRAFT_PICKS, `${season}: four crafts`);
    assert.ok(picks.every((p) => p.access === "plus" && p.kind === "Craft" && p.slug !== SUNDAY_CRAFT_SLUG), `${season}: Plus crafts`);
    if (season === "advent" || season === "christmas") assert.ok(picks.every((p) => p.seasons.includes(season)), `${season} crafts first`);
  }
  assert.deepEqual(homeCraftPicks("advent").map((p) => p.slug), ["advent-bank", "advent-lantern", "fiat-flag", "gabriel-wings"]);
  const homeView = await fs.readFile("src/app/(site)/home-view.tsx", "utf8");
  assert.ok(homeView.includes("homeCraftPicks(craftSeason)") && homeView.includes("CRAFTS_LIST_PATH"), "home Crafts row");
  assert.ok(homeView.indexOf("home-crafts-title") > homeView.indexOf("home-activities-title"), "Crafts row is the last row");
  assert.equal(CRAFTS_LIST_PATH, "/resource?view=all&q=craft");

  // Each daily sheet matches an Advent Q&A "Try this" tip verbatim (official site content).
  const advent = (seedJson as { cards: { topicSlug: string; tryThis?: string }[] }).cards.filter((c) => c.topicSlug === "advent");
  for (const act of RESOURCE_ACTIVITIES.filter((x) => x.access === "signin")) {
    for (const t of act.tryThis) {
      assert.ok(advent.some((c) => c.tryThis === t), `${act.slug} tip is on the Advent Q&A: ${t}`);
      assert.equal(activityForTryThis(t)?.slug, act.slug);
    }
  }

  // Daily sheet follows the liturgical calendar in every year, including Advent 2026.
  assert.equal(dailyActivityFor("2026-11-12").activity.slug, "yes-with-a-smile");
  assert.equal(dailyActivityFor("2026-11-13").activity.slug, "yes-with-a-smile");
  assert.ok(dailyActivityFor("2026-11-13").exact);
  assert.equal(dailyActivityFor("2026-11-29").activity.slug, "light-the-advent-candle", "Advent 1");
  assert.equal(dailyActivityFor("2026-12-03").activity.slug, "prepare-the-way", "Advent week 1 Thursday");
  assert.ok(dailyActivityFor("2026-12-03").exact);
  assert.equal(dailyActivityFor("2026-12-06").activity.slug, "light-the-advent-candle", "Advent 2 Sunday, not the old dated list");
  assert.equal(dailyActivityFor("2026-12-08").activity.slug, "white-flower-for-mary");
  assert.equal(dailyActivityFor("2026-12-13").activity.slug, "light-the-advent-candle", "Gaudete Sunday");
  assert.equal(dailyActivityFor("2026-12-20").activity.slug, "yes-with-a-smile", "Advent 4, Year B");
  assert.equal(dailyActivityFor("2027-12-19").activity.slug, "helping-hands-like-mary", "Advent 4, Year C");
  assert.equal(dailyActivityFor("2026-12-24").activity.slug, "straw-for-the-manger");
  assert.equal(dailyActivityFor("2026-12-25").activity.slug, "yes-with-a-smile", "Christmas Time");
  assert.equal(dailyActivityFor("2026-12-25").exact, true);
  assert.equal(dailyActivityFor("2026-11-01").activity.slug, "secret-kindness-notes", "Ordinary Time");
  assert.equal(dailyActivityFor("nope").activity.slug, "happy-new-church-year");
  assert.equal(torontoDate(new Date("2026-11-13T04:30:00Z")), "2026-11-12", "11:30 PM in Toronto is still Nov 12");
  assert.equal(torontoDate(new Date("2026-11-13T05:30:00Z")), "2026-11-13");
  assert.equal(torontoDate(new Date("2026-11-29T04:59:00Z")), "2026-11-28", "11:59 PM Toronto on Nov 28");
  assert.equal(torontoDate(new Date("2026-11-29T05:00:00Z")), "2026-11-29", "midnight Toronto starts Advent");

  // Weekly free rule: Monday to Sunday weeks ending on "This Sunday" (Toronto dates), same as the Sunday sheet.
  assert.equal(weekSundayOf("2026-11-16"), "2026-11-22");
  assert.equal(weekSundayOf("2026-11-19"), "2026-11-22");
  assert.equal(weekSundayOf("2026-11-22"), "2026-11-22", "a Sunday ends its own week");
  assert.equal(weekSundayOf("2026-11-23"), "2026-11-29");
  const thisSundaySrc = await fs.readFile("src/lib/resource/this-sunday.ts", "utf8");
  assert.ok(thisSundaySrc.includes("weekSundayOf(today)"), "This Sunday uses the same week boundary");
  const freeOn = (ymd: string) => RESOURCE_ACTIVITIES.filter((a) => isActivityFreeInWeekOf(a, ymd)).map((a) => a.slug).sort();
  assert.deepEqual(
    freeOn("2026-11-19"),
    ["happy-new-church-year", "secret-kindness-notes"],
    "Nov 16 to 22: the ordinary-time sheet, and Happy New Church Year on Christ the King",
  );
  assert.deepEqual(
    freeOn("2026-11-28"),
    ["family-advent-calendar", "happy-new-church-year", "light-the-advent-candle"],
    "the week Advent begins: the wheel, the wreath, and the calendar",
  );
  assert.deepEqual(freeOn("2026-11-29"), freeOn("2026-11-28"), "Nov 28 and Nov 29 are the same Monday–Sunday week");
  assert.deepEqual(freeOn("2026-12-06"), [
    "come-lord-jesus",
    "family-advent-calendar",
    "jesse-tree-ornaments",
    "light-the-advent-candle",
    "paper-advent-wreath",
    "prepare-the-way",
    "secret-kindness-notes",
  ]);
  assert.deepEqual(freeOn("2026-12-13"), [
    "colour-the-advent-candles",
    "family-advent-calendar",
    "light-the-advent-candle",
    "roses-for-mary",
    "secret-kindness-notes",
    "straw-for-the-manger",
    "white-flower-for-mary",
  ]);
  assert.deepEqual(freeOn("2026-12-20"), [
    "come-lord-jesus",
    "family-advent-calendar",
    "jesse-tree-picture-a-day",
    "o-antiphon-ornaments",
    "straw-for-the-manger",
    "yes-with-a-smile",
  ]);
  assert.ok(freeOn("2026-12-24").includes("straw-for-the-manger") && freeOn("2026-12-24").includes("o-antiphon-ornaments"));
  assert.ok(freeOn("2027-12-12").includes("roses-for-mary"), "2027 Guadalupe falls on Sunday and still unlocks");
  assert.ok(freeOn("2027-12-12").includes("light-the-advent-candle"));
  assert.ok(isActivityFreeInWeekOf(getActivity("helping-hands-like-mary")!, "2027-12-19"), "Year C Advent 4");
  assert.ok(!isActivityFreeInWeekOf(getActivity("helping-hands-like-mary")!, "2026-12-20"), "Year B Advent 4 is Mary's yes");
  assert.ok(!freeOn("2026-11-01").includes("family-advent-calendar"));
  assert.ok(freeOn("2027-11-28").includes("family-advent-calendar"), "the calendar is free in Advent 2027");
  assert.deepEqual(freeOn("2026-11-16"), freeOn("2026-11-22"), "same week, same free sheets");
  assert.ok(!isActivityFreeInWeekOf(getActivity("yes-with-a-smile")!, "2026-11-16"), "Sunday Nov 15 belongs to the week before");
  assert.ok(isActivityFreeInWeekOf(getActivity("yes-with-a-smile")!, "2026-11-15"));
  assert.ok(!isActivityFreeInWeekOf(getActivity(SAINT_REPORT_SLUG)!, "2026-11-19"), "no scheduled date: Plus only");
  assert.ok(!isActivityFreeInWeekOf(craft, "2026-11-29"), "a Plus craft is never free");
  assert.deepEqual(freeOn("2027-01-05"), ["yes-with-a-smile"], "after the schedule: the year-round rule keeps one sheet free");

  // Year-round rule (every year, from the liturgical calendar).
  assert.deepEqual([lectionaryCycle(2025), lectionaryCycle(2026), lectionaryCycle(2027), lectionaryCycle(2028)], ["A", "B", "C", "A"]);
  assert.equal(recurringActivitySlug("2027-12-19"), "helping-hands-like-mary", "Advent 4, Year C: the Visitation");
  assert.equal(recurringActivitySlug("2028-12-24"), "straw-for-the-manger", "Advent 4, Year A (Joseph's dream): no Joseph sheet, the manger");
  assert.equal(recurringActivitySlug("2029-12-23"), "yes-with-a-smile", "Advent 4, Year B: the Annunciation");
  assert.equal(recurringActivitySlug("2027-11-28"), "light-the-advent-candle", "First Sunday of Advent");
  assert.equal(recurringActivitySlug("2027-12-08"), "white-flower-for-mary");
  assert.equal(recurringActivitySlug("2027-12-12"), "light-the-advent-candle", "Third Sunday of Advent outranks Guadalupe");
  assert.equal(recurringActivitySlug("2028-12-12"), "roses-for-mary", "Our Lady of Guadalupe");
  assert.equal(recurringActivitySlug("2030-12-09"), "white-flower-for-mary", "Immaculate Conception moved from Sunday Dec 8, 2030");
  assert.equal(recurringActivitySlug("2027-12-06"), "secret-kindness-notes");
  assert.equal(recurringActivitySlug("2027-12-17"), "o-antiphon-ornaments");
  assert.equal(recurringActivitySlug("2027-12-24"), "straw-for-the-manger");
  assert.equal(recurringActivitySlug("2027-11-24"), "happy-new-church-year", "Christ the King week");
  assert.equal(recurringActivitySlug("2027-05-31"), "helping-hands-like-mary", "the Visitation");
  assert.equal(recurringActivitySlug("2027-06-24"), "prepare-the-way", "Nativity of Saint John the Baptist");
  // The Annunciation (UNLY 60): Holy Week or the Easter Octave -> Monday after the Second Sunday of Easter; a Lent Sunday -> Monday.
  assert.equal(annunciationDate(2027), "2027-04-05", "2027: March 25 is Holy Thursday -> Monday, April 5 (USCCB 2027 calendar)");
  assert.equal(recurringActivitySlug("2027-04-05"), "yes-with-a-smile");
  assert.notEqual(recurringActivitySlug("2027-03-25"), "yes-with-a-smile", "not on Holy Thursday 2027");
  assert.ok(isActivityFreeInWeekOf(getActivity("yes-with-a-smile")!, "2027-04-07"), "free in the week of April 5, 2027");
  assert.equal(annunciationDate(2028), "2028-03-25", "2028: a Lenten Saturday, no move");
  assert.equal(recurringActivitySlug("2028-03-25"), "yes-with-a-smile");
  assert.equal(annunciationDate(2029), "2029-04-09", "2029: March 25 is Palm Sunday -> Monday after the Second Sunday of Easter");
  assert.equal(recurringActivitySlug("2029-04-09"), "yes-with-a-smile");
  assert.notEqual(recurringActivitySlug("2029-03-25"), "yes-with-a-smile", "not on Palm Sunday 2029");
  assert.equal(annunciationDate(2026), "2026-03-25", "2026: a Lenten Wednesday");
  assert.equal(annunciationDate(2035), "2035-04-02", "2035: March 25 is Easter Sunday -> after the Octave");
  assert.equal(annunciationDate(2057), "2057-03-26", "2057: March 25 is a Sunday of Lent -> Monday, March 26");
  for (let year = 2026; year <= 2100; year++) {
    const a = annunciationDate(year);
    const season = getLiturgicalSeason(new Date(`${a}T00:00:00Z`)).name;
    assert.ok(season === "Lent" || season === "Easter Season", `${year}: ${a} is in Lent or after the Octave`);
    assert.notEqual(new Date(`${a}T00:00:00Z`).getUTCDay(), 0, `${year}: never on a Sunday`);
  }
  assert.equal(recurringActivitySlug("2027-01-01"), "yes-with-a-smile", "Mary, the Holy Mother of God");
  assert.equal(recurringActivitySlug("nope"), null);
  const ADVENT_ONLY = new Set(["jesse-tree-ornaments", "jesse-tree-picture-a-day", "o-antiphon-ornaments", "family-advent-calendar", "colour-the-advent-candles",
    "paper-advent-wreath", "light-the-advent-candle", "come-lord-jesus", "straw-for-the-manger", "white-flower-for-mary", "roses-for-mary"]);
  const EVERGREEN = new Set(["secret-kindness-notes", "helping-hands-like-mary", "yes-with-a-smile", "prepare-the-way"]);
  let days = 0;
  for (let ms = Date.UTC(2026, 10, 19); ms <= Date.UTC(2029, 11, 31); ms += 86_400_000) {
    const ymd = new Date(ms).toISOString().slice(0, 10);
    const daily = dailyActivityFor(ymd);
    assert.ok(daily.exact && daily.activity.access === "signin", `${ymd}: a sign-in sheet for the day`);
    assert.ok(isActivityFreeInWeekOf(daily.activity, ymd), `${ymd}: the day's sheet is free that week`);
    assert.ok(freeOn(ymd).length >= 1, `${ymd}: at least one free sheet`);
    const slug = daily.activity.slug;
    const season = getLiturgicalSeason(new Date(ms)).name;
    assert.notEqual(slug, FAMILY_ADVENT_CALENDAR_SLUG, `${ymd}: the calendar is the season sheet, not the daily highlight`);
    assert.notEqual(slug, SAINT_REPORT_SLUG);
    if (season !== "Advent") {
      assert.ok(!ADVENT_ONLY.has(slug), `${ymd} (${season}): no Advent sheet outside Advent (${slug})`);
      assert.ok(EVERGREEN.has(slug) || (slug === "happy-new-church-year" && season === "Ordinary Time"), `${ymd} (${season}): ${slug}`);
    }
    days++;
  }
  assert.ok(days > 1100, "Nov 19, 2026 to Dec 31, 2029");
  assert.deepEqual(freeOn("nope"), []);
  assert.ok(isActivityFreeThisWeek(getActivity("secret-kindness-notes")!, new Date("2026-11-23T04:30:00Z")), "11:30 PM Sunday Nov 22 in Toronto");
  assert.ok(!isActivityFreeThisWeek(getActivity("secret-kindness-notes")!, new Date("2026-11-23T05:30:00Z")), "Monday Nov 23 starts a new week");
  assert.equal(homeActivityRowVisible(torontoDate(new Date("2026-11-29T04:59:00Z"))), false, "11:59 PM Nov 28 Toronto: row still hidden");
  assert.equal(homeActivityRowVisible(torontoDate(new Date("2026-11-29T05:00:00Z"))), true, "midnight Nov 29 Toronto: Advent row");
  assert.equal(homeActivityRowVisible("2026-11-28"), false);
  assert.equal(homeActivityRowVisible("2026-11-29"), true);
  assert.equal(homeActivityRowVisible("2026-12-24"), true);
  assert.equal(homeActivityRowVisible("2026-12-25"), false, "Christmas Day: the Advent row is gone");
  assert.equal(homeActivityRowVisible("2027-01-10"), false, "still Christmas Time");
  assert.equal(homeActivityRowVisible("2027-01-11"), false, "Ordinary Time after Christmas");
  assert.equal(homeActivityRowVisible("2027-11-27"), false);
  assert.equal(homeActivityRowVisible("2027-11-28"), true, "Advent 2027 starts Nov 28, not a hard-coded 2026 date");
  const bundle = await fs.readFile("src/components/resource/SundayBundle.tsx", "utf8");
  assert.ok(bundle.includes("SundayActivitySlot") && bundle.includes("craft ?"), "This Sunday fills Activities and Crafts");

  // Home "Activities & crafts" row: 4 real items, truthful labels, the Plus craft last.
  const slugsOn = (ymd: string) => homeActivityPicks(ymd).map((p) => p.activity.slug);
  for (const ymd of ["2026-11-01", "2026-11-12", "2026-11-21", "2026-11-28", "2026-11-29", "2026-12-20", "nope"]) {
    const picks = homeActivityPicks(ymd);
    assert.equal(picks.length, HOME_ACTIVITY_PICKS, `${ymd}: four cards`);
    assert.equal(new Set(picks.map((p) => p.activity.slug)).size, picks.length, `${ymd}: no repeats`);
    assert.equal(picks[0].activity.slug, dailyActivityFor(ymd).activity.slug, `${ymd}: today's sheet first`);
    assert.equal(picks[3].activity.slug, SUNDAY_CRAFT_SLUG);
    for (const p of picks) {
      assert.equal(p.access, activityAccessInWeekOf(p.activity, ymd), `${ymd}: access is this week's`);
      assert.match(p.label, p.access === "plus" ? / · Plus$/ : / · Free$/, `${ymd}: label matches access`);
      assert.ok(p.activity.previews.color.startsWith("/images/activities/"));
      await fs.access(path.join("public", p.activity.previews.color));
    }
  }
  assert.deepEqual(slugsOn("2026-11-12"), ["yes-with-a-smile", "secret-kindness-notes", "happy-new-church-year", SUNDAY_CRAFT_SLUG]);
  assert.deepEqual(slugsOn("2026-11-21").slice(0, 3), ["secret-kindness-notes", "happy-new-church-year", "light-the-advent-candle"]);
  assert.deepEqual(slugsOn("2026-11-29"), ["light-the-advent-candle", "happy-new-church-year", FAMILY_ADVENT_CALENDAR_SLUG, SUNDAY_CRAFT_SLUG]);
  assert.deepEqual(slugsOn("2026-12-06").slice(0, 3), ["light-the-advent-candle", "jesse-tree-ornaments", "prepare-the-way"]);
  assert.deepEqual(slugsOn("2026-12-13").slice(0, 3), ["light-the-advent-candle", "white-flower-for-mary", "straw-for-the-manger"]);
  assert.deepEqual(slugsOn("2026-12-20").slice(0, 3), ["yes-with-a-smile", "come-lord-jesus", "straw-for-the-manger"]);
  assert.equal(homeActivityPicks("2026-11-12")[3].label, "Craft · Plus");
  assert.equal(homeActivityPicks("2026-11-29")[0].label, "Today · Free");
  const home = await fs.readFile("src/app/(site)/home-view.tsx", "utf8");
  assert.ok(home.includes("homeActivityRowVisible(today.date)"), "home row follows the Advent season rule");
  assert.ok(home.includes("homeActivityPicks(today.date)"), "home row uses the ISR date rule (no request data)");
  assert.ok(home.includes("AdventPackPromoCard"), "home shows Advent Complete promo");
  assert.ok(!/cookies\(|headers\(|getServerSession|auth\(\)/.test(home), "home stays static");

  const sheetPy = await fs.readFile("scripts/activities/daily/sheets.py", "utf8");
  const yearWheel = await fs.readFile("scripts/activities/new-church-year/build_sheet.py", "utf8");
  assert.ok(!sheetPy.includes("dt.date(2026, 11, 29)"));
  assert.ok(!sheetPy.includes('["Nov 29", "Dec 6", "Dec 13", "Dec 20"]'));
  assert.ok(!yearWheel.includes("November 29, 2026"));
  for (const slug of ["happy-new-church-year", "family-advent-calendar", "light-the-advent-candle"]) {
    const raw = await fs.readFile(`src/data/activities/${slug}.model.json`, "utf8");
    assert.ok(!raw.includes("2026"), `${slug} model has no year`);
    assert.ok(!raw.includes("November 29") && !raw.includes("Nov 29"), `${slug} model has no Advent 2026 Sunday`);
  }

  console.log(`test-activities: ${RESOURCE_ACTIVITIES.length} activities; Happy New Church Year ${doc.elements.length} editable elements (${[...kinds].map(([k, n]) => `${k} ${n}`).join(", ")}) OK`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
