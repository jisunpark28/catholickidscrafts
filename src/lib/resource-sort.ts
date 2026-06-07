import type { Prisma } from "@prisma/client";

export type ResourceSortId = "registered" | "popular" | "recent";

export const RESOURCE_SORT_OPTIONS: { id: ResourceSortId; label: string }[] = [
  { id: "registered", label: "등록일순" },
  { id: "popular", label: "인기순" },
  { id: "recent", label: "최근순" },
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
