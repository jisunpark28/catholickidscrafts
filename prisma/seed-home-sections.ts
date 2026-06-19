import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_SECTIONS = [
  {
    title: "Bible Reading",
    sortOrder: 0,
    items: [
      { title: "Today's Gospel", href: "/bible/gospel", sortOrder: 0 },
      { title: "Old Testament", href: "/bible/old-testament", sortOrder: 1 },
      { title: "New Testament", href: "/bible/new-testament", sortOrder: 2 },
    ],
  },
  {
    title: "Liturgical Catechesis",
    sortOrder: 1,
    items: [
      { title: "Easter Season", href: "/resources?period=easter", sortOrder: 0 },
      { title: "Advent", href: "/resources?period=advent", sortOrder: 1 },
      { title: "Lent", href: "/resources?period=lent", sortOrder: 2 },
      { title: "Ordinary Time", href: "/resources?period=ordinary", sortOrder: 3 },
    ],
  },
  {
    title: "Play & Learn",
    sortOrder: 2,
    items: [{ title: "Games", href: "/play", sortOrder: 0 }],
  },
] as const;

async function main() {
  const count = await prisma.homeSection.count();
  if (count > 0) {
    console.log("Home sections already seeded — skipping.");
    return;
  }

  for (const section of DEFAULT_SECTIONS) {
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
