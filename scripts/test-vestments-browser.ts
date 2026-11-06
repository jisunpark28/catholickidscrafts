import assert from "node:assert/strict";
import { chromium } from "playwright";
import { tmpdir } from "node:os";
import path from "node:path";
import { EXPECTED_VESTMENT_LABELS, EXPECTED_VESTMENT_QUIZ } from "./vestments-test-fixtures";

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      return ["localhost", "127.0.0.1"].includes(url.hostname) ? route.continue() : route.abort();
    });
    await page.addInitScript(() => {
      let seed = 37;
      Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
    });
    const base = process.env.VESTMENTS_BASE_URL ?? "http://localhost:3027";
    const response = await page.goto(`${base}/play/liturgical-vestments`, { waitUntil: "networkidle", timeout: 120_000 });
    assert.equal(response?.status(), 200);
    const game = page.locator("[data-vestment-round]");
    const check = page.getByRole("button", { name: "Check vestments", exact: true });
    const normalize = (text: string) => text.replace(/[\u2013\u2014]/g, "-");
    assert.equal(await page.getByRole("button", { name: "Light purple", exact: true }).count(), 0);
    await page.screenshot({ path: path.join(process.env.VESTMENTS_SCREENSHOT_DIR ?? tmpdir(), "vestments-desktop-check.png"), fullPage: true });
    let correctPaths = 0;
    let wrongPaths = 0;
    for (const color of Object.keys(EXPECTED_VESTMENT_LABELS) as (keyof typeof EXPECTED_VESTMENT_LABELS)[]) {
      const seen = new Set<string>();
      let score = 0;
      for (let index = 0; index < 12; index++) {
        await game.waitFor({ state: "visible" });
        const id = await game.getAttribute("data-vestment-round") as keyof typeof EXPECTED_VESTMENT_QUIZ;
        assert.ok(id in EXPECTED_VESTMENT_QUIZ, `unknown round ${id}`);
        assert.ok(!seen.has(id), `repeated ${id}`);
        seen.add(id);
        const expected = EXPECTED_VESTMENT_QUIZ[id];
        assert.ok(normalize(await game.locator("h2").innerText()).startsWith(expected.title), id + " question");
        assert.ok(await check.isDisabled(), "initial check disabled");
        assert.equal(await game.locator('button[aria-pressed="true"]').count(), 0, "selection cleared");
        const figure = game.getByRole("img");
        assert.equal(await figure.getAttribute("src"), "/games/liturgical-vestments/character-white.png", "default/reset image");
        for (const label of Object.values(EXPECTED_VESTMENT_LABELS)) {
          assert.ok(await game.getByRole("button", { name: label, exact: true }).isEnabled());
        }
        if (index === 0) {
          await game.getByRole("button", { name: "Red", exact: true }).click();
          await page.waitForFunction(() => document.querySelector('[data-vestment-round] img')?.getAttribute('src')?.includes('character-red.png'));
        }
        await game.getByRole("button", { name: EXPECTED_VESTMENT_LABELS[color], exact: true }).click();
        await page.waitForFunction((value) => document.querySelector('[data-vestment-round] img')?.getAttribute('src')?.endsWith(`character-${value}.png`), color);
        await figure.evaluate((image: HTMLImageElement) => image.decode());
        assert.equal(await figure.evaluate((image: HTMLImageElement) => image.naturalWidth), 960);
        assert.equal(await figure.getAttribute("alt"), `Priest wearing ${EXPECTED_VESTMENT_LABELS[color].toLowerCase()} liturgical vestments`);
        const accepted = (expected.colors as readonly string[]).includes(color);
        await check.click();
        await page.getByText(accepted ? "Correct!" : "Not quite.", { exact: true }).waitFor();
        if (accepted) {
          score++; correctPaths++;
          assert.ok((await game.innerText()).includes(`${EXPECTED_VESTMENT_LABELS[color]} is right for`));
        } else {
          wrongPaths++;
          const correction = await game.locator("strong").innerText();
          assert.equal(correction, expected.colors.map((value) => EXPECTED_VESTMENT_LABELS[value]).join(" or "));
        }
        if (expected.colors.length === 2) {
          assert.ok((await game.innerText()).includes("the seasonal purple is also correct"));
        }
        assert.ok(await check.isDisabled(), "submitted check locked");
        for (const label of Object.values(EXPECTED_VESTMENT_LABELS)) {
          assert.ok(await game.getByRole("button", { name: label, exact: true }).isDisabled(), "submitted choices locked");
        }
        await check.evaluate((button: HTMLButtonElement) => button.click());
        assert.ok((await game.innerText()).includes(`Score: ${score}`), "repeat click cannot score");
        await game.getByRole("button", { name: accepted ? /^Next/ : /^Try next round/ }).click();
        if (index < 11) {
          await page.waitForFunction((previous) => document.querySelector('[data-vestment-round]')?.getAttribute('data-vestment-round') !== previous, id);
        }
      }
      assert.equal(seen.size, 12);
      await page.getByText(`You dressed Father correctly ${score} of 12 times.`, { exact: true }).waitFor();
      assert.equal(await game.count(), 0, "finished game shows no stale question");
      await page.getByRole("button", { name: "Play again", exact: true }).click();
      await game.waitFor();
      assert.ok((await game.innerText()).includes("Round 1 / 12"));
      assert.ok((await game.innerText()).includes("Score: 0"));
      assert.ok(await check.isDisabled());
      console.log(`PASS rendered ${color}: all 12 questions, score ${score}, completion + restart`);
    }
    assert.equal(correctPaths, 14);
    assert.equal(wrongPaths, 46);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "no mobile overflow");
    for (const color of Object.keys(EXPECTED_VESTMENT_LABELS) as (keyof typeof EXPECTED_VESTMENT_LABELS)[]) {
      await game.getByRole("button", { name: EXPECTED_VESTMENT_LABELS[color], exact: true }).click();
      await page.waitForFunction((value) => document.querySelector('[data-vestment-round] img')?.getAttribute('src')?.endsWith(`character-${value}.png`), color);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(process.env.VESTMENTS_SCREENSHOT_DIR ?? tmpdir(), "vestments-mobile-check.png"), fullPage: true });
    assert.deepEqual(errors, [], "no hydration/client exceptions");
    console.log(`PASS browser: 60 rendered answers (${correctPaths} correct/${wrongPaths} wrong), all 5 loaded assets, mobile palette, no hydration errors.`);
  } finally {
    await browser.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
