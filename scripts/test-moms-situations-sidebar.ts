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
    const dreamHref = await page.locator('.mb-recs a[href*="situation=dreams"]').first().getAttribute("href");
    assert.ok(dreamHref?.includes("situation=dreams") && dreamHref.startsWith("/bible/read/"), dreamHref);
    assert.equal(await page.locator(".mb-find__status").innerText(), `${SITUATION_GROUPS.reduce((sum, group) => sum + group.situations.length, 0)} moments in 4 groups`);
    const boxes = await page.locator(".mb-sgroup").evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, width: box.width };
    }));
    assert.equal(boxes.length, 4, "four groups");
    for (let index = 1; index < boxes.length; index++) {
      assert.ok(boxes[index].top >= boxes[index - 1].bottom - 1, `group ${index} is below the previous group`);
      assert.ok(Math.abs(boxes[index].width - boxes[0].width) < 2, "groups share one full width");
    }
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
      if (width === 375) {
        const narrow = await page.locator(".mb-sgroup").evaluateAll((elements) => elements.map((element) => {
          const box = element.getBoundingClientRect();
          return { top: box.top, bottom: box.bottom, width: box.width };
        }));
        assert.equal(narrow.length, 4);
        for (let index = 1; index < narrow.length; index++) {
          assert.ok(narrow[index].top >= narrow[index - 1].bottom - 1, `mobile group ${index} stacks`);
          assert.ok(Math.abs(narrow[index].width - narrow[0].width) < 2, "mobile groups share one width");
        }
      }
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
    await alternative.focus();
    await page.keyboard.press("Enter");
    assert.notEqual(new URL(page.url()).hash, "#s-dreams");
    await page.setViewportSize({ width: 1440, height: 1000 });
    const love = page.locator(".mb-sgroup").first();
    const before = await love.locator(".mb-chip").count();
    await love.getByRole("button", { name: /^Show all / }).click();
    assert.ok(await love.locator(".mb-chip").count() > before, "show all reveals more moments");
    await page.locator("#mb-find-moment").fill("cyberbullying");
    await page.waitForFunction(() => document.querySelector(".mb-find__status")?.textContent?.startsWith("1 of "));
    const cyber = page.getByRole("button", { name: "🧩 Cyberbullying", exact: true });
    const cyberLabel = await cyber.innerText();
    await cyber.focus();
    await page.keyboard.press("Enter");
    assert.equal(new URL(page.url()).hash, "#s-cyberbullying-online-game-chat");
    assert.equal(await page.locator('.mb-chip[aria-pressed="true"]').innerText(), cyberLabel);
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    assert.equal(await page.locator("#mb-find-moment").inputValue(), "");
    await page.setViewportSize({ width: 375, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "search/show-all: no mobile overflow");
    const late = SITUATION_GROUPS[0]?.situations[12];
    assert.ok(late && late.key !== "dreams");
    await page.setViewportSize({ width: 1440, height: 900 });
    const deep = await page.goto(`${base}/moms-bible/situations?from=hash#s-${late.key}`, { waitUntil: "networkidle", timeout: 180000 });
    assert.equal(deep?.status(), 200);
    await page.waitForFunction((title) => document.querySelector('.mb-chip[aria-pressed="true"]')?.textContent?.includes(title), late.title);
    assert.equal(new URL(page.url()).hash, `#s-${late.key}`);
    await page.goto(`${base}/play`, { waitUntil: "networkidle", timeout: 120000 });
    await page.getByRole("link", { name: "Mom's Bible", exact: true }).click();
    await page.waitForURL("**/moms-bible/situations", { timeout: 120000 });
    assert.equal(await nav.locator('[aria-current="page"]').innerText(), "Mom's Bible");
    const reader = await page.goto(`${base}/bible/read/genesis/1`, { waitUntil: "networkidle", timeout: 120000 });
    assert.equal(reader?.status(), 200);
    assert.equal(new URL(page.url()).pathname, "/bible/read/genesis/1", "direct reader URL stays available");
    assert.equal(await nav.locator('[aria-current="page"]').innerText(), "Mom's Bible");
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