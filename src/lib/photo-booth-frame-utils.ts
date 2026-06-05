/** Client-safe types/helpers (no Prisma / Node imports). */

export type PhotoBoothFrameLayout = "SINGLE" | "STRIP" | "BOTH";

export type PhotoBoothFrameItem = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  layout: PhotoBoothFrameLayout;
  sortOrder: number;
};

export function frameAppliesToMode(
  layout: PhotoBoothFrameLayout,
  mode: "single" | "strip",
): boolean {
  if (layout === "BOTH") return true;
  if (mode === "single") return layout === "SINGLE";
  return layout === "STRIP";
}
