function normalizeLiturgicalName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bst\./g, "saint")
    .replace(/\s+/g, " ")
    .trim();
}

const ORDINAL_ONES: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
  eleventh: 11,
  twelfth: 12,
  thirteenth: 13,
  fourteenth: 14,
  fifteenth: 15,
  sixteenth: 16,
  seventeenth: 17,
  eighteenth: 18,
  nineteenth: 19,
};

const ORDINAL_TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
};

/** Parse Evangelizo-style English ordinals (e.g. "Eighteenth", "Twenty-second"). */
export function parseEnglishOrdinalWord(phrase: string): number | undefined {
  const normalized = phrase.toLowerCase().trim().replace(/\s+/g, " ");
  if (ORDINAL_ONES[normalized] !== undefined) return ORDINAL_ONES[normalized];
  if (ORDINAL_TENS[normalized] !== undefined) return ORDINAL_TENS[normalized];

  const hyphenated = normalized.match(/^(twenty|thirty|forty)-(\w+)$/);
  if (hyphenated) {
    const tens = ORDINAL_TENS[hyphenated[1]];
    const ones = ORDINAL_ONES[hyphenated[2]];
    if (tens !== undefined && ones !== undefined) return tens + ones;
  }

  return undefined;
}

function ordinalSuffix(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatOrdinalNumber(n: number): string {
  return `${n}${ordinalSuffix(n)}`;
}

function parseOrdinalFromToken(token: string): number | undefined {
  const numeric = token.match(/^(\d{1,2})(?:st|nd|rd|th)?$/i);
  if (numeric) return Number(numeric[1]);
  return parseEnglishOrdinalWord(token);
}

const UNAVAILABLE_TITLE_RE = /readings unavailable|outside feed window/i;

export function isLiturgicalTitleUnavailable(title: string): boolean {
  const trimmed = title.trim();
  return trimmed.length === 0 || UNAVAILABLE_TITLE_RE.test(trimmed);
}

/** Replace word ordinals with numeric forms (e.g. Twenty-third → 23rd). */
export function formatLiturgicalTitleDisplay(title: string): string {
  if (isLiturgicalTitleUnavailable(title)) return "";

  let formatted = title.replace(
    /^([\w-]+)\s+(Sunday\b.*)$/i,
    (_, ordinalToken: string, rest: string) => {
      const week = parseOrdinalFromToken(ordinalToken);
      return week !== undefined ? `${formatOrdinalNumber(week)} ${rest}` : `${ordinalToken} ${rest}`;
    },
  );

  formatted = formatted.replace(
    /\bof the ([\w-]+) week\b/gi,
    (_, ordinalToken: string) => {
      const week = parseOrdinalFromToken(ordinalToken);
      return week !== undefined
        ? `of the ${formatOrdinalNumber(week)} Week`
        : `of the ${ordinalToken} week`;
    },
  );

  return formatted;
}

/**
 * Compact Ordinary Time Sunday label for calendar cells, e.g. "18th Sunday".
 * Weekday "Week N" labels are omitted. Returns undefined for non-OT Sundays.
 */
export function ordinaryTimeSundayLabel(liturgicalTitle: string): string | undefined {
  const sundayMatch = liturgicalTitle.match(/^(.+?)\s+Sunday\s+in\s+Ordinary\s+Time$/i);
  if (!sundayMatch) return undefined;

  const week = parseOrdinalFromToken(sundayMatch[1]);
  if (week === undefined) return undefined;
  return `${formatOrdinalNumber(week)} Sunday`;
}

const ORDINARY_TIME_WEEKDAY_TITLE_RE =
  /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s+of\s+the\s+.+?\s+week\s+in\s+Ordinary\s+Time$/i;

/** True for generic OT weekday titles (e.g. Monday of the 23rd Week in Ordinary Time). */
export function isOrdinaryTimeWeekdayTitle(liturgicalTitle: string): boolean {
  if (isLiturgicalTitleUnavailable(liturgicalTitle)) return false;
  return ORDINARY_TIME_WEEKDAY_TITLE_RE.test(liturgicalTitle.trim());
}

/** @deprecated Use {@link ordinaryTimeSundayLabel}. */
export function ordinaryTimeWeekLabel(liturgicalTitle: string): string | undefined {
  return ordinaryTimeSundayLabel(liturgicalTitle);
}

/** Format Evangelizo saint/feast lines for the General Roman Calendar (when not already in the weekday title). */
export function formatRomanCalendarCelebration(
  liturgicalTitle: string,
  saint?: string,
  feast?: string,
): string | undefined {
  const normalizedTitle = normalizeLiturgicalName(liturgicalTitle);
  const entries: string[] = [];

  const saintLines = (saint ?? "")
    .split(/\n+/)
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter(Boolean);

  for (const line of saintLines) {
    const coreName = normalizeLiturgicalName(
      line.replace(/\s*-\s*(Feast|Memorial|Optional Memorial).*$/i, ""),
    );
    if (coreName.length > 4 && normalizedTitle.includes(coreName)) {
      continue;
    }
    entries.push(line);
  }

  const feastText = feast?.trim();
  if (feastText) {
    const feastCore = normalizeLiturgicalName(
      feastText.replace(/\s*-\s*(Feast|Memorial|Optional Memorial).*$/i, ""),
    );
    if (
      feastCore.length > 4 &&
      !normalizedTitle.includes(feastCore) &&
      !entries.includes(feastText)
    ) {
      entries.push(feastText);
    }
  }

  if (entries.length === 0) return undefined;
  return entries.join(" · ");
}
