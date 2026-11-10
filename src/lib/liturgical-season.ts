import type { LiturgicalSeasonInfo } from "@/types/mass";

/** Gregorian Easter Sunday (Meeus/Jones/Butcher) */
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function between(date: Date, start: Date, end: Date): boolean {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function adventStart(year: number): Date {
  const christmas = new Date(Date.UTC(year, 11, 25));
  const dow = christmas.getUTCDay();
  const daysBefore = (dow + 21) % 7;
  return addDays(christmas, -daysBefore - 21);
}

/**
 * Feast of the Baptism of the Lord on the General Roman Calendar:
 * the Sunday after 6 January. If 6 January is a Sunday (Epiphany),
 * the feast falls on the following Sunday.
 *
 * This helper has no country argument, so it does not apply the
 * US/Canada transfer (Baptism moves to Monday when Epiphany is
 * celebrated on Sunday 7 or 8 January).
 */
function baptismOfTheLord(year: number): Date {
  const epiphany = new Date(Date.UTC(year, 0, 6));
  const dow = epiphany.getUTCDay();
  const daysAfter = dow === 0 ? 7 : 7 - dow;
  return addDays(epiphany, daysAfter);
}

export function getLiturgicalSeason(date: Date): LiturgicalSeasonInfo {
  const year = date.getUTCFullYear();
  const easter = easterSunday(year);
  const ashWednesday = addDays(easter, -46);
  const holyThursday = addDays(easter, -3);
  const pentecost = addDays(easter, 49);
  const advent = adventStart(year);
  const christmas = new Date(Date.UTC(year, 11, 25));
  const baptism = baptismOfTheLord(year);
  const christmasPrev = new Date(Date.UTC(year - 1, 11, 25));
  const pentecostPrev = addDays(easterSunday(year - 1), 49);

  if (between(date, holyThursday, addDays(easter, -1))) {
    return {
      name: "Holy Week",
      color: "purple",
      description: "The Church walks with Christ toward the Paschal Triduum.",
      periodLabel: "Triduum preparation",
    };
  }

  if (date.getTime() === easter.getTime()) {
    return {
      name: "Easter",
      color: "white",
      description: "Christ is risen! The Church celebrates the Resurrection.",
      periodLabel: "Easter Sunday",
    };
  }

  if (between(date, addDays(easter, 1), pentecost)) {
    return {
      name: "Easter Season",
      color: "white",
      description: "The fifty days from the Resurrection to Pentecost.",
      periodLabel: "Eastertide",
    };
  }

  // Lent includes Palm Sunday through Holy Wednesday. Triduum days
  // (Holy Thursday through Holy Saturday) stay on the Holy Week branch
  // above, which links to /liturgy/paschal-triduum. There is no separate
  // holy-week liturgy page, so these four days use Lent (purple, /liturgy/lent).
  if (between(date, ashWednesday, addDays(holyThursday, -1))) {
    return {
      name: "Lent",
      color: "purple",
      description: "A season of prayer, fasting, and almsgiving.",
      periodLabel: "Lenten season",
    };
  }

  if (between(date, advent, addDays(christmas, -1))) {
    return {
      name: "Advent",
      color: "purple",
      description: "The Church prepares in joyful hope for the Lord’s coming.",
      periodLabel: "Advent season",
    };
  }

  // Christmas Time runs from 25 December through the Baptism of the Lord.
  // The previous check used 25 December and 6 January of the same civil
  // year, so the range was empty and these days fell through to Ordinary Time.
  if (
    between(date, christmasPrev, baptism) ||
    between(date, christmas, baptismOfTheLord(year + 1))
  ) {
    return {
      name: "Christmas Season",
      color: "white",
      description: "The Nativity of the Lord and the days following.",
      periodLabel: "Christmastide",
    };
  }

  if (date.getTime() < ashWednesday.getTime()) {
    if (date.getTime() > pentecostPrev.getTime()) {
      return {
        name: "Ordinary Time",
        color: "green",
        description: "",
        periodLabel: "Ordinary Time",
      };
    }
  }

  if (date.getTime() > pentecost.getTime() && date.getTime() < advent.getTime()) {
    return {
      name: "Ordinary Time",
      color: "green",
      description: "",
      periodLabel: "Ordinary Time",
    };
  }

  return {
    name: "Ordinary Time",
    color: "green",
    description: "",
    periodLabel: "Ordinary Time",
  };
}
