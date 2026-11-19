// Week boundary shared by the Sunday sheet rule ("This Sunday") and the weekly free activities.
// Pure and client-safe (no romcal).

/**
 * The Sunday (YYYY-MM-DD) that ends the week of a calendar date: the coming Sunday, or the date
 * itself when it is a Sunday. Weeks run Monday to Sunday.
 */
export function weekSundayOf(ymd: string): string {
  const t = Date.parse(`${ymd}T00:00:00Z`);
  const dow = new Date(t).getUTCDay();
  return new Date(t + ((7 - dow) % 7) * 86_400_000).toISOString().slice(0, 10);
}
