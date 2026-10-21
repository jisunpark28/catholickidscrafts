/**
 * Upsert Sunday Gospel sheets from prisma/data/gospel-sheets.ts (published, not featured).
 *
 * Usage (DATABASE_URL in .env; run `prisma migrate deploy` first):
 *   npm run db:seed-gospel-sheets
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { GOSPEL_SHEETS } from "./data/gospel-sheets";

const prisma = new PrismaClient();

async function main() {
  for (const s of GOSPEL_SHEETS) {
    const sundayDate = new Date(`${s.sundayDate}T00:00:00.000Z`);
    const data = {
      slug: s.sundayDate,
      liturgicalName: s.liturgicalName,
      gospelRef: s.gospelRef,
      usccbUrl: s.usccbUrl,
      color: s.color,
      levels: s.levels,
    };
    await prisma.gospelSheet.upsert({
      where: { sundayDate },
      create: { ...data, sundayDate, published: true },
      update: data,
    });
    console.log(`Upserted sheet ${s.sundayDate} (${s.liturgicalName})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
