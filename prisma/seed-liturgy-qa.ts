/**
 * Upsert liturgy Q&A topics and cards from prisma/data/liturgy-qa-cards.json.
 * New cards start as DRAFT. Existing cards keep their status, and cards edited in
 * admin (adminEditedAt set) are skipped unless --force is passed.
 *
 * Usage (DATABASE_URL in .env; run `prisma migrate deploy` first):
 *   npm run db:seed-liturgy-qa
 *   npm run db:seed-liturgy-qa -- --force
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import data from "./data/liturgy-qa-cards.json";

const prisma = new PrismaClient();
const force = process.argv.includes("--force");

type SeedTopic = (typeof data.topics)[number];
type SeedCard = (typeof data.cards)[number];

function topicFields(t: SeedTopic) {
  return {
    title: t.title,
    bigIdea: t.bigIdea,
    ageNote: t.ageNote,
    accentColor: t.accentColor,
    cardBackColor: t.cardBackColor,
    sortOrder: t.sortOrder,
  };
}

function cardFields(c: SeedCard) {
  return {
    question: c.question,
    answer: c.answer,
    tryThis: c.tryThis,
    iconFallback: c.iconFallback,
    imageFilename: c.imageFilename,
    imageScene: c.imageScene,
    imagePrompt: c.imagePrompt,
    altText: c.altText,
    cardColor: c.cardColor,
    internalSourceRef: c.internalSourceRef,
    reviewNote: c.reviewNote ?? "",
  };
}

async function main() {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const t of data.topics) {
    const existing = await prisma.liturgyQaTopic.findUnique({ where: { slug: t.slug } });
    if (!existing) {
      await prisma.liturgyQaTopic.create({ data: { slug: t.slug, ...topicFields(t) } });
    } else if (force) {
      await prisma.liturgyQaTopic.update({ where: { slug: t.slug }, data: topicFields(t) });
    }
  }

  for (const c of data.cards) {
    const where = { topicSlug_sortOrder: { topicSlug: c.topicSlug, sortOrder: c.sortOrder } };
    const existing = await prisma.liturgyQaCard.findUnique({ where });
    if (!existing) {
      await prisma.liturgyQaCard.create({
        data: { topicSlug: c.topicSlug, sortOrder: c.sortOrder, status: "DRAFT", ...cardFields(c) },
      });
      created++;
    } else if (existing.adminEditedAt && !force) {
      skipped++;
    } else {
      await prisma.liturgyQaCard.update({ where, data: cardFields(c) });
      updated++;
    }
  }

  console.log(
    `Liturgy Q&A: ${created} created, ${updated} updated, ${skipped} skipped (edited in admin)${force ? " [force]" : ""}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
