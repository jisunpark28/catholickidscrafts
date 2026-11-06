/** Run: npx tsx scripts/test-evergreen-sheets.ts */
import assert from "node:assert/strict";
import { EVERGREEN_SHEETS } from "../src/data/evergreen-sheets";
import { gospelSheetLevelSchema } from "../src/lib/gospel-sheet-schema";
import { listSundaySheetKeys } from "../src/lib/sunday-sheet-content";
import { slugToKey } from "../src/lib/resource/sheets";
import { FAITH_SEO_CARDS } from "../src/lib/seo/card-seo";
import { PICTURE_CARDS } from "../src/lib/resource/cards";
import { EVERGREEN_PAGES, evergreenPages, publicPath, relatedCards } from "../src/lib/seo/evergreen-worksheets";
import { buildResourcesSitemap } from "../src/lib/sitemap-entries";

const keys = Object.keys(EVERGREEN_SHEETS);
assert.equal(keys.length, 28);
assert.equal(evergreenPages("mass").length, 4);
assert.equal(evergreenPages("virtue").length, 24);
assert.equal(new Set(EVERGREEN_PAGES.map((p) => p.slug)).size, 28);
const sunday = new Set(listSundaySheetKeys());
for (const page of EVERGREEN_PAGES) {
  const s = EVERGREEN_SHEETS[page.key];
  assert.ok(s, page.key);
  assert.ok(!sunday.has(page.key), "evergreen keys stay out of the Sunday catalog");
  assert.equal(slugToKey(page.slug), null, `${page.slug} must not resolve as a /resource key`);
  for (const f of ["key", "liturgicalName", "season", "gospelRef", "keyVerseDR", "color"] as const) assert.ok(s[f], `${page.key}.${f}`);
  assert.ok(s.art.main && s.art.heart && s.art.icons.length);
  for (const lv of [s.levels.level1, s.levels.level2]) {
    gospelSheetLevelSchema.parse(lv);
    assert.ok(Array.isArray(lv.words) && lv.words.length);
    assert.ok(lv.activity);
    if (page.kind === "virtue") {
      assert.equal(lv.activity.type, "checklist");
      if (lv.activity.type === "checklist") assert.equal(lv.activity.items.length, 6);
    }
  }
  const cards = relatedCards(page);
  assert.ok(cards.some((c) => c.sheetKeys?.includes(page.key)), `${page.key} has a matching card`);
}
// 24 distinct checklists
const lists = EVERGREEN_PAGES.filter((p) => p.kind === "virtue").map((p) => JSON.stringify(EVERGREEN_SHEETS[p.key]!.levels.level1.activity));
assert.equal(new Set(lists).size, 24);
assert.equal(PICTURE_CARDS.filter((c) => c.set === "Family Virtue Challenge").length, 24);
assert.equal(PICTURE_CARDS.filter((c) => c.set === "Order of the Mass").length, 4);
assert.equal(new Set(PICTURE_CARDS.map((c) => c.id)).size, PICTURE_CARDS.length, "card ids unique");
assert.equal(new Set(FAITH_SEO_CARDS.map((c) => c.slug)).size, FAITH_SEO_CARDS.length, "faith slugs unique");
const sitemap = new Set(buildResourcesSitemap().map((e) => new URL(e.url).pathname));
for (const p of EVERGREEN_PAGES) assert.ok(sitemap.has(publicPath(p)), publicPath(p));
console.log("test-evergreen-sheets: 28 sheets, 28 cards, slugs, schema, sitemap ok");
