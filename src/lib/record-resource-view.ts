/** Fire-and-forget view count for popularity sort (detail page or download). */
export function recordResourceView(slug: string): void {
  void fetch(`/api/resources/${encodeURIComponent(slug)}/view`, {
    method: "POST",
    keepalive: true,
  });
}
