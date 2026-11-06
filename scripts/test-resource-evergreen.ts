/** Run: tsx scripts/test-resource-evergreen.ts */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { EVERGREEN_PAGES } from "../src/lib/evergreen-catalog";
import { canOpenResourceSheet } from "../src/lib/resource/access";
import { hasCardOriginal, readCardOriginal } from "../src/lib/resource/card-originals";
import { getPictureCard } from "../src/lib/resource/cards";
import { searchSheets, resolveResourceSheet, resourcePath, resourcePrintPath, RESOURCE_SEASONS, slugToKey, yearLabel } from "../src/lib/resource/sheets";
import { unifiedSearch } from "../src/lib/resource/unified-search";
import { listSundaySheetKeys } from "../src/lib/sunday-sheet-content";
import originals from "../src/data/cards/designed-originals.json";

async function main() {
  assert.equal(listSundaySheetKeys().length, 188);
  assert.equal(searchSheets({}).length, 216);
  assert.equal(new Set(searchSheets({}).map((s) => s.key)).size, 216);
  assert.equal(resolveResourceSheet("a-ot32")?.key, "A_OT32");
  assert.equal(resolveResourceSheet("not-a-sheet"), null);
  assert.equal(resourcePrintPath("A_OT32", 2), "/print/resource/a-ot32?level=2");
  assert.equal(canOpenResourceSheet({ isPlus: false, sheetKey: "A_OT32", thisSundayKey: null }), false);
  assert.equal(canOpenResourceSheet({ isPlus: true, sheetKey: "A_OT32", thisSundayKey: null }), true);
  for (const page of EVERGREEN_PAGES) {
    assert.equal(slugToKey(page.slug), null, "Sunday slug resolver stays Sunday-only");
    assert.equal(resolveResourceSheet(page.slug)?.key, page.key);
    assert.equal(resourcePath(page.key), `/resource/${page.slug}`);
    assert.equal(resourcePath(page.key, 2), `/resource/${page.slug}?level=2`);
    assert.equal(resourcePrintPath(page.key, 2, true), `/print/evergreen/${page.slug}?level=2&autoprint=1`);
    assert.equal(canOpenResourceSheet({ isPlus: false, sheetKey: page.key, thisSundayKey: null }), true);
    assert.equal(yearLabel(page.key), page.kind === "mass" ? "Mass for Kids" : "Virtue Challenge");
    for (const season of RESOURCE_SEASONS) {
      assert.ok(!searchSheets({ season: season.id }).some((s) => s.key === page.key));
      assert.ok(!unifiedSearch(page.name, season.id, null).some((h) => h.type === "sheet" && h.sheet.key === page.key));
    }
    const id = page.relatedCardIds[0]!;
    assert.ok(getPictureCard(id));
    assert.equal(await hasCardOriginal(id), true);
    const original = await readCardOriginal(id);
    assert.ok(original && Buffer.isBuffer(original.body));
    assert.equal(createHash("sha256").update(original.body).digest("hex"), originals[id as keyof typeof originals].sha256);
    const full = await sharp(original.body).metadata();
    assert.deepEqual([full.width, full.height, full.format], [1080, 1350, "png"]);
    for (const [folder, w, h] of [["thumbs", 432, 540], ["locked", 216, 270]] as const) {
      const meta = await sharp(await fs.readFile(`public/cards/${folder}/${id}.webp`)).metadata();
      assert.deepEqual([meta.width, meta.height, meta.format], [w, h, "webp"]);
    }
  }
  for (const [q, key] of [["gratitude", "VIR_GRATITUDE"], ["introductory rites", "MASS_INTRO"]]) {
    assert.ok(searchSheets({ q }).some((s) => s.key === key));
    assert.ok(unifiedSearch(q!, null, null).some((h) => h.type === "sheet" && h.sheet.key === key));
  }
  const panel = await fs.readFile("src/components/resource/ResourceSheetPanel.tsx", "utf8");
  assert.ok(panel.includes("!getEvergreenPage(sheetKey) ? <Link"), "evergreen never links to Sunday-only editor");
  assert.equal(await readCardOriginal("../MAS-066"), null);
  console.log("test-resource-evergreen: 28 sheets, free paths/access/search, 84 image assets and private original reads OK");
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
