/** Resolve site asset paths for img/src (markdown, previews). */
export function resolveAssetUrl(src: string | undefined | null): string {
  if (!src) return "";
  const trimmed = src.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `/${trimmed}`;
}
