import { SITE_COPY_DEFAULTS, type SiteCopySeed } from "../../prisma/data/site-copy-defaults";
import { prisma } from "@/lib/prisma";

/** Max length of a single SiteCopy value accepted from the admin editor. */
export const SITE_COPY_VALUE_MAX = 10_000;

export type AdminSiteCopyRow = {
  key: string;
  group: string;
  hint: string | null;
  format: string;
  /** Built-in default from prisma/data/site-copy-defaults.ts (null when the key only exists in the DB). */
  defaultValue: string | null;
  /** DB override value (null when no DB row exists yet). */
  dbValue: string | null;
  /** DB row published flag (null when no DB row exists). */
  published: boolean | null;
  updatedAt: string | null;
};

let defaultsByKey: Map<string, SiteCopySeed> | null = null;

export function siteCopyDefaultsByKey(): Map<string, SiteCopySeed> {
  if (!defaultsByKey) {
    defaultsByKey = new Map(SITE_COPY_DEFAULTS.map((row) => [row.key, row]));
  }
  return defaultsByKey;
}

/** All keys from defaults and the DB, merged for the admin editor (server-only). */
export async function listSiteCopyForAdmin(): Promise<AdminSiteCopyRow[]> {
  const defaults = siteCopyDefaultsByKey();
  const dbRows = await prisma.siteCopy.findMany({ orderBy: { key: "asc" } });
  const byKey = new Map<string, AdminSiteCopyRow>();

  for (const d of SITE_COPY_DEFAULTS) {
    byKey.set(d.key, {
      key: d.key,
      group: d.group,
      hint: d.hint ?? null,
      format: d.format ?? "plain",
      defaultValue: d.value,
      dbValue: null,
      published: null,
      updatedAt: null,
    });
  }

  for (const row of dbRows) {
    const d = defaults.get(row.key);
    byKey.set(row.key, {
      key: row.key,
      group: row.group || d?.group || "other",
      hint: row.hint ?? d?.hint ?? null,
      format: row.format || d?.format || "plain",
      defaultValue: d?.value ?? null,
      dbValue: row.value,
      published: row.published,
      updatedAt: row.updatedAt.toISOString(),
    });
  }

  return [...byKey.values()].sort((a, b) =>
    a.group === b.group ? a.key.localeCompare(b.key) : a.group.localeCompare(b.group),
  );
}
