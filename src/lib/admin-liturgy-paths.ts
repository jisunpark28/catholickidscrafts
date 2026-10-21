/** Admin URL for the Q&A cards & Prayers tab inside /admin/liturgy-cards. */
export function qaListHref(topic?: string, status?: string): string {
  const params = new URLSearchParams({ tab: "qa" });
  if (topic) params.set("topic", topic);
  if (status) params.set("status", status);
  return `/admin/liturgy-cards?${params.toString()}`;
}
