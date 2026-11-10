import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import SundayMassWorksheetPage, { generateStaticParams, generateMetadata } from "../src/app/(site)/sunday-mass-worksheets/[slug]/page";
import { listSundaySheetKeys } from "../src/lib/sunday-sheet-content";
import { keyToSlug, slugToKey, resourcePath, resourcePrintPath, sheetYear } from "../src/lib/resource/sheets";
import { sundayMassWorksheetSlug, sundayMassWorksheetKey, sundayMassWorksheetPath, sundayMassWorksheetRedirect } from "../src/lib/seo/sunday-mass-worksheets";
import { SAINT_SEO_CARDS, FAITH_SEO_CARDS, getSaintSeoCard } from "../src/lib/seo/card-seo";
import { cardSharePath } from "../src/lib/resource/card-meta";
import { resolvePin, buildPinterestCatalog } from "../src/lib/seo/pin-og";
import { buildResourcesSitemap } from "../src/lib/sitemap-entries";

async function main() {
  const keys = listSundaySheetKeys();
  assert.equal(keys.length, 188);
  const slugs = keys.map(sundayMassWorksheetSlug);
  assert.equal(new Set(slugs).size, keys.length, "public worksheet slugs must be unique");
  assert.deepEqual(generateStaticParams(), slugs.map((slug) => ({ slug })));
  const sitemap = new Set(buildResourcesSitemap().map((entry) => new URL(entry.url).pathname));
  for (const key of keys) {
    const slug = sundayMassWorksheetSlug(key);
    const old = keyToSlug(key);
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(sundayMassWorksheetKey(slug), key);
    assert.equal(sundayMassWorksheetKey(old), key);
    assert.equal(slugToKey(old), key, "internal key codec is unchanged");
    assert.equal(sundayMassWorksheetRedirect(old), sundayMassWorksheetPath(key));
    assert.equal(sundayMassWorksheetRedirect(slug), null, "no canonical redirect loop");
    const year = sheetYear(key);
    if (year) assert.ok(slug.includes("-year-" + year.toLowerCase()));
    else assert.ok(!slug.includes("-year-"), "shared sheets have no year suffix");
    assert.ok(sitemap.has(sundayMassWorksheetPath(key)));
    assert.ok(!sitemap.has("/sunday-mass-worksheets/" + old));
    assert.equal(resolvePin("worksheet", old)?.pagePath, sundayMassWorksheetPath(key));
  }
  assert.equal(sundayMassWorksheetKey("not-a-real-sheet"), null);
  assert.equal(sundayMassWorksheetRedirect("not-a-real-sheet"), null);
  assert.equal(cardSharePath("SNT-032"), "/resource?view=cards&card=SNT-032");
  assert.equal(resourcePath("A_OT32"), "/resource/a-ot32");
  assert.equal(resourcePath("A_OT32", 2), "/resource/a-ot32?level=2");
  assert.equal(resourcePrintPath("A_OT32", 2, true), "/print/resource/a-ot32?level=2&autoprint=1");

  const examples = [
    ["a-ot32", "32nd-sunday-in-ordinary-time-year-a"],
    ["a-adv02", "2nd-sunday-of-advent-year-a"],
    ["b-adv02", "2nd-sunday-of-advent-year-b"],
  ];
  for (const [old, slug] of examples) {
    const path = "/sunday-mass-worksheets/" + slug;
    const search = { level: "2", tag: ["a&b", "two words"], empty: "", omitted: undefined };
    const target = path + "?level=2&tag=a%26b&tag=two+words&empty=";
    assert.equal(sundayMassWorksheetRedirect(old, search), target);
    // Execute the actual page, not just its URL helper: Next permanentRedirect must be 308.
    await assert.rejects(
      SundayMassWorksheetPage({ params: Promise.resolve({ slug: old }), searchParams: Promise.resolve(search) }),
      (e: unknown) => (e as { digest?: string }).digest === "NEXT_REDIRECT;replace;" + target + ";308;",
    );
    const metadata = await generateMetadata({ params: Promise.resolve({ slug }), searchParams: Promise.resolve({}) });
    assert.equal(metadata.alternates?.canonical, path);
  }
  assert.equal(new Set(SAINT_SEO_CARDS.map((card) => card.slug)).size, SAINT_SEO_CARDS.length);
  for (const card of SAINT_SEO_CARDS) {
    assert.equal(getSaintSeoCard(card.slug)?.id, card.id);
    assert.ok(resolvePin("saint", card.slug)?.pagePath.endsWith("/" + card.slug));
  }
  assert.equal(SAINT_SEO_CARDS.find((c) => c.id === "SNT-032")?.slug, "saint-rose-philippine-duchesne");
  assert.equal(SAINT_SEO_CARDS.find((c) => c.id === "SNT-065")?.slug, "saint-elizabeth-of-hungary");
  // Snapshot all pre-existing public card slugs: the URL migration must not rename cards.
  // Cards added later (Order of the Mass MAS-066+, Family Virtue Challenge VIR-054+) are excluded.
  const isLater = (id: string) => /^(MAS-(06[6-9]|0[7-9]\d)|VIR-(05[4-9]|0[6-9]\d))$/.test(id);
  const cardSnapshot = [SAINT_SEO_CARDS, FAITH_SEO_CARDS].map((cards) => cards.filter((c) => !isLater(c.id)).map((c) => [c.id, c.slug]));
  assert.equal(createHash("sha256").update(JSON.stringify(cardSnapshot)).digest("hex"),
    "299efdad6088d9216e64cbfe0c4b505add505d2f7fd1b58e1fb2e4179743a1df");
  for (const pin of buildPinterestCatalog().filter((pin) => pin.type === "worksheet")) {
    assert.ok(sitemap.has(pin.pagePath));
  }
  console.log("test-public-title-slugs: 188 worksheets, legacy 308s + query preservation, sitemap, pins, and unchanged card slugs ok");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
