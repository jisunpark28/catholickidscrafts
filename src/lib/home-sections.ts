import { DEFAULT_HOME_SECTIONS, sortHomeSectionsByTitle } from "@/lib/home-sections-defaults";
import { mergeHomeSectionsWithDefaults } from "@/lib/home-sections-merge";
import { normalizeHubHref } from "@/lib/hub-href";
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
    const published = rows
      .filter((s) => s.items.length > 0)
      .map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          href: normalizeHubHref(item.href),
        })),
      }));
    if (published.length > 0) {
      return sortHomeSectionsByTitle(
        mergeHomeSectionsWithDefaults(published, DEFAULT_HOME_SECTIONS),
      );
    }
    return DEFAULT_HOME_SECTIONS;
  } catch {
    return DEFAULT_HOME_SECTIONS;
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
