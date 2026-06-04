import { prisma } from "@/lib/prisma";
import type { PhotoBoothLayout } from "@prisma/client";

export type PhotoBoothFrameItem = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  layout: PhotoBoothLayout;
  sortOrder: number;
};

export function frameAppliesToMode(
  layout: PhotoBoothLayout,
  mode: "single" | "strip",
): boolean {
  if (layout === "BOTH") return true;
  if (mode === "single") return layout === "SINGLE";
  return layout === "STRIP";
}

function toItem(row: {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  layout: PhotoBoothLayout;
  sortOrder: number;
}): PhotoBoothFrameItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    imageUrl: row.imageUrl,
    layout: row.layout,
    sortOrder: row.sortOrder,
  };
}

export async function getPublishedPhotoBoothFrames(): Promise<PhotoBoothFrameItem[]> {
  const rows = await prisma.photoBoothFrame.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      imageUrl: true,
      layout: true,
      sortOrder: true,
    },
  });
  return rows.map(toItem);
}
