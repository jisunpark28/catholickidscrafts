import { prisma } from "@/lib/prisma";

export type HomeSectionWithItems = {
  id: string;
  title: string;
  sortOrder: number;
  items: {
    id: string;
    title: string;
    href: string;
    sortOrder: number;
  }[];
};

export async function getPublishedHomeSections(): Promise<HomeSectionWithItems[]> {
  try {
    const rows = await prisma.homeSection.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          where: { published: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, title: true, href: true, sortOrder: true },
        },
      },
    });
    return rows;
  } catch {
    return [];
  }
}

export async function getAllHomeSectionsForAdmin() {
  return prisma.homeSection.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
    },
  });
}
