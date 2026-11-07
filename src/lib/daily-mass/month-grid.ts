/** Sunday-first civil month grid. All math is UTC so the host timezone cannot shift a date. */

export const MASS_CALENDAR_MIN_YEAR = 1970;
export const MASS_CALENDAR_MAX_YEAR = 2100;

export type MonthPoint = { year: number; month: number };

export type MonthGridCell = {
  date: string;
  day: number;
  /** 0 = Sunday … 6 = Saturday, matching the Daily Mass weekday headers. */
  weekday: number;
};

export function isCalendarMonthInRange(year: number, month: number): boolean {
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    year >= MASS_CALENDAR_MIN_YEAR &&
    year <= MASS_CALENDAR_MAX_YEAR &&
    month >= 1 &&
    month <= 12
  );
}

export function daysInUtcMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function utcWeekday(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** Leading and trailing blanks keep every row Sunday–Saturday, including short months. */
export function monthGrid(year: number, month: number): Array<MonthGridCell | null> {
  const count = daysInUtcMonth(year, month);
  const cells: Array<MonthGridCell | null> = Array.from({ length: utcWeekday(year, month, 1) }, () => null);
  for (let day = 1; day <= count; day += 1) {
    cells.push({
      date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      day,
      weekday: utcWeekday(year, month, day),
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Returns null at the 1970–2100 edges used by `/api/mass/calendar`. */
export function shiftCalendarMonth(year: number, month: number, delta: number): MonthPoint | null {
  let y = year;
  let m = month + delta;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  if (!isCalendarMonthInRange(y, m)) return null;
  return { year: y, month: m };
}
