import type { Prisma } from "@prisma/client";

export type ResourceSortId = "registered" | "popular" | "recent";

export const RESOURCE_SORT_OPTIONS: { id: ResourceSortId; label: string }[] = [
  { id: "registered", label: "Oldest" },
  { id: "popular", label: "Popular" },
  { id: "recent", label: "Newest" },
];

export function parseResourceSortParam(value: string | undefined): ResourceSortId {
  if (value === "registered" || value === "popular" || value === "recent") {
    return value;
  }
  return "recent";
}

export function resourceOrderBy(sort: ResourceSortId): Prisma.ResourceOrderByWithRelationInput[] {
  switch (sort) {
    case "registered":
      return [{ createdAt: "asc" }];
    case "popular":
      return [{ viewCount: "desc" }, { createdAt: "desc" }];
    case "recent":
    default:
      return [{ createdAt: "desc" }];
  }
}
