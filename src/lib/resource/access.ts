/**
 * Free vs Plus access for Resource sheets (Print / Edit / print route).
 * - Free / signed-out: descriptive landing text only; preview/print this Sunday.
 * - Plus: preview/print any sheet + Fabric edit.
 */
export function canOpenResourceSheet(opts: {
  isPlus: boolean;
  sheetKey: string;
  thisSundayKey: string | null;
}): boolean {
  if (opts.isPlus) return true;
  if (!opts.thisSundayKey) return false;
  return opts.sheetKey === opts.thisSundayKey;
}
