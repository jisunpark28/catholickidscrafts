import type { RecommendationKind } from "@prisma/client";

export type RecommendationItem = {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  kind: RecommendationKind;
  externalUrl: string;
  author?: string;
  imageUrl?: string;
  tags: string;
  sortOrder: number;
};

export const RECOMMENDATION_KINDS: {
  id: RecommendationKind | "ALL";
  label: string;
}[] = [
  { id: "ALL", label: "All" },
  { id: "VIDEO", label: "Video" },
  { id: "BOOK", label: "Book" },
  { id: "TEMPLATE", label: "Template" },
  { id: "AUDIO", label: "Audio" },
  { id: "WEBSITE", label: "Website" },
  { id: "OTHER", label: "Other" },
];

export function kindLabel(kind: RecommendationKind): string {
  return RECOMMENDATION_KINDS.find((k) => k.id === kind)?.label ?? kind;
}

export function parseKindParam(value: string | undefined): RecommendationKind | undefined {
  if (!value || value === "all") return undefined;
  const upper = value.toUpperCase();
  const valid = ["VIDEO", "BOOK", "TEMPLATE", "AUDIO", "WEBSITE", "OTHER"];
  return valid.includes(upper) ? (upper as RecommendationKind) : undefined;
}
