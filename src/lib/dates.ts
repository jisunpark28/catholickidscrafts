const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateParam(input: string): Date | null {
  const compact = input.replace(/-/g, "");
  if (/^\d{8}$/.test(compact)) {
    const y = Number(compact.slice(0, 4));
    const m = Number(compact.slice(4, 6));
    const d = Number(compact.slice(6, 8));
    return buildUtcDate(y, m, d);
  }
  const match = DATE_RE.exec(input);
  if (!match) return null;
  return buildUtcDate(Number(match[1]), Number(match[2]), Number(match[3]));
}

function buildUtcDate(year: number, month: number, day: number): Date | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function toDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toEvangelizoDate(date: Date): string {
  return toDateKey(date).replace(/-/g, "");
}

export function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function daysInMonth(year: number, month: number): Date[] {
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days: Date[] = [];
  for (let d = 1; d <= count; d++) {
    days.push(new Date(Date.UTC(year, month - 1, d)));
  }
  return days;
}

export function isWithinEvangelizoWindow(date: Date): boolean {
  const today = todayUtc();
  const diff = Math.abs(date.getTime() - today.getTime());
  const days = diff / (1000 * 60 * 60 * 24);
  return days <= 30;
}

export function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
