import { prisma } from "@/lib/prisma";
import type { CustomSheetData } from "@/lib/resource/custom-sheet-data";

export type CustomSheetRow = {
  id: string;
  familyAccountId: string;
  name: string;
  baseKey: string;
  level: number;
  baseRev: string;
  data: CustomSheetData;
  thumbUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type DbRow = {
  id: string;
  familyAccountId: string;
  name: string;
  baseKey: string;
  level: number;
  baseRev: string;
  data: unknown;
  thumbUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapRow(r: DbRow): CustomSheetRow {
  return { ...r, data: r.data as CustomSheetData };
}

/** Table comes from migration 20261027010000_custom_sheets (no runtime DDL on request paths). */
export async function withCustomSheetDb<T>(fn: () => Promise<T>): Promise<T> {
  return fn();
}

export async function listCustomSheets(familyAccountId: string, opts?: { baseKey?: string; level?: number }) {
  return withCustomSheetDb(async () => {
    if (opts?.baseKey && opts.level) {
      const rows = await prisma.$queryRawUnsafe<DbRow[]>(
        `SELECT * FROM "CustomSheet"
         WHERE "familyAccountId" = $1 AND "baseKey" = $2 AND "level" = $3
         ORDER BY "updatedAt" DESC LIMIT 50`,
        familyAccountId,
        opts.baseKey,
        opts.level,
      );
      return rows.map(mapRow);
    }
    if (opts?.baseKey) {
      const rows = await prisma.$queryRawUnsafe<DbRow[]>(
        `SELECT * FROM "CustomSheet"
         WHERE "familyAccountId" = $1 AND "baseKey" = $2
         ORDER BY "updatedAt" DESC LIMIT 50`,
        familyAccountId,
        opts.baseKey,
      );
      return rows.map(mapRow);
    }
    const rows = await prisma.$queryRawUnsafe<DbRow[]>(
      `SELECT * FROM "CustomSheet"
       WHERE "familyAccountId" = $1
       ORDER BY "updatedAt" DESC LIMIT 50`,
      familyAccountId,
    );
    return rows.map(mapRow);
  });
}

export async function getCustomSheet(id: string, familyAccountId: string) {
  return withCustomSheetDb(async () => {
    const rows = await prisma.$queryRawUnsafe<DbRow[]>(
      `SELECT * FROM "CustomSheet" WHERE "id" = $1 AND "familyAccountId" = $2 LIMIT 1`,
      id,
      familyAccountId,
    );
    return rows[0] ? mapRow(rows[0]) : null;
  });
}

export async function createCustomSheet(input: {
  familyAccountId: string;
  name: string;
  baseKey: string;
  level: number;
  baseRev: string;
  data: CustomSheetData;
  thumbUrl: string | null;
}) {
  return withCustomSheetDb(async () => {
    const id = `cs_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const now = new Date();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "CustomSheet"
        ("id", "familyAccountId", "name", "baseKey", "level", "baseRev", "data", "thumbUrl", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10)`,
      id,
      input.familyAccountId,
      input.name,
      input.baseKey,
      input.level,
      input.baseRev,
      JSON.stringify(input.data),
      input.thumbUrl,
      now,
      now,
    );
    return (await getCustomSheet(id, input.familyAccountId))!;
  });
}

export async function updateCustomSheet(
  id: string,
  familyAccountId: string,
  patch: {
    name?: string;
    baseKey?: string;
    level?: number;
    baseRev?: string;
    data?: CustomSheetData;
    thumbUrl?: string | null;
  },
) {
  return withCustomSheetDb(async () => {
    const existing = await getCustomSheet(id, familyAccountId);
    if (!existing) return null;
    const name = patch.name ?? existing.name;
    const baseKey = patch.baseKey ?? existing.baseKey;
    const level = patch.level ?? existing.level;
    const baseRev = patch.baseRev ?? existing.baseRev;
    const data = patch.data ?? existing.data;
    const thumbUrl = patch.thumbUrl !== undefined ? patch.thumbUrl : existing.thumbUrl;
    const now = new Date();
    await prisma.$executeRawUnsafe(
      `UPDATE "CustomSheet"
       SET "name" = $1, "baseKey" = $2, "level" = $3, "baseRev" = $4,
           "data" = $5::jsonb, "thumbUrl" = $6, "updatedAt" = $7
       WHERE "id" = $8 AND "familyAccountId" = $9`,
      name,
      baseKey,
      level,
      baseRev,
      JSON.stringify(data),
      thumbUrl,
      now,
      id,
      familyAccountId,
    );
    return getCustomSheet(id, familyAccountId);
  });
}

export async function deleteCustomSheet(id: string, familyAccountId: string) {
  return withCustomSheetDb(async () => {
    const result = await prisma.$executeRawUnsafe(
      `DELETE FROM "CustomSheet" WHERE "id" = $1 AND "familyAccountId" = $2`,
      id,
      familyAccountId,
    );
    return Number(result) > 0;
  });
}
