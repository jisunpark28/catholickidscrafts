/** Run: tsx scripts/test-gospel-story-cards.ts */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import originals from "../src/data/cards/designed-originals.json";
import { cardGroupIds } from "../src/lib/resource/card-groups";
import { hasCardOriginal, readCardOriginal } from "../src/lib/resource/card-originals";
import { relatedWorksheetForCard } from "../src/lib/resource/card-related";
import { cardsForSunday, cardSeasons, getPictureCard, toCardListItem } from "../src/lib/resource/cards";
import { unifiedSearch } from "../src/lib/resource/unified-search";
import { cardPageSeo, cardTalk } from "../src/lib/seo/card-talk";

const NABRE = {
  hand: "Stretch out your hand.",
  children: "Let the children come to me; do not prevent them",
  sparrows: "So do not be afraid; you are worth more than many sparrows.",
} as const;

const expected = [
  {
    id: "BIB-053",
    title: "The Man with the Withered Hand",
    text: `${NABRE.hand} Doing good is always right.`,
    ref: "Mk 3:1–6",
    sheet: "B_OT09",
    prio: 1,
    primary: true,
    query: "withered hand",
  },
  {
    id: "BIB-054",
    title: "Let the Children Come",
    text: `${NABRE.children}… Jesus embraced and blessed them.`,
    ref: "Mk 10:13–16",
    sheet: "B_OT27",
    prio: 2,
    primary: false,
    query: "do not prevent them",
  },
  {
    id: "BIB-055",
    title: "Worth More than Many Sparrows",
    text: NABRE.sparrows,
    ref: "Mt 10:31",
    sheet: "A_OT12",
    prio: 1,
    primary: true,
    query: "many sparrows",
  },
] as const;

async function main() {
  for (const spec of expected) {
    const card = getPictureCard(spec.id);
    assert.ok(card, spec.id);
    assert.equal(card.cat, "Bible");
    assert.equal(card.set, "Jesus' Life & Miracles");
    assert.equal(card.title, spec.title);
    assert.equal(card.text, spec.text);
    assert.equal(card.ref, spec.ref);
    assert.equal(card.prio, spec.prio);
    assert.deepEqual(card.sheetKeys, [spec.sheet]);
  const verse = spec.id === "BIB-055" ? NABRE.sparrows : spec.id === "BIB-053" ? NABRE.hand : NABRE.children;
  assert.ok(card.text.includes(verse));
  assert.equal(card.text.includes('"') || card.text.includes("“") || card.text.includes("”"), false, `${spec.id} caption is stored without quotes; the page adds one pair`);
  assert.ok(!/\b20\d{2}\b/.test(`${card.title} ${card.text}`), `${spec.id} must not print a year`);

    const seasons = cardSeasons(card);
    assert.ok(seasons.includes("ordinary-time"), `${spec.id} seasons ${seasons.join(",")}`);
    const item = toCardListItem(card);
    assert.ok(item.groups?.includes("bible-for-kids"));
    assert.deepEqual(cardGroupIds(card, seasons).filter((id) => id === "bible-for-kids"), ["bible-for-kids"]);

    const sunday = cardsForSunday(spec.sheet);
    if (spec.primary) assert.equal(sunday.primary?.id, spec.id);
    else {
      assert.notEqual(sunday.primary?.id, spec.id);
      assert.ok(sunday.more.some((c) => c.id === spec.id), `${spec.id} stays beside the earlier card for ${spec.sheet}`);
    }

    const related = relatedWorksheetForCard(card);
    assert.equal(related?.label, "Sunday Mass worksheet");
    assert.match(related?.href ?? "", /sunday-mass-worksheets/);

  const talk = cardTalk(card);
  assert.ok(talk);
  assert.equal(talk.caption, card.text);
  assert.equal(talk.questions.length, 3);
  assert.match(talk.questions[0], new RegExp(spec.ref.replace("–", "[–-]")));
  assert.equal(talk.questions[1], `The card says: "${card.text}" What does this show us about God?`);
  const quoteBlock = `“${talk.caption}”`;
  assert.equal(quoteBlock.split("“").length - 1, 1);
  assert.equal(quoteBlock.split("”").length - 1, 1);
  assert.equal(quoteBlock.includes('"'), false);
  const seo = cardPageSeo(card);
  const meta = `${seo.description} ${seo.intro.join(" ")} ${seo.questions.join(" ")}`;
  assert.equal(/[“"]["“]/.test(meta), false, meta);
  assert.equal(/["”]["”]/.test(meta), false, meta);
  assert.ok(seo.description.includes(`"${verse.slice(0, 24)}`), seo.description);
  assert.ok(seo.intro.join(" ").includes(`The card says: "${card.text}"`));

    const hits = unifiedSearch(spec.query, "ordinary-time", null);
    assert.ok(hits.some((h) => h.type === "card" && h.card.id === spec.id), `${spec.query} finds ${spec.id}`);

    assert.equal(await hasCardOriginal(spec.id), true);
    const original = await readCardOriginal(spec.id);
    assert.ok(original && Buffer.isBuffer(original.body));
    assert.equal(createHash("sha256").update(original.body).digest("hex"), originals[spec.id as keyof typeof originals].sha256);
    const full = await sharp(original.body).metadata();
    assert.deepEqual([full.width, full.height, full.format], [1080, 1350, "png"]);
    for (const [folder, w, h] of [
      ["thumbs", 432, 540],
      ["locked", 216, 270],
    ] as const) {
      const meta = await sharp(await fs.readFile(`public/cards/${folder}/${spec.id}.webp`)).metadata();
      assert.deepEqual([meta.width, meta.height, meta.format], [w, h, "webp"]);
    }
  }

  const earlier = getPictureCard("BIB-031");
  assert.equal(earlier?.title, "Jesus Blesses the Children");
  assert.equal(cardsForSunday("B_OT27").primary?.id, "BIB-031");

  console.log("test-gospel-story-cards: 3 Bible cards, NABRE lines, groups, Sunday links, and images OK");
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
