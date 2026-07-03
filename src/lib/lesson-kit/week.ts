/** Sunday (UTC) of the week containing `date`, as YYYY-MM-DD. */
export function weekStartSundayUtc(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

export function formatWeekLabel(weekStart: string): string {
  const start = new Date(`${weekStart}T12:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

/** UTC date keys (YYYY-MM-DD) from Sunday through Saturday of the week. */
export function weekDateKeysUtc(weekStart: string): string[] {
  const start = new Date(`${weekStart}T12:00:00.000Z`);
  const keys: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}
