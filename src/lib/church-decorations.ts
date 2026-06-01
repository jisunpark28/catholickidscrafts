import { prisma } from "@/lib/prisma";

export type ChurchDecorationItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  posX: number;
  posY: number;
  posZ: number;
  width: number;
  height: number;
  rotationY: number;
  sortOrder: number;
};

function mapRow(r: {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  posX: number;
  posY: number;
  posZ: number;
  width: number;
  height: number;
  rotationY: number;
  sortOrder: number;
}): ChurchDecorationItem {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    imageUrl: r.imageUrl,
    posX: r.posX,
    posY: r.posY,
    posZ: r.posZ,
    width: r.width,
    height: r.height,
    rotationY: r.rotationY,
    sortOrder: r.sortOrder,
  };
}

export async function getPublishedChurchDecorations(): Promise<ChurchDecorationItem[]> {
  const rows = await prisma.churchDecoration.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map(mapRow);
}
