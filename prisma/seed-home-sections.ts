import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { seedHomeSections } from "./seed-home-sections-lib";

const prisma = new PrismaClient();

async function main() {
  await seedHomeSections(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
