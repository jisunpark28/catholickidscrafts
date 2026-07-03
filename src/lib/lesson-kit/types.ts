import type { LessonBlockType, LessonKitScope } from "@prisma/client";

export type LessonBlockConfig = {
  gameSlug?: string;
  wordIds?: string[];
  wordPreset?: string;
  readingKind?: string;
  maxChars?: number;
  bookSlug?: string;
  chapter?: number;
  resourceSlug?: string;
  html?: string;
  familyInclude?: boolean;
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
