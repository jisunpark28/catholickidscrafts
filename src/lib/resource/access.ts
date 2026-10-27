/**
 * Free vs Plus access for Sunday Resource sheets (Print / Edit / print route).
 * - Free / signed-out: read full landing text on any sheet; print only this Sunday.
 * - Plus: print any sheet + Fabric edit.
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
