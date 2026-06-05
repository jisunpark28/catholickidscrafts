/**
 * Seed HangmanWord table from prisma/data/hangman-words.ts
 *
 * Usage:
 *   npm run db:seed-hangman
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { HANGMAN_WORDS } from "./data/hangman-words";

const prisma = new PrismaClient();

function assertHangmanWordModel(client: PrismaClient) {
  if (!("hangmanWord" in client) || !client.hangmanWord) {
    throw new Error(
      [
        "Prisma client is missing model `HangmanWord`.",
        "Run: npx prisma generate && npx prisma migrate deploy",
      ].join("\n"),
    );
  }
}

export async function seedHangmanWords(client: PrismaClient = prisma) {
  assertHangmanWordModel(client);
  let upserted = 0;

  for (const item of HANGMAN_WORDS) {
    const word = item.word.trim();
    await client.hangmanWord.upsert({
      where: { word },
      update: {
        hint: item.hint,
        sortOrder: item.sortOrder ?? 0,
        published: true,
      },
      create: {
        word,
        hint: item.hint,
        sortOrder: item.sortOrder ?? 0,
        published: true,
      },
    });
    upserted += 1;
  }

  return upserted;
}

async function main() {
  const count = await seedHangmanWords();
  console.log(`Hangman words: ${count} upserted from catalog.`);
}

const isHangmanSeedCli = process.argv[1]?.includes("seed-hangman-words");
if (isHangmanSeedCli) {
  main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      prisma.$disconnect();
      process.exit(1);
    });
}
