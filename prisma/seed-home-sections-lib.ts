import { defaultHomeSectionsForSeed } from "@/lib/home-sections-defaults";
import type { PrismaClient } from "@prisma/client";

const PLAY_LEARN_HUB_ORDER: { href: string; title: string; sortOrder: number }[] = [
  { href: "/prayers", title: "Prayers", sortOrder: 0 },
  { href: "/mass/participation", title: "Mass", sortOrder: 1 },
  { href: "/play", title: "Games", sortOrder: 2 },
  { href: "/program", title: "Lesson Kits", sortOrder: 3 },
];

/** Ensures new default hub pills exist on already-seeded databases. */
export async function ensureMissingHomeItems(client: PrismaClient) {
  const playLearn = await client.homeSection.findFirst({
    where: { title: "Play & Learn" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!playLearn) return;

  for (const spec of PLAY_LEARN_HUB_ORDER) {
    const existing = playLearn.items.find((i) => i.href === spec.href);
    if (!existing) {
      await client.homeSectionItem.create({
        data: {
          sectionId: playLearn.id,
          title: spec.title,
          href: spec.href,
          sortOrder: spec.sortOrder,
          published: true,
        },
      });
      console.log(`Added ${spec.title} hub pill.`);
      continue;
    }
    if (existing.sortOrder !== spec.sortOrder) {
      await client.homeSectionItem.update({
        where: { id: existing.id },
        data: { sortOrder: spec.sortOrder },
      });
    }
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
