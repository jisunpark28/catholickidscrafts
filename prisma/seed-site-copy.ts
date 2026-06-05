import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { SITE_COPY_DEFAULTS } from "./data/site-copy-defaults";

const prisma = new PrismaClient();

export async function seedSiteCopy(client: PrismaClient = prisma) {
  let upserted = 0;
  for (const row of SITE_COPY_DEFAULTS) {
    await client.siteCopy.upsert({
      where: { key: row.key },
      update: {
        value: row.value,
        group: row.group,
        hint: row.hint ?? null,
        format: row.format ?? "plain",
        published: true,
      },
      create: {
        key: row.key,
        value: row.value,
        group: row.group,
        hint: row.hint ?? null,
        format: row.format ?? "plain",
        published: true,
      },
    });
    upserted += 1;
  }
  return upserted;
}

async function main() {
  const count = await seedSiteCopy();
  console.log(`Site copy: ${count} keys upserted.`);
}

const isCli = process.argv[1]?.includes("seed-site-copy");
if (isCli) {
  main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      prisma.$disconnect();
      process.exit(1);
    });
}
