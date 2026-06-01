export function getTptStoreUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_TPT_STORE_URL?.trim();
  return url || undefined;
}
