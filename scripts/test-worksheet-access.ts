/** Run: tsx scripts/test-worksheet-access.ts */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { canOpenResourceSheet } from "../src/lib/resource/access";
import { listResourceSheets } from "../src/lib/resource/sheets";
import { ResourceSheetPanel } from "../src/components/resource/ResourceSheetPanel";
import { UnifiedSearchResults } from "../src/components/resource/UnifiedSearchResults";
import { ResourceCardGrid } from "../src/components/resource/ResourceCardGrid";

// tsx uses the classic JSX transform for this Next.js project's preserved JSX.
Object.assign(globalThis, { React });
async function main() {
  const sheets = listResourceSheets();
  const sunday = "A_OT32";
  for (const sheet of sheets) {
    for (const thisSundayKey of [null, sunday]) {
      for (const isPlus of [false, true]) {
        assert.equal(canOpenResourceSheet({ isPlus, sheetKey: sheet.key, thisSundayKey }), isPlus || sheet.key === thisSundayKey);
      }
    }
  }
  for (const key of ["VIR_GRATITUDE", "MASS_INTRO", "A_OT31"]) {
    const sheet = sheets.find((s) => s.key === key)!;
    assert.ok(sheet);
    for (const level of [1, 2] as const) {
      const story = level === 2 ? sheet.levels.level2.story : sheet.levels.level1.story;
      const panel = renderToStaticMarkup(React.createElement(ResourceSheetPanel, { sheet, level, canPrint: false }));
      assert.ok(panel.includes("data-plus-locked"));
      assert.ok(!panel.includes(story.slice(0, 35)), "locked panel never renders full worksheet story");
      assert.ok(!panel.includes('href="/print/'), "no working locked print link");
      for (const html of [
        renderToStaticMarkup(React.createElement(ResourceCardGrid, { sheets: [sheet], level, isPlus: false, thisSundayKey: sunday })),
        renderToStaticMarkup(React.createElement(UnifiedSearchResults, { q: "", hits: [{ type: "sheet", sheet }], level, isPlus: false, thisSundayKey: sunday, clearHref: "/resource?view=all", siteUrl: "https://example.com", resultsHref: "/resource?view=all" })),
      ]) {
        assert.ok(html.includes("data-plus-locked"));
        assert.ok(!html.includes(story.slice(0, 35)), "locked grid sends no readable worksheet story");
        assert.ok(!html.includes('href="/print/'));
      }
      for (const allowed of [sheet, sheets.find((s) => s.key === sunday)!]) {
        const html = renderToStaticMarkup(React.createElement(ResourceCardGrid, { sheets: [allowed], level, isPlus: allowed.key !== sunday, thisSundayKey: sunday }));
        assert.ok(!html.includes("data-plus-locked"));
        assert.ok(html.includes('href="/print/'));
      }
    }
  }
  // Both print entry points must gate before rendering, regardless of embed/autoprint.
  for (const path of ["src/app/print/evergreen/[slug]/page.tsx", "src/app/print/resource/[slug]/page.tsx"]) {
    const source = await fs.readFile(path, "utf8");
    assert.ok(source.includes("resolveResourceViewer()"));
    assert.ok(source.includes("sheetOpenAllowed(viewer,"));
    assert.ok(source.indexOf('redirect("/subscribe")') < source.indexOf("<GospelSheet"));
    assert.ok(source.includes('dynamic = "force-dynamic"'));
  }
  console.log("test-worksheet-access: all 216 entitlement matrices; locked/Plus/Sunday rendering at both levels; print guards OK");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
