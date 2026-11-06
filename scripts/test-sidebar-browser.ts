import assert from "node:assert/strict";
import { readFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright";

async function main() {
  const base = process.env.SIDEBAR_BASE_URL ?? "http://127.0.0.1:3035";
  const directory = process.env.SIDEBAR_FIXTURE_DIR ?? tmpdir();
  mkdirSync(directory, { recursive: true });
  const data = JSON.parse(readFileSync(path.join(directory, "sidebar-fixtures.json"), "utf8")) as { fixtures: Record<string, string>; icons: { label: string; svg: string }[] };
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => ["localhost", "127.0.0.1"].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
    const response = await page.goto(`${base}/resource`, { waitUntil: "networkidle", timeout: 120000 });
    assert.equal(response?.status(), 200);
    const serverHtml = await response!.text();
    assert.ok(!serverHtml.includes('data-sidebar-unavailable="binder"'), "actual signed-out SSR has no binder element");
    const nav = page.getByRole("navigation", { name: "Home", exact: true });
    const labels = ["Printables", "Daily Mass", "Play & Learn", "Mom's Bible", "Q&A Cards", "Faith & Prayer"];
    assert.deepEqual((await nav.getByRole("link").allTextContents()).map((label) => label.trim()), labels);
    assert.equal(await nav.getByRole("link", { name: "Printables", exact: true }).getAttribute("href"), "/resource");
    assert.equal(await nav.locator('[aria-current="page"]').innerText(), "Printables");
    assert.equal(await nav.locator('a[href="/subscribe"]').count(), 0);
    assert.equal(await nav.getByRole("button", { name: /My Binder/ }).count(), 0);
    assert.equal(await page.getByRole("banner").getByRole("link", { name: "Catholic Kids Crafts Plus", exact: true }).count(), 1, "header Plus preserved");
    assert.equal(await nav.locator('[aria-current="page"] svg').evaluate((element) => getComputedStyle(element).stroke), "rgb(255, 255, 255)");
    for (const link of await nav.getByRole("link").all()) {
      const box = await link.boundingBox(); assert.ok(box && box.height >= 44);
      await link.focus(); assert.ok(await link.evaluate((element) => element === document.activeElement));
      await link.evaluate((element) => (element as HTMLElement).blur());
    }
    for (const width of [1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await nav.evaluate((element) => element.scrollWidth > element.clientWidth), false);
      const sidebar = await page.locator('aside:has(nav[aria-label="Home"])').boundingBox(); assert.ok(sidebar);
      for (const link of await nav.getByRole("link").all()) {
        const box = await link.boundingBox(); assert.ok(box && box.x >= sidebar.x && box.x + box.width <= sidebar.x + sidebar.width);
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: path.join(directory, "sidebar-desktop-signed-out.png") });
    // Exact SSR component fixtures, derived from mocked server billing decisions, NOT live auth.
    for (const state of ["free", "plus"]) {
      await nav.evaluate((element, html) => { element.outerHTML = html; }, data.fixtures[state]);
      assert.equal(await nav.getByRole("button", { name: /My Binder/ }).count(), state === "plus" ? 1 : 0);
      assert.equal(await nav.locator('[data-sidebar-separator="binder"]').count(), state === "plus" ? 1 : 0);
      if (state === "plus") assert.ok(await nav.getByRole("button", { name: /My Binder/ }).isDisabled());
      assert.equal(await nav.evaluate((element) => element.scrollWidth > element.clientWidth), false);
      await page.screenshot({ path: path.join(directory, `sidebar-desktop-${state}-fixture.png`) });
    }
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Hide navigation", exact: true }).click(); assert.equal(await nav.isVisible(), false);
    await page.getByRole("button", { name: "Show navigation", exact: true }).click(); assert.ok(await nav.isVisible());
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.getByRole("button", { name: "Explore & Learn", exact: true }).click();
      assert.ok(await nav.isVisible());
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (width === 375) {
        await page.screenshot({ path: path.join(directory, "sidebar-mobile-signed-out.png") });
        await nav.evaluate((element, html) => { element.outerHTML = html; }, data.fixtures.plus);
        assert.equal(await nav.evaluate((element) => element.scrollWidth > element.clientWidth), false);
        await page.screenshot({ path: path.join(directory, "sidebar-mobile-plus-fixture.png") });
        await page.reload({ waitUntil: "networkidle" });
        await page.getByRole("button", { name: "Explore & Learn", exact: true }).click();
      }
      await page.keyboard.press("Escape"); assert.equal(await nav.isVisible(), false);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${base}/catholic-faith-questions`, { waitUntil: "networkidle" });
    assert.equal(await nav.locator('[aria-current="page"]').innerText(), "Faith & Prayer");
    const categories = page.getByRole("region", { name: "Faith & Prayer", exact: true });
    assert.equal(await categories.getByRole("link").count(), 11, "all five faith + six seasonal categories remain reachable");
    await nav.getByRole("link", { name: "Q&A Cards", exact: true }).click();
    await page.waitForURL("**#qa-cards");
    assert.equal(await nav.locator('[aria-current="page"]').innerText(), "Q&A Cards");
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await nav.locator('[aria-current="page"]').innerText(), "Q&A Cards", "direct hash load");
    const detail = await page.locator('#qa-cards a[href^="/catholic-faith-questions/"]').first().getAttribute("href");
    assert.ok(detail); await page.goto(`${base}${detail}`, { waitUntil: "networkidle" });
    assert.equal(await nav.locator('[aria-current="page"]').innerText(), "Q&A Cards");
    const destinations = ["/resource", "/daily-mass", "/play", "/bible/read/genesis/1", "/catholic-faith-questions", "/prayers", "/liturgy/mass", "/liturgy/sacraments", "/liturgy/saints", "/liturgy/devotions", "/liturgy/ordinary-time", "/liturgy/advent", "/liturgy/christmas-time", "/liturgy/lent", "/liturgy/paschal-triduum", "/liturgy/easter-time"];
    for (const destination of destinations) {
      const result = await page.request.get(`${base}${destination}`, { timeout: 120000 });
      assert.equal(result.status(), 200, `${destination}: actual HTTP destination`);
    }
    assert.deepEqual(errors, [], "no hydration/client exceptions");
    const stylesheets = await page.locator('link[rel="stylesheet"]').evaluateAll((links) => links.map((element) => (element as HTMLLinkElement).href));
    await page.setViewportSize({ width: 1200, height: 540 });
    await page.setContent(`<html><head>${stylesheets.map((href) => `<link rel="stylesheet" href="${href}">`).join("")}<style>body{margin:0;padding:28px;background:#fffbef;font:15px system-ui;color:#405329}svg{width:108px;height:108px;margin:0 auto 8px}h1{font-size:22px;margin:0 0 20px}.row{display:grid;grid-template-columns:repeat(7,1fr);gap:14px;padding:18px;border-radius:20px}.cell{text-align:center}.active{color:#fff;background:#607537;margin-top:20px}</style></head><body><h1>Original paper-and-ink sidebar illustrations</h1>${["row", "row active"].map((classes) => `<div class="${classes}">${data.icons.map((icon) => `<div class="cell">${icon.svg}<span>${icon.label}</span></div>`).join("")}</div>`).join("")}</body></html>`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(directory, "sidebar-icons.png") });
    console.log(`PASS actual signed-out production SSR, 16 HTTP destinations, 11 preserved categories, route/hash/current icons, desktop/mobile/toggles/focus/no overflow; free/Plus rendered component fixtures (not live billing), 7-icon sheet.`);
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });