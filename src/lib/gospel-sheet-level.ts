export type SheetLevelNumber = 1 | 2;

/** DB-free so routes that do not load from Prisma can use it. */
export function parseLevelParam(value: string | string[] | undefined): SheetLevelNumber {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "2" ? 2 : 1;
}
