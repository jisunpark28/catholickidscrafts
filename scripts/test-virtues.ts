/** Run: tsx scripts/test-virtues.ts */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import originals from "../src/data/cards/designed-originals.json";
import { COURAGE } from "../src/data/virtues/courage";
import { VIRTUE_BUNDLES, getVirtue } from "../src/lib/virtues";
import { getEvergreenPageBySlug } from "../src/lib/evergreen-catalog";
import { sidebarItemIsCurrent } from "../src/lib/sidebar-navigation";
import { getPictureCard } from "../src/lib/resource/cards";

const KEY_VERSE = "So do not be afraid; you are worth more than many sparrows.";
const QUESTIONS = [
  "What would it be like if most of your class teased one friend and only you stopped?",
  "Have you ever thought it was okay because everyone was doing it?",
  "How would you feel if everyone mocked your drawing or knocked down your blocks?",
  "What would you want a friend to do when you're upset?",
];

function noYear(text: string, label: string) {
  assert.equal(/\b\d{4}\b/.test(text), false, `${label} must not print a four-digit year`);
}

async function main() {
  assert.deepEqual(VIRTUE_BUNDLES.map((v) => v.slug), ["courage"]);
  assert.equal(getVirtue("hope"), null);
  assert.equal(getVirtue("courage")?.name, "Courage");
  assert.equal(sidebarItemIsCurrent("virtues", "/virtues"), true);
  assert.equal(sidebarItemIsCurrent("virtues", "/virtues/courage"), true);
  assert.equal(sidebarItemIsCurrent("prayer", "/catholic-virtue-challenge"), true);
  assert.equal(sidebarItemIsCurrent("virtues", "/catholic-virtue-challenge"), false);
  assert.equal(sidebarItemIsCurrent("prayer", "/virtues"), false);

  assert.deepEqual(
    COURAGE.stories.map((s) => s.ref),
    ["Mark 3:1–6", "Mark 10:13–16", "Daniel 6:11–24"],
  );
  assert.equal(COURAGE.stories[0]?.cardId, "VIR-078");
  assert.equal(COURAGE.stories[1]?.cardId, "VIR-079");
  assert.equal(COURAGE.stories[2]?.cardId, undefined);
  assert.equal(COURAGE.keyVerse.ref, "Matthew 10:31");
  assert.equal(COURAGE.keyVerse.text, KEY_VERSE);
  assert.match(COURAGE.keyVerse.note, /So/);
  assert.equal(COURAGE.keyVerse.cardId, "VIR-080");
  assert.deepEqual(COURAGE.scenarios.flatMap((s) => [...s.questions]), QUESTIONS);
  assert.match(COURAGE.commitment, /^I will be courageous\./);
  assert.match(COURAGE.encouragement, /real courage/);
  assert.equal(COURAGE.worksheet.slug, "courage");
  assert.equal(getEvergreenPageBySlug("courage")?.key, "VIR_COURAGE");

  const kidCopy = [
    COURAGE.commitment,
    COURAGE.encouragement,
    COURAGE.keyVerse.text,
    ...COURAGE.stories.map((s) => `${s.title} ${s.summary}`),
    ...COURAGE.scenarios.flatMap((s) => [s.situation, ...s.questions]),
  ].join("\n");
  noYear(kidCopy, "courage copy");

  for (const id of ["VIR-078", "VIR-079", "VIR-080"] as const) {
    const card = getPictureCard(id);
    assert.ok(card, id);
    assert.equal(card.cat, "Virtue & Life");
    assert.equal(card.set, "Virtues");
    assert.equal(card.text.includes('"') || card.text.includes("“") || card.text.includes("”"), false);
    noYear(`${card.title} ${card.text}`, id);
    assert.deepEqual(card.sheetKeys, ["VIR_COURAGE"]);
    const body = await fs.readFile(`assets/card-originals/${id}.png`);
    assert.equal(createHash("sha256").update(body).digest("hex"), originals[id].sha256);
    const full = await sharp(body).metadata();
    assert.deepEqual([full.width, full.height, full.format], [1080, 1350, "png"]);
    const thumb = await sharp(await fs.readFile(`public/cards/thumbs/${id}.webp`)).metadata();
    assert.deepEqual([thumb.width, thumb.height, thumb.format], [432, 540, "webp"]);
    const locked = await sharp(await fs.readFile(`public/cards/locked/${id}.webp`)).metadata();
    assert.deepEqual([locked.width, locked.height, locked.format], [216, 270, "webp"]);
  }

  assert.equal(getPictureCard("BIB-031")?.title, "Jesus Blesses the Children");
  console.log("test-virtues: Courage bundle, NABRE verse, three Virtue cards, and worksheet slug OK");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
