/**
 * Free vs Plus access for Sunday Resource sheets.
 * - Free / signed-out: browse & search OK; open/print only this Sunday's sheet.
 * - Plus: open/print any sheet + Fabric edit.
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
