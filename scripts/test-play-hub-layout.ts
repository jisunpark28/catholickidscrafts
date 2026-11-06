import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const directory = process.env.PLAY_LAYOUT_SCREENSHOT_DIR ?? tmpdir();
  mkdirSync(directory, { recursive: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => ["localhost", "127.0.0.1"].includes(new URL(route.request().url()).hostname)
      ? route.continue() : route.abort());
    const base = process.env.PLAY_LAYOUT_BASE_URL ?? "http://127.0.0.1:3034";
    const response = await page.goto(`${base}/play`, { waitUntil: "networkidle", timeout: 120_000 });
    assert.equal(response?.status(), 200);
    const hub = page.locator('[data-play-content="hub"]');
    const pane = hub.locator("..");
    const cards = hub.locator("article");
    const grid = cards.first().locator("..");
    const nav = page.getByRole("navigation", { name: "Home", exact: true });
    const count = await cards.count();
    assert.ok(count > 0);
    const links = await cards.locator("a").evaluateAll((elements) => elements.map((element) => element.getAttribute("href")));
    assert.ok(links.includes("/play/photo-booth"));
    assert.ok(!links.includes("/play/emoji"));
    assert.ok(await hub.getByText("Camera/Photos stay on your device", { exact: true }).count() >= 2);
    assert.ok(await page.locator('script[type="application/ld+json"]').count() > 0);

    for (const width of [320, 375, 1024, 1440, 1920, 2560]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await hub.waitFor();
      const metrics = await grid.evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const boxes = [...element.querySelectorAll("article")].map((card) => {
          const box = card.getBoundingClientRect();
          return { x: box.x, y: box.y, width: box.width, height: box.height };
        });
        return { width: rect.width, x: rect.x, gap: parseFloat(style.columnGap), columns: style.gridTemplateColumns.split(/\s+/).length, boxes };
      });
      const area = await pane.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return { x: rect.x, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height,
          paddingLeft: parseFloat(style.paddingLeft), paddingRight: parseFloat(style.paddingRight), background: style.backgroundColor };
      });
      const documentWidth = await page.evaluate(() => document.documentElement.clientWidth);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}: no horizontal overflow`);
      assert.equal(area.background, "rgb(253, 250, 247)", `${width}: warm main canvas`);
      assert.ok(area.height >= 1000 && area.bottom >= 1000, `${width}: background fills below content to viewport bottom`);
      assert.ok(Math.abs(area.right - documentWidth) <= 1, `${width}: canvas reaches right edge`);
      assert.ok(Math.abs(metrics.width - (area.width - area.paddingLeft - area.paddingRight)) <= 1, `${width}: no constrained centered wrapper`);
      assert.ok(Math.abs(metrics.x - area.x - area.paddingLeft) <= 1, `${width}: consistent starting gutter`);
      const expectedColumns = Math.max(1, Math.floor((metrics.width + metrics.gap) / (Math.min(256, metrics.width) + metrics.gap)));
      assert.equal(metrics.columns, expectedColumns, `${width}: adaptive columns independent of game count`);
      assert.ok(Math.max(...metrics.boxes.map((box) => box.height)) < 600, `${width}: cards are not stretched to viewport height`);
      for (let index = 0; index < metrics.boxes.length; index++) {
        const box = metrics.boxes[index];
        const expectedX = metrics.x + (index % metrics.columns) * (box.width + metrics.gap);
        assert.ok(Math.abs(box.x - expectedX) <= 1, `${width}: card ${index} flows from start`);
      }
      if (width >= 1024) {
        assert.ok(await nav.isVisible());
        const aside = await page.locator('aside:has(nav[aria-label="Home"])').boundingBox();
        assert.ok(aside);
        assert.ok(Math.abs(area.x - aside.x - aside.width) <= 1, `${width}: canvas begins at sidebar edge`);
      } else {
        assert.equal(await nav.isVisible(), false);
        assert.equal(area.x, 0);
      }
      assert.deepEqual(await cards.locator("a").evaluateAll((elements) => elements.map((element) => element.getAttribute("href"))), links);
      assert.equal(await cards.first().evaluate((element) => getComputedStyle(element).borderRadius), "16px");
      assert.equal(await cards.first().evaluate((element) => getComputedStyle(element).backgroundColor), "rgb(255, 255, 255)");
      const play = cards.first().getByRole("link");
      assert.ok(await play.getAttribute("aria-label"));
      const button = await play.boundingBox();
      assert.ok(button && button.height >= 44);
      await play.focus();
      assert.ok(await play.evaluate((element) => element === document.activeElement));
      await play.evaluate((element) => (element as HTMLElement).blur());
      await page.getByRole("banner").waitFor({ state: "visible" });
      if ([375, 1440, 1920].includes(width)) {
        await page.screenshot({ path: path.join(directory, `play-fill-${width}.png`), fullPage: false });
      }

      // Simulate a larger future catalog in the DOM only. No source/catalog fixtures or fixed game counts.
      const added = metrics.columns * 2 + 1;
      await grid.evaluate((element, amount) => {
        const template = element.querySelector("article")!;
        for (let index = 0; index < amount; index++) {
          const clone = template.cloneNode(true) as HTMLElement;
          clone.dataset.futureTestCard = "true";
          element.appendChild(clone);
        }
      }, added);
      assert.equal(await cards.count(), count + added);
      const future = await grid.evaluate((element) => ({ columns: getComputedStyle(element).gridTemplateColumns.split(/\s+/).length,
        first: element.querySelector("article")!.getBoundingClientRect().top,
        last: element.lastElementChild!.getBoundingClientRect().top,
        overflow: document.documentElement.scrollWidth > innerWidth }));
      assert.equal(future.columns, expectedColumns, `${width}: extra games retain sensible column sizing`);
      assert.ok(future.last > future.first, `${width}: extra games naturally append rows`);
      assert.equal(future.overflow, false);
      await grid.locator("[data-future-test-card]").evaluateAll((elements) => elements.forEach((element) => element.remove()));
      console.log(`PASS ${width}: ${metrics.columns} columns, ${count} real cards, +${added} future cards, full warm canvas/no overflow`);
    }

    await page.setViewportSize({ width: 1440, height: 1000 });
    const before = await grid.boundingBox();
    await page.getByRole("button", { name: "Hide navigation", exact: true }).click();
    const expanded = await grid.boundingBox();
    assert.ok(before && expanded && expanded.width > before.width);
    assert.equal(await nav.isVisible(), false);
    await page.getByRole("button", { name: "Show navigation", exact: true }).click();
    assert.ok(await nav.isVisible());
    await hub.locator('a[href="/play/liturgical-vestments"]').click();
    await page.locator('[data-play-content="game"]').waitFor();
    const frame = page.locator('[data-play-content="game"]');
    assert.equal(await frame.evaluate((element) => getComputedStyle(element).maxWidth), "1152px");
    assert.equal(await frame.locator("..").evaluate((element) => getComputedStyle(element).backgroundColor), "rgb(255, 255, 255)");
    await page.goBack({ waitUntil: "networkidle" });
    await hub.waitFor();
    assert.equal(await pane.evaluate((element) => getComputedStyle(element).backgroundColor), "rgb(253, 250, 247)");
    await page.setViewportSize({ width: 375, height: 1000 });
    await page.getByRole("button", { name: "Explore & Learn", exact: true }).click();
    assert.ok(await nav.isVisible());
    await page.keyboard.press("Escape");
    assert.equal(await nav.isVisible(), false);
    for (const route of ["/resource", "/"]) {
      await page.goto(`${base}${route}`, { waitUntil: "networkidle", timeout: 120_000 });
      const defaultPane = page.locator('aside:has(nav[aria-label="Home"]) + div');
      assert.equal(await defaultPane.evaluate((element) => getComputedStyle(element).backgroundColor), "rgb(255, 255, 255)", `${route}: shared page retains white default`);
      assert.equal(await page.locator("[data-play-content]").count(), 0);
    }
    assert.deepEqual(errors, [], "no hydration/client exceptions");
    console.log("PASS navigation toggles, game/back transitions, privacy/links/a11y, Resource/home default backgrounds, no hydration errors");
  } finally {
    await browser.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });