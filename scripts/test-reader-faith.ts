import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import seed from "../prisma/data/liturgy-qa-cards.json";
import {
  parseReadingSize,
  READING_SIZE_BOOTSTRAP,
  READING_SIZES,
  stepReadingSize,
} from "../src/lib/bible/reading-size";
import { buildHomePdfNav } from "../src/lib/home-pdf-nav";
import { assembleQaDeck, catalogQaDeck, type QaDeckRead } from "../src/lib/liturgy-qa-catalog";
import { LITURGY_TOPIC_LABELS, LITURGY_TOPICS, type LiturgyTopic } from "../src/lib/liturgy-topics";
import { SIDEBAR_ITEMS, sidebarItemIsCurrent } from "../src/lib/sidebar-navigation";
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

const qa = SIDEBAR_ITEMS.find((item) => item.id === "questions");
const faith = SIDEBAR_ITEMS.find((item) => item.id === "prayer");
assert.equal(qa?.href, "/qa-cards");
assert.equal(faith?.href, "/prayers");
assert.equal(faith?.label, "Prayer");
assert.equal(sidebarItemIsCurrent("questions", "/qa-cards"), true);
assert.equal(sidebarItemIsCurrent("questions", "/qa-cards", "#advent"), true);
assert.equal(sidebarItemIsCurrent("prayer", "/qa-cards"), false);
assert.equal(sidebarItemIsCurrent("prayer", "/prayers"), true);
assert.equal(sidebarItemIsCurrent("questions", "/prayers"), false);
assert.equal(SIDEBAR_ITEMS.some((item) => item.href?.includes("/bible/old-testament") || item.href?.includes("/bible/new-testament")), false);
const directory = buildHomePdfNav([], { gallery: "Gallery", curriculum: "Curriculum", resources: "Resources", play: "Play" });
const categoryHrefs = directory.groups
  .filter((group) => group.id === "faith" || group.id === "liturgical-year")
  .flatMap((group) => group.items.map((item) => item.href));
assert.deepEqual(categoryHrefs, ["/prayers", ...LITURGY_TOPICS.map((slug) => `/liturgy/${slug}`)]);
assert.equal(fs.readFileSync("src/components/home/HomePdfShell.tsx", "utf8").includes("SidebarNavigation"), true);
assert.equal(fs.readFileSync("src/components/home/HomePdfShell.tsx", "utf8").includes("Old Testament"), false);

assert.equal(fs.existsSync("src/app/(site)/catholic-faith-questions"), false, "faith question pages are deleted (404)");
const qaPage = fs.readFileSync("src/app/(site)/qa-cards/page.tsx", "utf8");
const qaTabs = fs.readFileSync("src/components/liturgy/QaCardsByTopic.tsx", "utf8");
assert.ok(qaPage.includes("loadLiturgyQaDeck"));
assert.ok(qaPage.includes("export const revalidate = 3600"));
assert.equal(/cookies\(|headers\(/.test(qaPage), false, "Q&A page stays static");
assert.ok(qaTabs.includes("<QaFlipCards"));
assert.ok(qaPage.includes("Find answers to your questions about the Mass and the liturgy."));
assert.ok(qaPage.includes("Send us feedback anytime."));
assert.equal(qaPage.includes("Tap a card to read the answer"), false);
assert.equal(qaTabs.includes("tab.topic.title"), false);
assert.equal(qaTabs.includes("tab.topic.bigIdea"), false);
assert.equal(qaTabs.includes("{tab.label} page"), false);
assert.equal(qaTabs.includes('from "next/link"'), false);
assert.ok(qaTabs.includes("aria-labelledby={`qa-tab-${tab.slug}`}"));
assert.equal(qaPage.includes("FAQPage"), false);
assert.deepEqual(LITURGY_TOPICS.map((slug) => LITURGY_TOPIC_LABELS[slug]), ["Mass", "Sacraments", "Saints", "Devotions", "Ordinary Time", "Advent", "Christmas Time", "Lent", "Paschal Triduum", "Easter Time"]);
assert.ok(fs.readFileSync("src/lib/public-revalidate.ts", "utf8").includes('revalidatePath("/qa-cards")'));

console.log(
  `PASS reading size; ${FAITH_SEO_CARDS.length} faith articles; ${jsonCards.length} Q&A cards across ${deck.length} topics; sidebar /qa-cards; no FAQ schema.`,
);
