import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { SITUATION_GROUPS } from "../src/data/moms-bible/situations";

async function main() {
  const source = readFileSync("src/app/(site)/moms-bible/situations/page.tsx", "utf8");
  assert.match(source, /<TestamentPageShell>/);
  assert.doesNotMatch(source, /import \{ PageShell \}|<PageShell/);
  // The related verse destination already has the shared shell; do not edit the reader.
  assert.match(readFileSync("src/app/(site)/bible/read/[bookSlug]/[chapter]/page.tsx", "utf8"), /<TestamentPageShell>/);
  const dreams = SITUATION_GROUPS.flatMap((group) => group.situations).find((situation) => situation.key === "dreams");
  assert.ok(dreams);
  const directory = process.env.SITUATIONS_SCREENSHOT_DIR ?? tmpdir(); mkdirSync(directory, { recursive: true });
  const base = process.env.SITUATIONS_BASE_URL ?? "http://127.0.0.1:3042";
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => ["localhost", "127.0.0.1"].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
    const response = await page.goto(`${base}/moms-bible/situations#s-dreams`, { waitUntil: "networkidle", timeout: 180000 });
    assert.equal(response?.status(), 200);
    const nav = page.getByRole("navigation", { name: "Home", exact: true });
    const selected = page.locator('.mb-chip[aria-pressed="true"]');
    await page.waitForFunction((title) => document.querySelector('.mb-chip[aria-pressed="true"]')?.textContent?.includes(title), dreams.title);
    assert.equal(new URL(page.url()).hash, "#s-dreams");
    assert.equal(await nav.count(), 1, "exactly one shared sidebar, no double shell");
    assert.ok(await nav.isVisible());
    assert.equal(await nav.locator('[aria-current="page"]').innerText(), "Mom's Bible");
    assert.equal(await page.locator('aside:has(nav[aria-label="Home"])').evaluate((element) => getComputedStyle(element).backgroundColor), "rgb(252, 247, 242)");
    assert.ok((await page.locator(".mb-recs .mb-lbl").textContent())?.includes(dreams.title));
    assert.ok(await page.locator(".mb-recs article").count() > 0, "dreams recommendations retained");
    await page.screenshot({ path: path.join(directory, "moms-situations-sidebar-desktop.png"), fullPage: true });
    const action = page.locator('.mb-recs a[href^="/bible/read/"]').first();
    const href = await action.getAttribute("href"); assert.ok(href);
    await action.click();
    await page.waitForURL((url) => url.pathname.startsWith("/bible/read/"), { timeout: 120000 });
    await page.waitForLoadState("networkidle");
    assert.equal(await nav.count(), 1);
    assert.ok(await nav.isVisible());
    assert.equal(await nav.locator('[aria-current="page"]').innerText(), "Mom's Bible", "verse/detail transition retains sidebar");
    await page.goBack({ waitUntil: "networkidle", timeout: 120000 });
    assert.equal(new URL(page.url()).hash, "#s-dreams");
    await page.waitForFunction((title) => document.querySelector('.mb-chip[aria-pressed="true"]')?.textContent?.includes(title), dreams.title);
    assert.ok((await selected.textContent())?.includes(dreams.title), "back restores selected moment/hash");
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}: no overflow`);
      assert.equal(await nav.isVisible(), false);
      await page.getByRole("button", { name: "Explore & Learn", exact: true }).click();
      assert.ok(await nav.isVisible());
      assert.equal(await nav.locator('[aria-current="page"]').innerText(), "Mom's Bible");
      if (width === 375) await page.screenshot({ path: path.join(directory, "moms-situations-sidebar-mobile.png"), fullPage: true });
      await page.keyboard.press("Escape"); assert.equal(await nav.isVisible(), false);
      assert.equal(new URL(page.url()).hash, "#s-dreams");
      assert.ok((await selected.textContent())?.includes(dreams.title));
    }
    const alternative = page.locator('.mb-chip[aria-pressed="false"]').first();
    await alternative.click(); assert.notEqual(new URL(page.url()).hash, "#s-dreams");
    for (const [route, label] of [["/play", "Play & Learn"], ["/resource", "Printables"], ["/daily-mass", "Daily Mass"]]) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      const result = await page.goto(`${base}${route}`, { waitUntil: "networkidle", timeout: 120000 });
      assert.equal(result?.status(), 200); assert.equal(await nav.count(), 1);
      assert.equal(await nav.locator('[aria-current="page"]').innerText(), label);
    }
    assert.deepEqual(errors, [], "no hydration/client exceptions");
    console.log("PASS situations#s-dreams: one peach sidebar, Mom's Bible highlight, selected recommendations/action/reader/back hash retained, mobile 320/375 toggle/Escape/no overflow; Play/Printables/Daily Mass regressions.");
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });