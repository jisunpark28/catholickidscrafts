import { prisma } from "@/lib/prisma";
import {
  SHEET_PHOTO_DAILY_LIMIT,
  SHEET_PHOTO_FAMILY_QUOTA_BYTES,
} from "@/lib/resource/sheet-photo";

export type SheetPhotoRow = {
  id: string;
  familyAccountId: string;
  url: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: Date;
};

export class SheetPhotoQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SheetPhotoQuotaError";
  }
}

/** Table comes from migration 20261027020000_sheet_photos (no runtime DDL). */
async function withDb<T>(fn: () => Promise<T>): Promise<T> {
  return fn();
}

export async function getFamilyPhotoUsage(familyAccountId: string): Promise<{
  totalBytes: number;
  todayCount: number;
}> {
  return withDb(async () => {
    const totals = await prisma.$queryRawUnsafe<{ sum: bigint | null }[]>(
      `SELECT COALESCE(SUM("sizeBytes"), 0)::bigint AS sum FROM "SheetPhoto" WHERE "familyAccountId" = $1`,
      familyAccountId,
    );
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const today = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint AS count FROM "SheetPhoto"
       WHERE "familyAccountId" = $1 AND "createdAt" >= $2`,
      familyAccountId,
      dayStart,
    );
    return {
      totalBytes: Number(totals[0]?.sum ?? 0),
      todayCount: Number(today[0]?.count ?? 0),
    };
  });
}

export async function assertPhotoQuota(familyAccountId: string, nextBytes: number) {
  const usage = await getFamilyPhotoUsage(familyAccountId);
  if (usage.todayCount >= SHEET_PHOTO_DAILY_LIMIT) {
    throw new SheetPhotoQuotaError(
      `Daily photo limit reached (${SHEET_PHOTO_DAILY_LIMIT}). Try again tomorrow.`,
    );
  }
  if (usage.totalBytes + nextBytes > SHEET_PHOTO_FAMILY_QUOTA_BYTES) {
    throw new SheetPhotoQuotaError(
      "Family photo storage is full (200 MB). Remove photos from older sheets or contact support.",
    );
  }
}

export async function createSheetPhoto(input: {
  familyAccountId: string;
  url: string;
  sizeBytes: number;
  width: number;
  height: number;
}): Promise<SheetPhotoRow> {
  return withDb(async () => {
    const id = `sp_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const now = new Date();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "SheetPhoto"
        ("id", "familyAccountId", "url", "sizeBytes", "width", "height", "createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      id,
      input.familyAccountId,
      input.url,
      input.sizeBytes,
      input.width,
      input.height,
      now,
    );
    return {
      id,
      familyAccountId: input.familyAccountId,
      url: input.url,
      sizeBytes: input.sizeBytes,
      width: input.width,
      height: input.height,
      createdAt: now,
    };
  });
}

export async function listFamilyPhotos(familyAccountId: string, limit = 60): Promise<SheetPhotoRow[]> {
  return withDb(() =>
    prisma.$queryRawUnsafe<SheetPhotoRow[]>(
      `SELECT "id", "familyAccountId", "url", "sizeBytes", "width", "height", "createdAt"
       FROM "SheetPhoto" WHERE "familyAccountId" = $1
       ORDER BY "createdAt" DESC LIMIT $2`,
      familyAccountId,
      limit,
    ),
  );
}

/** Delete a photo row only when it belongs to the family; returns the removed row. */
export async function deleteFamilyPhoto(
  familyAccountId: string,
  id: string,
): Promise<SheetPhotoRow | null> {
  return withDb(async () => {
    const rows = await prisma.$queryRawUnsafe<SheetPhotoRow[]>(
      `DELETE FROM "SheetPhoto" WHERE "id" = $1 AND "familyAccountId" = $2
       RETURNING "id", "familyAccountId", "url", "sizeBytes", "width", "height", "createdAt"`,
      id,
      familyAccountId,
    );
    return rows[0] ?? null;
  });
}
