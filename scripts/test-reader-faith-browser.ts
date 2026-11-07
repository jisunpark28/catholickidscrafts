import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright";
import { FAITH_CATEGORY_LINKS } from "../src/components/faith/FaithCategoryDirectory";
import { catalogQaDeck } from "../src/lib/liturgy-qa-catalog";
import { FAITH_SEO_CARDS } from "../src/lib/seo/card-seo";

const base = process.env.READER_BASE_URL || "http://127.0.0.1:3039";
const out = process.env.READER_SCREENSHOT_DIR || "/opt/cursor/artifacts";
const key = "ckc-bible-reading-size-v1";

async function waitFor(check: () => Promise<boolean>, label: string) {
  const start = Date.now();
  while (Date.now() - start < 10000) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(label);
}

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat|didn't match|Minified React error/i.test(message.text())) {
      errors.push(message.text());
    }
  });
  return errors;
}

function htmlHas(html: string, text: string) {
  const decoded = html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
  return decoded.includes(text);
}

async function run() {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const deck = catalogQaDeck();
  const cards = deck.flatMap((section) => section.cards);
  const longest = [...cards].sort((a, b) => b.answer.length - a.answer.length)[0]!;
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
    page.setDefaultNavigationTimeout(120_000);
    page.setDefaultTimeout(30_000);
    const errors = trackErrors(page);
    const response = await page.goto(`${base}/bible/read/genesis/1?lang=en&test=preserve`, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200, "reader route");
    const inc = page.getByRole("button", { name: "Increase reading text size", exact: true });
    const dec = page.getByRole("button", { name: "Decrease reading text size", exact: true });
    await inc.waitFor();
    assert.equal(await dec.isDisabled(), true);
    const text = page.locator(".bible-reader__verse").first();
    const original = await text.textContent();
    const titleSize = await page.locator(".bible-reader__title").evaluate((el) => getComputedStyle(el).fontSize);
    const sidebarSize = await page.locator("aside h2").first().evaluate((el) => getComputedStyle(el).fontSize);
    for (let i = 0; i < 6; i++) await inc.click();
    assert.equal(await inc.isDisabled(), true);
    assert.equal(await text.evaluate((el) => getComputedStyle(el).fontSize), "32px");
    assert.equal(await text.textContent(), original);
    assert.equal(await page.locator(".bible-reader__title").evaluate((el) => getComputedStyle(el).fontSize), titleSize);
    assert.equal(await page.locator("aside h2").first().evaluate((el) => getComputedStyle(el).fontSize), sidebarSize);
    assert.ok(page.url().includes("lang=en&test=preserve"));
    await text.focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".mb-palette").count(), 1, "verse palette still opens");
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".mb-palette").count(), 0);
    assert.ok((await text.getAttribute("class"))?.includes("mb-hl--yellow"), "sample highlight remains");
    await page.screenshot({ path: path.join(out, "ckc-reader-large-desktop.png"), fullPage: false });
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await text.evaluate((el) => getComputedStyle(el).fontSize), "32px");
    await page.goto(`${base}/bible/read/genesis/2?lang=en`, { waitUntil: "networkidle" });
    assert.equal(await page.locator(".bible-reader__verse").first().evaluate((el) => getComputedStyle(el).fontSize), "32px");
    await page.getByRole("button", { name: "Decrease reading text size", exact: true }).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".bible-reader__verse").first().evaluate((el) => getComputedStyle(el).fontSize), "28px");
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await page.screenshot({ path: path.join(out, "ckc-reader-large-mobile.png"), fullPage: false });
    await page.evaluate((storageKey) => localStorage.setItem(storageKey, "broken"), key);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator(".bible-reader__verse").first().evaluate((el) => getComputedStyle(el).fontSize), "16.5px");

    const blocked = await browser.newPage();
    await blocked.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw new Error("blocked");
      };
      Storage.prototype.setItem = () => {
        throw new Error("blocked");
      };
    });
    await blocked.goto(`${base}/bible/read/genesis/1?lang=en`, { waitUntil: "networkidle" });
    await blocked.getByRole("button", { name: "Increase reading text size", exact: true }).click();
    assert.equal(await blocked.locator(".bible-reader__verse").first().evaluate((el) => getComputedStyle(el).fontSize), "18px");
    await blocked.close();

    const early = await browser.newPage();
    await early.addInitScript((storageKey) => localStorage.setItem(storageKey, "32"), key);
    await early.route("**/_next/static/**/*.js", (route) => route.abort());
    await early.goto(`${base}/bible/read/genesis/1?lang=en`, { waitUntil: "domcontentloaded" });
    await early.locator(".bible-reader__verse").first().waitFor();
    assert.equal(
      await early.locator(".bible-reader__verse").first().evaluate((el) => getComputedStyle(el).fontSize),
      "32px",
      "saved size without hydration bundle",
    );
    await early.close();

    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.goto(`${base}/prayers`, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Q&A Cards", exact: true }).click();
    await page.waitForURL("**/catholic-faith-questions#qa-cards");
    const qaLink = page.getByRole("link", { name: "Q&A Cards", exact: true });
    await waitFor(async () => (await qaLink.getAttribute("aria-current")) === "page", "Q&A Cards highlight");
    const qa = page.locator("#qa-cards");
    await waitFor(async () => {
      const box = await qa.boundingBox();
      return Boolean(box && box.y < 400);
    }, "qa-cards scrolled into view");
    assert.equal(await page.locator("#qa-cards [data-qa-topic]").count(), 10);
    assert.equal(await page.locator('#qa-cards a[href^="/catholic-faith-questions/"]').count(), 0);
    const qaText = await qa.evaluate((el) => el.textContent ?? "");
    for (const section of deck) {
      assert.ok(qaText.includes(section.topic.title), section.slug);
      for (const card of section.cards) {
        assert.ok(qaText.includes(card.question), card.question);
        assert.ok(qaText.includes(card.answer), card.answer);
      }
    }
    const target = page.locator(`[data-qa-card="${longest.id}"]`);
    const front = target.locator(".qa-front");
    await front.focus();
    await page.keyboard.press("Enter");
    await waitFor(async () => (await target.getAttribute("data-flipped")) === "true", "keyboard flip");
    const fit = await target.locator(".qa-answer").evaluate((el) => {
      const answer = el.getBoundingClientRect();
      const card = el.closest(".qa-card")!.getBoundingClientRect();
      return { inside: answer.bottom <= card.bottom + 1 && answer.top >= card.top - 1, overflow: el.scrollHeight - el.clientHeight };
    });
    assert.equal(fit.inside, true, "answer fits inside the card");
    assert.ok(fit.overflow <= 1, "answer is not clipped");
    await page.screenshot({ path: path.join(out, "ckc-qa-flip-desktop.png"), fullPage: false });
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await waitFor(async () => (await target.getAttribute("data-flipped")) === "false", "keyboard flip back");

    const articles = page.locator("[data-faith-article]");
    assert.equal(await articles.count(), FAITH_SEO_CARDS.length);
    const hrefs = await articles.evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    assert.equal(new Set(hrefs).size, FAITH_SEO_CARDS.length);
    await page.locator("summary").filter({ hasText: "Browse Faith" }).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("#faith-prayer a").count(), FAITH_CATEGORY_LINKS.length);
    await page.screenshot({ path: path.join(out, "ckc-faith-articles-desktop.png"), fullPage: false });

    let checked = 0;
    const queue = [...FAITH_SEO_CARDS];
    await Promise.all(
      Array.from({ length: 6 }, async () => {
        for (let card = queue.shift(); card; card = queue.shift()) {
          const result = await page.request.get(`${base}/catholic-faith-questions/${card.slug}`);
          assert.equal(result.status(), 200, card.slug);
          const html = await result.text();
          assert.ok(htmlHas(html, "Family conversation questions"), card.slug);
          assert.ok(htmlHas(html, "Keep exploring"), card.slug);
          assert.equal(html.includes("FAQPage"), false, card.slug);
          assert.equal(html.includes("datePublished"), false, card.slug);
          assert.ok(htmlHas(html, card.title), card.slug);
          checked++;
        }
      }),
    );

    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
    const mobilePage = await mobile.newPage();
    mobilePage.setDefaultNavigationTimeout(120_000);
    await mobilePage.goto(`${base}/catholic-faith-questions#qa-cards`, { waitUntil: "networkidle" });
    const mobileCard = mobilePage.locator("[data-qa-card]").nth(3);
    await mobileCard.scrollIntoViewIfNeeded();
    await mobileCard.locator(".qa-front").tap();
    await waitFor(async () => (await mobileCard.getAttribute("data-flipped")) === "true", "touch flip");
    assert.equal(await mobilePage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await mobilePage.screenshot({ path: path.join(out, "ckc-qa-flip-mobile.png"), fullPage: false });
    await mobile.close();

    const reduced = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    await reduced.goto(`${base}/catholic-faith-questions#qa-cards`, { waitUntil: "networkidle" });
    const reducedCard = reduced.locator("[data-qa-card]").first();
    await reducedCard.locator(".qa-front").click();
    await waitFor(async () => (await reducedCard.getAttribute("data-flipped")) === "true", "reduced-motion flip");
    const transform = await reducedCard.locator(".qa-inner").evaluate((el) => getComputedStyle(el).transform);
    assert.ok(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)", transform);
    await waitFor(async () => {
      const back = await reducedCard.locator(".qa-back").evaluate((el) => getComputedStyle(el).opacity);
      const front = await reducedCard.locator(".qa-front").evaluate((el) => getComputedStyle(el).opacity);
      return back === "1" && front === "0";
    }, "reduced-motion answer visible");
    await reduced.close();

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${base}/catholic-faith-questions/${FAITH_SEO_CARDS[0]!.slug}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(out, "ckc-faith-article-desktop.png"), fullPage: false });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.locator("article h1").count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await page.screenshot({ path: path.join(out, "ckc-faith-article-mobile.png"), fullPage: false });
    await page.getByRole("link", { name: "Back to faith cards", exact: true }).click();
    await page.waitForURL("**/catholic-faith-questions");
    assert.deepEqual(errors, []);
    console.log(
      `PASS reader bounds/keyboard/persistence/storage; ${cards.length} flip cards in 10 topics; ${checked} article HTTP 200s; reduced motion and mobile.`,
    );
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
