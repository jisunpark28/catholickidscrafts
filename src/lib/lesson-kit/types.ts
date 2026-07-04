import type { LessonBlockType, LessonKitScope } from "@prisma/client";

/** Per-block JSON config. Extra keys are allowed for forward-compatible PRs (link, slides, …). */
export type LessonBlockConfig = {
  gameSlug?: string;
  wordIds?: string[];
  wordPreset?: string;
  readingKind?: string;
  maxChars?: number;
  minChars?: number;
  bookSlug?: string;
  chapter?: number;
  resourceSlug?: string;
  html?: string;
  familyInclude?: boolean;
  /** PR-2+ external link blocks */
  url?: string;
  buttonLabel?: string;
  openInNewTab?: boolean;
  /** PR-3+ writing blocks */
  prompt?: string;
  placeholder?: string;
  writingMode?: "display" | "student";
  /** PR-5+ image blocks */
  imageUrl?: string;
  alt?: string;
  caption?: string;
  imageSource?: "upload" | "url";
  /** PR-6+ slides blocks */
  embedUrl?: string;
  assetUrl?: string;
  slidesSource?: "embed" | "upload";
  /** PR-7+ unified game data */
  gameFormat?: string;
  words?: string[];
  [key: string]: unknown;
};

export type FamilyModeConfig = {
  gospelMaxChars?: number;
  includedBlockIds?: string[];
};

export type LessonBlockDto = {
  id: string;
  sortOrder: number;
  type: LessonBlockType;
  label: string | null;
  config: LessonBlockConfig;
};

export type LessonKitDto = {
  id: string;
  shareSlug: string;
  title: string;
  description: string;
  scope: LessonKitScope;
  sourceKitId: string | null;
  familyAccountId: string | null;
  liturgicalPeriod: string | null;
  gradeBand: string | null;
  tptUrl: string | null;
  isFreeSample: boolean;
  familyMode: FamilyModeConfig | null;
  published: boolean;
  sortOrder: number;
  blocks: LessonBlockDto[];
  stepCount: number;
  estMinutes: number;
};

export function parseBlockConfig(raw: unknown): LessonBlockConfig {
  if (!raw || typeof raw !== "object") return {};
  return raw as LessonBlockConfig;
}

export function parseFamilyMode(raw: unknown): FamilyModeConfig | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as FamilyModeConfig;
}
