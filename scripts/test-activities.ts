/** Run: tsx scripts/test-activities.ts */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import MODEL from "../src/data/activities/happy-new-church-year.model.json";
import {
  activityDownloadPath,
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

  const sitemap = new Set(buildResourcesSitemap().map((e) => new URL(e.url).pathname));
  assert.ok(sitemap.has("/resource/activity/happy-new-church-year"));
  assert.ok(!sitemap.has("/resource/activity/happy-new-church-year/edit"));

  console.log(`test-activities: ${RESOURCE_ACTIVITIES.length} activity, ${doc.elements.length} editable elements (${[...kinds].map(([k, n]) => `${k} ${n}`).join(", ")}) OK`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
