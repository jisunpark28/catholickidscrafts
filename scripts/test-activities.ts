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
  dailyActivityFor,
  HOME_ACTIVITY_PICKS,
  homeActivityPicks,
  SUNDAY_CRAFT_SLUG,
  torontoDate,
  activityEditPath,
  activityFileName,
  activityPath,
  getActivity,
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
      const pdf = await fs.readFile(path.join("assets", "activities", act.slug, act.files[v]));
      assert.equal(pdf.subarray(0, 5).toString(), "%PDF-", `${act.slug} ${v} is a PDF`);
      await fs.access(path.join("public", act.previews[v]));
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
  const dl = await fs.readFile("src/app/api/resource/activities/[slug]/download/route.ts", "utf8");
  assert.ok(dl.includes("parentApiGuard()"), "download needs a signed-in parent");
  assert.ok(dl.includes("private, no-store"));
  const ed = await fs.readFile("src/app/api/resource/activities/[slug]/editor/route.ts", "utf8");
  assert.ok(ed.includes("parentApiGuard()") && ed.includes("familyHasPlus("), "editor model needs Plus");
  const page = await fs.readFile("src/app/(site)/resource/activity/[slug]/page.tsx", "utf8");
  assert.ok(!page.includes("activity-models") && !page.includes("cookies("), "detail page stays static and never ships the model");

  // Plus-only downloads (the craft) are checked on the server too.
  assert.ok(dl.includes('activity.access === "plus"') && dl.includes("familyHasPlus(") && dl.includes("plusRequiredResponse()"));
  assert.ok(dl.indexOf("parentApiGuard()") < dl.indexOf("familyHasPlus("), "401 before 402");

  const sitemap = new Set(buildResourcesSitemap().map((e) => new URL(e.url).pathname));
  for (const act of RESOURCE_ACTIVITIES) {
    assert.ok(sitemap.has(activityPath(act.slug)), `sitemap ${act.slug}`);
    assert.ok(!sitemap.has(activityEditPath(act.slug)));
  }

  // Every activity has a valid editor model, no age fields, and a unique slug.
  assert.equal(new Set(RESOURCE_ACTIVITIES.map((x) => x.slug)).size, RESOURCE_ACTIVITIES.length);
  for (const act of RESOURCE_ACTIVITIES) {
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
  assert.deepEqual(RESOURCE_ACTIVITIES.filter((x) => x.access === "plus").map((x) => x.slug), [SUNDAY_CRAFT_SLUG]);

  // Each daily sheet matches an Advent Q&A "Try this" tip verbatim (official site content).
  const advent = (seedJson as { cards: { topicSlug: string; tryThis?: string }[] }).cards.filter((c) => c.topicSlug === "advent");
  for (const act of RESOURCE_ACTIVITIES.filter((x) => x.access === "signin")) {
    for (const t of act.tryThis) {
      assert.ok(advent.some((c) => c.tryThis === t), `${act.slug} tip is on the Advent Q&A: ${t}`);
      assert.equal(activityForTryThis(t)?.slug, act.slug);
    }
  }

  // Daily schedule (Toronto dates), with fallbacks.
  for (const row of DAILY_ACTIVITY_SCHEDULE) assert.ok(getActivity(row.slug), row.slug);
  assert.equal(DAILY_ACTIVITY_SCHEDULE.length, 18, "Nov 12 to Nov 29");
  assert.equal(dailyActivityFor("2026-11-12").activity.slug, "happy-new-church-year");
  assert.equal(dailyActivityFor("2026-11-13").activity.slug, "jesse-tree-ornaments");
  assert.ok(dailyActivityFor("2026-11-13").exact);
  assert.equal(dailyActivityFor("2026-11-29").activity.slug, "light-the-advent-candle");
  assert.equal(dailyActivityFor("2026-12-03").activity.slug, "light-the-advent-candle", "after the plan: latest sheet");
  assert.equal(dailyActivityFor("2026-12-03").exact, false);
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
  assert.ok(!/cookies\(|headers\(|getServerSession|auth\(\)/.test(home), "home stays static");

  console.log(`test-activities: ${RESOURCE_ACTIVITIES.length} activities, ${DAILY_ACTIVITY_SCHEDULE.length} scheduled days; Happy New Church Year ${doc.elements.length} editable elements (${[...kinds].map(([k, n]) => `${k} ${n}`).join(", ")}) OK`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
