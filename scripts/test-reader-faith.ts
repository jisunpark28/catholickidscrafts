import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import seed from "../prisma/data/liturgy-qa-cards.json";
import { FAITH_CATEGORY_LINKS } from "../src/components/faith/FaithCategoryDirectory";
import {
  parseReadingSize,
  READING_SIZE_BOOTSTRAP,
  READING_SIZES,
  stepReadingSize,
} from "../src/lib/bible/reading-size";
import { buildHomePdfNav } from "../src/lib/home-pdf-nav";
import { assembleQaDeck, catalogQaDeck, type QaDeckRead } from "../src/lib/liturgy-qa-catalog";
import { LITURGY_TOPICS, type LiturgyTopic } from "../src/lib/liturgy-topics";
import { FAITH_SEO_CARDS, faithPageSeo, getFaithSeoCard, groupFaithByCatThenSet } from "../src/lib/seo/card-seo";

for (const bad of [null, "", "NaN", "Infinity", "100", "-1", "18px", "18 ", "18.0", "<script>"]) {
  assert.equal(parseReadingSize(bad), 16.5, `reject ${String(bad)}`);
}
for (const size of READING_SIZES) assert.equal(parseReadingSize(String(size)), size);
assert.equal(stepReadingSize(16.5, -1), 16.5);
assert.equal(stepReadingSize(32, 1), 32);
for (let i = 0; i < READING_SIZES.length - 1; i++) {
  assert.equal(stepReadingSize(READING_SIZES[i]!, 1), READING_SIZES[i + 1]);
}
for (const raw of ["32", "bad", null]) {
  const style = { id: "", textContent: "" };
  const head = { appendChild() {} };
  vm.runInNewContext(READING_SIZE_BOOTSTRAP, {
    localStorage: { getItem: () => raw },
    document: { head, getElementById: () => null, createElement: () => style },
  });
  assert.equal(style.textContent, raw === "32" ? ":root{--bible-reading-size:32px}" : "");
}
vm.runInNewContext(READING_SIZE_BOOTSTRAP, {
  localStorage: {
    getItem() {
      throw new Error("blocked");
    },
  },
  document: {},
});

assert.equal(new Set(FAITH_SEO_CARDS.map((card) => card.slug)).size, FAITH_SEO_CARDS.length);
for (const card of FAITH_SEO_CARDS) {
  assert.equal(getFaithSeoCard(card.slug)?.id, card.id);
  assert.ok(card.text);
  assert.ok(faithPageSeo(card).intro.every(Boolean));
  assert.equal(faithPageSeo(card).questions.length, 3);
}
assert.equal(groupFaithByCatThenSet().flatMap((group) => group.sets.flatMap((set) => set.cards)).length, FAITH_SEO_CARDS.length);
for (const image of ["prayers", "curriculum", "liturgy"]) {
  assert.ok(fs.existsSync(`public/home-features/${image}.webp`), image);
}

const ten = new Set<string>(LITURGY_TOPICS);
const jsonCards = seed.cards.filter((card) => ten.has(card.topicSlug));
const deck = catalogQaDeck();
assert.deepEqual(deck.map((section) => section.slug), [...LITURGY_TOPICS]);
const deckPairs = deck.flatMap((section) => section.cards.map((card) => `${section.slug}\n${card.question}\n${card.answer}\n${card.tryThis}`));
const jsonPairs = jsonCards.map((card) => `${card.topicSlug}\n${card.question}\n${card.answer}\n${card.tryThis ?? ""}`);
assert.deepEqual(deckPairs, jsonPairs);
for (const card of deck.flatMap((section) => section.cards)) {
  assert.deepEqual(Object.keys(card).sort(), ["altText", "answer", "cardColor", "iconFallback", "id", "imageUrl", "question", "tryThis"]);
  assert.equal(card.imageUrl, null);
}
const prayerOnly = seed.cards.filter((card) => card.topicSlug === "prayers").map((card) => card.question);
assert.ok(prayerOnly.length > 0);
for (const question of prayerOnly) {
  assert.equal(deck.some((section) => section.cards.some((card) => card.question === question)), false, question);
}

const catalogMass = deck.find((section) => section.slug === "mass")!;
const publishedOne = catalogMass.cards.slice(0, 1);
const errorReads = Object.fromEntries(LITURGY_TOPICS.map((slug) => [slug, { status: "error" } satisfies QaDeckRead])) as Partial<Record<LiturgyTopic, QaDeckRead>>;
assert.equal(assembleQaDeck(errorReads).length, 10);
assert.ok(assembleQaDeck(errorReads).every((section) => section.source === "catalog"));

const emptyReads = Object.fromEntries(LITURGY_TOPICS.map((slug) => [slug, { status: "empty" } satisfies QaDeckRead])) as Partial<Record<LiturgyTopic, QaDeckRead>>;
assert.equal(assembleQaDeck(emptyReads).length, 0);

const mixedReads: Partial<Record<LiturgyTopic, QaDeckRead>> = {
  ...errorReads,
  mass: { status: "ok", topic: catalogMass.topic, cards: publishedOne },
  advent: { status: "empty" },
};
const mixed = assembleQaDeck(mixedReads);
assert.equal(mixed.find((section) => section.slug === "mass")?.source, "published");
assert.equal(mixed.find((section) => section.slug === "mass")?.cards.length, 1);
assert.equal(mixed.find((section) => section.slug === "advent"), undefined);
assert.equal(mixed.find((section) => section.slug === "lent")?.source, "catalog");
assert.equal(mixed.length, 9);

const nav = buildHomePdfNav([], { gallery: "Gallery", curriculum: "Curriculum", resources: "Resources", play: "Play" });
const links = nav.groups.flatMap((group) => group.items);
assert.equal(links.find((item) => item.label === "Q&A Cards")?.href, "/catholic-faith-questions#qa-cards");
assert.equal(links.find((item) => item.label === "Old Testament")?.href, "/bible/genesis");
assert.equal(links.find((item) => item.label === "New Testament")?.href, "/bible/matthew");
assert.equal(FAITH_CATEGORY_LINKS.length, 11);
assert.deepEqual(
  FAITH_CATEGORY_LINKS.map((item) => item.href),
  ["/prayers", ...LITURGY_TOPICS.map((slug) => `/liturgy/${slug}`)],
);

const hub = fs.readFileSync("src/app/(site)/catholic-faith-questions/page.tsx", "utf8");
const article = fs.readFileSync("src/app/(site)/catholic-faith-questions/[slug]/page.tsx", "utf8");
assert.ok(hub.includes('id="qa-cards"'));
assert.ok(hub.includes("<QaFlipCards"));
assert.ok(hub.includes("<FaithArticleCard"));
assert.equal(hub.includes("FAQPage"), false);
assert.equal(article.includes("FAQPage"), false);
assert.equal(article.includes("datePublished"), false);
assert.ok(article.includes("Back to faith cards"));
assert.equal(article.includes("/bible/old-testament"), false);
assert.equal(article.includes("/bible/new-testament"), false);

console.log(
  `PASS reading size; ${FAITH_SEO_CARDS.length} faith articles; ${jsonCards.length} Q&A cards across ${deck.length} topics; sidebar #qa-cards; no FAQ schema.`,
);
