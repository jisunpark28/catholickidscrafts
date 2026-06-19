/** Ensure admin-entered paths always navigate within the site. */
export function normalizeHubHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed || trimmed === "#") return "/";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
