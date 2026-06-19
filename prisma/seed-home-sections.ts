import { defaultHomeSectionsForSeed } from "@/lib/home-sections-defaults";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.homeSection.count();
  if (count > 0) {
    console.log("Home sections already seeded — skipping.");
    return;
  }

  for (const section of defaultHomeSectionsForSeed()) {
    await prisma.homeSection.create({
      data: {
        title: section.title,
        sortOrder: section.sortOrder,
        published: true,
        items: {
          create: section.items.map((item) => ({
            title: item.title,
            href: item.href,
            sortOrder: item.sortOrder,
            published: true,
          })),
        },
      },
    });
  }

  console.log("Seeded home sections.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
