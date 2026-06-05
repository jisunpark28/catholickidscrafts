import { SITE_COPY_DEFAULTS } from "../../prisma/data/site-copy-defaults";
import type { SiteCopySeed } from "../../prisma/data/site-copy-defaults";

export type SiteCopyAdminRow = SiteCopySeed & { id?: string; published?: boolean };

type DbRow = {
  id: string;
  key: string;
  value: string;
  group: string;
  hint: string | null;
  format: string;
  published: boolean;
};

export function mergeSiteCopyForAdmin(dbRows: DbRow[]): SiteCopyAdminRow[] {
  const byKey = new Map(dbRows.map((r) => [r.key, r]));
  return SITE_COPY_DEFAULTS.map((def) => {
    const row = byKey.get(def.key);
    if (row) {
      return {
        id: row.id,
        key: row.key,
        value: row.value,
        group: row.group,
        hint: row.hint ?? def.hint,
        format: (row.format as "plain" | "markdown") ?? def.format ?? "plain",
        published: row.published,
      };
    }
    return { ...def, published: true };
  });
}
