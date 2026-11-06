import { getEvergreenPage } from "@/lib/evergreen-catalog";
/**
 * Free vs Plus access for Resource sheets (Print / Edit / print route).
 * - Free / signed-out: read full landing text on any sheet; print this Sunday and all evergreen sheets.
 * - Plus: print any sheet + Fabric edit.
 */
export function canOpenResourceSheet(opts: {
  isPlus: boolean;
  sheetKey: string;
  thisSundayKey: string | null;
}): boolean {
  if (getEvergreenPage(opts.sheetKey)) return true;
  if (opts.isPlus) return true;
  if (!opts.thisSundayKey) return false;
  return opts.sheetKey === opts.thisSundayKey;
}
