import { defaultHomeSectionsForSeed } from "@/lib/home-sections-defaults";
import type { PrismaClient } from "@prisma/client";

/** Ensures new default hub pills exist on already-seeded databases. */
export async function ensureMissingHomeItems(client: PrismaClient) {
  const playLearn = await client.homeSection.findFirst({
    where: { title: "Play & Learn" },
    include: { items: true },
  });
  if (!playLearn) return;

  const classLessons = playLearn.items.find((i) => i.href === "/program");
  if (!classLessons) {
    await client.homeSectionItem.create({
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

export async function seedHomeSections(client: PrismaClient) {
  const count = await client.homeSection.count();
  if (count > 0) {
    await ensureMissingHomeItems(client);
    console.log("Home sections already seeded — ensured defaults.");
    return;
  }

  for (const section of defaultHomeSectionsForSeed()) {
    await client.homeSection.create({
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
