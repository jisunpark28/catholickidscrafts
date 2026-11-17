/**
 * Gospel printable intro: shared header for every Sunday print page.
 * Run: pnpm exec tsx scripts/test-gospel-print-intro.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { liturgicalTitleForPrint } from "../src/components/gospel-sheet/GospelPrintIntro";

const root = join(__dirname, "..");
const src = (p: string) => readFileSync(join(root, p), "utf8");

assert.equal(
  liturgicalTitleForPrint("34th Sunday: Our Lord Jesus Christ, King of the Universe"),
  "34th Sunday: Our Lord Jesus Christ, King of the Universe",
);
assert.equal(
  liturgicalTitleForPrint("34th Sunday: Our Lord Jesus Christ, King of the Universe (Year A)"),
  "34th Sunday: Our Lord Jesus Christ, King of the Universe",
);
assert.equal(liturgicalTitleForPrint("1st Sunday of Advent (Year B)"), "1st Sunday of Advent");
assert.equal(liturgicalTitleForPrint("Easter Sunday (Year C)"), "Easter Sunday");

const intro = src("src/components/gospel-sheet/GospelPrintIntro.tsx");
assert.ok(intro.includes("Catholic kids Gospel worksheet"), "brand line");
assert.ok(intro.includes("Gospel summary"), "keeps Gospel summary");
assert.equal(intro.includes("Family talk"), false, "no Family talk in shared intro");
assert.ok(intro.includes("Full worksheet guide"), "guide link");
assert.ok(intro.includes("Bible verses for kids"), "verses link");
assert.ok(intro.includes("Mom's Bible"), "Mom's Bible link");
assert.ok(intro.includes("gospel-print-intro__links"), "CTA link styling");

for (const file of ["src/app/print/resource/[slug]/page.tsx", "src/app/print/[slug]/page.tsx"]) {
  const page = src(file);
  assert.ok(page.includes("GospelPrintIntro"), `${file} uses shared intro`);
  assert.ok(page.includes("GOSPEL_PRINT_INTRO_CSS"), `${file} injects intro CSS`);
  assert.equal(page.includes("Family talk"), false, `${file}: no Family talk`);
  assert.equal(page.includes("yearLabel(key)})"), false, `${file}: no Year suffix in intro title`);
  assert.equal(page.includes("seo-print-chrome"), false, `${file}: old chrome removed`);
}

console.log("PASS gospel print intro");
