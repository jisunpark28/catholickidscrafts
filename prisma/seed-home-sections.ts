import { defaultHomeSectionsForSeed } from "@/lib/home-sections-defaults";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Ensures new default hub pills exist on already-seeded databases. */
async function ensureMissingHomeItems() {
  const playLearn = await prisma.homeSection.findFirst({
    where: { title: "Play & Learn" },
    include: { items: true },
  });
  if (!playLearn) return;

  const classLessons = playLearn.items.find((i) => i.href === "/program");
  if (!classLessons) {
    await prisma.homeSectionItem.create({
      data: {
        sectionId: playLearn.id,
        title: "Class lessons",
        href: "/program",
        sortOrder: 1,
        published: true,
      },
    });
    console.log("Added Class lessons hub pill.");
  }
}

async function main() {
  const count = await prisma.homeSection.count();
  if (count > 0) {
    await ensureMissingHomeItems();
    console.log("Home sections already seeded — ensured defaults.");
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
