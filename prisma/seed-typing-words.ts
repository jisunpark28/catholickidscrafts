/**
 * Seed TypingWord table from prisma/data/typing-words.ts
 *
 * Usage (Neon URLs in .env):
 *   npm run db:seed-typing
 *
 * Does not require ADMIN_EMAIL / ADMIN_PASSWORD.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { TYPING_WORDS } from "./data/typing-words";

const prisma = new PrismaClient();

function assertTypingWordModel(client: PrismaClient) {
  if (!("typingWord" in client) || !client.typingWord) {
    throw new Error(
      [
        "Prisma client is missing model `TypingWord`.",
        "Fix: git pull origin main, then run:",
        "  npm install",
        "  npx prisma generate",
        "  npx prisma migrate deploy",
        "  npm run db:seed-typing",
      ].join("\n"),
    );
  }
}

export async function seedTypingWords(client: PrismaClient = prisma) {
  assertTypingWordModel(client);
  let upserted = 0;

  for (const item of TYPING_WORDS) {
    const word = item.word.trim();
    await client.typingWord.upsert({
      where: { word },
      update: {
        hint: item.hint,
        sortOrder: item.sortOrder,
        published: true,
      },
      create: {
        word,
        hint: item.hint,
        sortOrder: item.sortOrder,
        published: true,
      },
    });
    upserted += 1;
  }

  return upserted;
}

async function main() {
  const count = await seedTypingWords();
  console.log(`Typing words: ${count} upserted from catalog.`);
  for (const s of [0, 1, 2, 3, 4]) {
    const n = TYPING_WORDS.filter((w) => w.sortOrder === s).length;
    const labels = [
      "prayer basics",
      "24 virtues",
      "Mass terms",
      "apostles & saints",
      "Bible vocabulary",
    ];
    console.log(`  sort ${s} (${labels[s]}): ${n} words`);
  }
}

const isTypingSeedCli = process.argv[1]?.includes("seed-typing-words");
if (isTypingSeedCli) {
  main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      prisma.$disconnect();
      process.exit(1);
    });
}
