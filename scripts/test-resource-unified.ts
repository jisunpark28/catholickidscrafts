/** Run: tsx scripts/test-resource-unified.ts */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { EVERGREEN_PAGES, getEvergreenPage } from "../src/lib/evergreen-catalog";
import { cardSharePath } from "../src/lib/resource/card-meta";
import { cardSeasons, getPictureCard, PICTURE_CARDS } from "../src/lib/resource/cards";
import { listResourceSheets, RESOURCE_SEASONS, sheetSeason } from "../src/lib/resource/sheets";
import { browseResources, unifiedSearch, type SearchHit } from "../src/lib/resource/unified-search";

const id = (hit: SearchHit) => hit.type === "sheet" ? hit.sheet.key : hit.card.id;

async function main() {
  const all = unifiedSearch("", null, null);
  assert.deepEqual(all, browseResources(null));
  assert.equal(all.length, listResourceSheets().length + PICTURE_CARDS.length);
  assert.equal(new Set(all.map(id)).size, all.length, "no duplicates");
  assert.ok(all.slice(0, 48).some((hit) => hit.type === "sheet"));
  assert.ok(all.slice(0, 48).some((hit) => hit.type === "card"), "cards visible on first All page");
  assert.ok(EVERGREEN_PAGES.every((page) => all.some((hit) => id(hit) === page.key)));
  for (const q of ["gratitude", "mass", "Joseph"]) {
    const hits = unifiedSearch(q, null, null);
    assert.ok(hits.some((hit) => hit.type === "sheet"), q + " sheets");
    assert.ok(hits.some((hit) => hit.type === "card"), q + " cards");
  }
  for (const season of RESOURCE_SEASONS) {
    for (const hits of [browseResources(season.id), unifiedSearch("Jesus", season.id, null)]) {
      for (const hit of hits) {
        if (hit.type === "sheet") {
          assert.equal(getEvergreenPage(hit.sheet.key), null, "evergreen is not a liturgical season");
          assert.equal(sheetSeason(hit.sheet), season.id);
        } else {
          assert.ok(cardSeasons(hit.card).includes(season.id));
        }
      }
    }
  }
  const virtueHits = unifiedSearch("virtue", null, null);
  const paged: SearchHit[] = [];
  for (let offset = 0; offset < virtueHits.length; offset += 48) paged.push(...virtueHits.slice(offset, offset + 48));
  assert.deepEqual(paged, virtueHits, "pagination exposes every match without truncation");
  const virtuePages = EVERGREEN_PAGES.filter((page) => page.kind === "virtue");
  assert.equal(virtuePages.length, 24);
  for (const page of virtuePages) {
    assert.ok(paged.some((hit) => hit.type === "sheet" && hit.sheet.key === page.key));
    for (const cardId of page.relatedCardIds) {
      assert.ok(paged.some((hit) => hit.type === "card" && hit.card.id === cardId), cardId);
    }
  }
  assert.ok(paged.some((hit) => hit.type === "card" && hit.card.id === "VIR-077"), "Spirituality is reachable");
  for (const card of PICTURE_CARDS) {
    const url = new URL(cardSharePath(card.id), "https://example.com");
    assert.equal(url.searchParams.get("view"), "cards");
    assert.equal(getPictureCard(url.searchParams.get("card"))?.id, card.id);
  }
  const page = await fs.readFile("src/app/(site)/resource/page.tsx", "utf8");
  assert.ok(!page.includes("ResourceTabs"));
  assert.ok(page.includes('viewParam === "cards" ? getPictureCard(one(sp.card)) : null'));
  assert.ok(page.includes("initialCardId={sharedCard?.id ?? null}"));
  assert.ok(page.includes("resultsHref={resultsHref}"));
  assert.ok(page.includes('<SundayBundle'));
  assert.ok(page.includes('<CustomSheetCardGrid'));
  const results = await fs.readFile("src/components/resource/UnifiedSearchResults.tsx", "utf8");
  assert.ok(results.includes('aria-label="Resource results pages"'));
  assert.ok(results.includes('pageHref(currentPage + 1)'));
  assert.ok(!results.includes('Showing the best matches'));
  const search = await fs.readFile("src/components/resource/ResourceSearchBar.tsx", "utf8");
  assert.ok(!search.includes('view: "cards"'), "controls never scope to cards");
  console.log("test-resource-unified: " + all.length + " browse items; mixed search, season filters, card links and all 24 virtue cards across pages OK");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
