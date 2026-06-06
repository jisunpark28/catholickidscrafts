const DEFAULT_TPT_STORE_URL =
  "https://www.teacherspayteachers.com/store/catholic-kids-crafts";

/** Catholic Kids Crafts TPT store; override with NEXT_PUBLIC_TPT_STORE_URL. */
export function getTptStoreUrl(): string {
  const url = process.env.NEXT_PUBLIC_TPT_STORE_URL?.trim();
  return url || DEFAULT_TPT_STORE_URL;
}
