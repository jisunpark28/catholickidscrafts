import { defaultHomeSectionsForSeed } from "@/lib/home-sections-defaults";
import type { PrismaClient } from "@prisma/client";

/** Ensures new default hub pills exist on already-seeded databases. */
export async function ensureMissingHomeItems(client: PrismaClient) {
  const playLearn = await client.homeSection.findFirst({
    where: { title: "Play & Learn" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!playLearn) return;

  const prayers = playLearn.items.find((i) => i.href === "/prayers");
  if (!prayers) {
    await client.homeSectionItem.create({
      data: {
        sectionId: playLearn.id,
        title: "Prayers",
        href: "/prayers",
        sortOrder: 0,
        published: true,
      },
    });
    console.log("Added Prayers hub pill.");
  }

  const games = playLearn.items.find((i) => i.href === "/play");
  if (games && games.sortOrder < 1) {
    await client.homeSectionItem.update({
      where: { id: games.id },
      data: { sortOrder: 1 },
    });
  }

  const classLessons = playLearn.items.find((i) => i.href === "/program");
  if (!classLessons) {
    await client.homeSectionItem.create({
      data: {
        sectionId: playLearn.id,
        title: "Lesson Kits",
        href: "/program",
        sortOrder: 2,
        published: true,
      },
    });
    console.log("Added Class lessons hub pill.");
  } else if (classLessons.sortOrder < 2) {
    await client.homeSectionItem.update({
      where: { id: classLessons.id },
      data: { sortOrder: 2 },
    });
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
