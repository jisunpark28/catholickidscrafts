/** Run: tsx scripts/test-activities.ts */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import MODEL from "../src/data/activities/happy-new-church-year.model.json";
import seedJson from "../prisma/data/liturgy-qa-cards.json";
import {
  activityDownloadPath,
  activityForTryThis,
  DAILY_ACTIVITY_SCHEDULE,
  CRAFTS_LIST_PATH,
  dailyActivityFor,
  HOME_CRAFT_PICKS,
  homeCraftPicks,
  HOME_ACTIVITY_PICKS,
  homeActivityPicks,
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
import { buildResourcesSitemap } from "../src/lib/sitemap-entries";
import { createActivityDownloadHandler, type ActivityDownloadDeps } from "../src/lib/resource/activity-download";
import { ActivityFileUnavailableError } from "../src/lib/resource/activity-files";
import { craftBlobPathname } from "../src/lib/resource/craft-blobs";
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
    doc.elements.some((e) => e.kind === "text" && e.text === "The new Church year begins on the First Sunday of Advent \u2014 November 29, 2026."),
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

  // Plus-only downloads (the craft) are checked on the server too.
  assert.ok(dl.includes('activity.access === "plus"') && dl.includes("deps.hasPlus(") && dl.includes("deps.plusRequired()"));
  assert.ok(dl.indexOf("deps.guard()") < dl.indexOf("deps.hasPlus(") && dl.indexOf("deps.hasPlus(") < dl.indexOf("deps.readPdf("), "401 before 402 before any file");

  // Same order at runtime, with the session, Plus and Blob reads mocked.
  {
    const calls: string[] = [];
    const json = (status: number) => NextResponse.json({ status }, { status });
    const deps = (o: { signedIn: boolean; plus: boolean; file?: "ok" | "missing" | "down" }): ActivityDownloadDeps => ({
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
    r = await run("prepare-the-way", { signedIn: true, plus: false, file: "ok" }, "bw");
    assert.deepEqual([r.status, r.calls], [200, ["guard", "limit", "read:bundle:bw", "record"]], "free sheet: no Plus check");
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
    const words = JSON.stringify([act.title, act.summary, act.description, m.elements.filter((e) => e.kind === "text").map((e) => (e as { text: string }).text)]);
    assert.ok(!/\bages?\b|\bgrade\b|years old/i.test(words), `${act.slug} mentions no ages`);
  }

  // Free with sign-in, except the one Plus craft.
  const craft = getActivity(SUNDAY_CRAFT_SLUG);
  assert.ok(craft && craft.access === "plus" && craft.kind === "Craft");
  const UPLOADED = ["advent-bank", "advent-lantern", "fiat-flag", "gabriel-wings", "joseph-lily", "birthday-card", "swaddle-baby", "gloria-trumpet", "shepherd-crook", "bethlehem-star", "magi-gifts",
    "angel-choir", "baptism-dove-mobile", "christmas-eve-lantern", "emmanuel-door-hanger", "epiphany-chalk-blessing", "flight-into-egypt", "heart-ornaments",
    "holy-family-mobile", "john-the-baptist-card", "magi-finger-puppets", "manger-banner", "newborn-king-crown", "pondering-heart", "visitation-popup"];
  assert.equal(new Set(RESOURCE_ACTIVITIES.map((x) => x.title)).size, RESOURCE_ACTIVITIES.length, "titles are unique");
  assert.deepEqual(RESOURCE_ACTIVITIES.filter((x) => x.access === "plus").map((x) => x.slug), [SUNDAY_CRAFT_SLUG, ...UPLOADED]);
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

  // Daily schedule (Toronto dates), with fallbacks. Through Christmas Eve 2026.
  for (const row of DAILY_ACTIVITY_SCHEDULE) assert.ok(getActivity(row.slug), row.slug);
  assert.equal(DAILY_ACTIVITY_SCHEDULE.length, 43, "Nov 12 to Dec 24");
  assert.equal(DAILY_ACTIVITY_SCHEDULE[0]?.date, "2026-11-12");
  assert.equal(DAILY_ACTIVITY_SCHEDULE.at(-1)?.date, "2026-12-24");
  assert.equal(dailyActivityFor("2026-11-12").activity.slug, "happy-new-church-year");
  assert.equal(dailyActivityFor("2026-11-13").activity.slug, "jesse-tree-ornaments");
  assert.ok(dailyActivityFor("2026-11-13").exact);
  assert.equal(dailyActivityFor("2026-11-29").activity.slug, "light-the-advent-candle");
  assert.equal(dailyActivityFor("2026-12-03").activity.slug, "family-advent-calendar");
  assert.ok(dailyActivityFor("2026-12-03").exact);
  assert.equal(dailyActivityFor("2026-12-08").activity.slug, "white-flower-for-mary");
  assert.equal(dailyActivityFor("2026-12-20").activity.slug, "jesse-tree-picture-a-day");
  assert.equal(dailyActivityFor("2026-12-25").activity.slug, "straw-for-the-manger", "after the plan: latest sheet");
  assert.equal(dailyActivityFor("2026-12-25").exact, false);
  assert.equal(dailyActivityFor("2026-11-01").activity.slug, "happy-new-church-year", "before the plan");
  assert.equal(dailyActivityFor("nope").activity.slug, "happy-new-church-year");
  assert.equal(torontoDate(new Date("2026-11-13T04:30:00Z")), "2026-11-12", "11:30 PM in Toronto is still Nov 12");
  assert.equal(torontoDate(new Date("2026-11-13T05:30:00Z")), "2026-11-13");
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
      assert.equal(p.access, p.activity.access);
      assert.match(p.label, p.access === "plus" ? / · Plus$/ : / · Free$/, `${ymd}: label matches access`);
      assert.ok(p.activity.previews.color.startsWith("/images/activities/"));
      await fs.access(path.join("public", p.activity.previews.color));
    }
  }
  assert.deepEqual(slugsOn("2026-11-12"), ["happy-new-church-year", "jesse-tree-ornaments", "prepare-the-way", SUNDAY_CRAFT_SLUG]);
  assert.deepEqual(slugsOn("2026-11-21").slice(0, 3), ["secret-kindness-notes", "happy-new-church-year", "roses-for-mary"]);
  assert.equal(homeActivityPicks("2026-11-12")[3].label, "Craft · Plus");
  const home = await fs.readFile("src/app/(site)/home-view.tsx", "utf8");
  assert.ok(home.includes("homeActivityPicks(today.date)"), "home row uses the ISR date rule (no request data)");
  assert.ok(home.includes("AdventPackPromoCard"), "home shows Advent Complete promo");
  assert.ok(!/cookies\(|headers\(|getServerSession|auth\(\)/.test(home), "home stays static");

  console.log(`test-activities: ${RESOURCE_ACTIVITIES.length} activities, ${DAILY_ACTIVITY_SCHEDULE.length} scheduled days; Happy New Church Year ${doc.elements.length} editable elements (${[...kinds].map(([k, n]) => `${k} ${n}`).join(", ")}) OK`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
