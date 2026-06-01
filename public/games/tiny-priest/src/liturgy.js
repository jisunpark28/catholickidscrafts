function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function calculateEasterSunday(year) {
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
    return new Date(year, month - 1, day);
}

export function getAdventStart(year) {
    const dec3 = new Date(year, 11, 3);
    const sundayOffset = dec3.getDay();
    const adventStart = new Date(dec3);
    adventStart.setDate(dec3.getDate() - sundayOffset);
    return adventStart;
}

export function getLiturgicalSeason(inputDate = new Date()) {
    const date = startOfDay(inputDate);
    const year = date.getFullYear();

    const easterSunday = calculateEasterSunday(year);
    const ashWednesday = addDays(easterSunday, -46);
    const holySaturday = addDays(easterSunday, -1);
    const pentecost = addDays(easterSunday, 49);

    const adventStart = getAdventStart(year);
    const christmasDay = new Date(year, 11, 25);
    const christmasEnd = new Date(year + 1, 0, 12);
    const christmasStartPreviousYear = new Date(year - 1, 11, 25);
    const christmasEndCurrentYear = new Date(year, 0, 12);

    if (
        (date >= christmasDay && date <= christmasEnd) ||
        (date >= christmasStartPreviousYear && date <= christmasEndCurrentYear)
    ) {
        return { season: "Christmas", colorName: "White", colorHex: 0xf7f4e8 };
    }
    if (date >= adventStart && date < christmasDay) {
        return { season: "Advent", colorName: "Purple", colorHex: 0x7d5db0 };
    }
    if (date >= ashWednesday && date <= holySaturday) {
        return { season: "Lent", colorName: "Purple", colorHex: 0x6f4fa8 };
    }
    if (date >= easterSunday && date <= pentecost) {
        return { season: "Easter", colorName: "White", colorHex: 0xffffff };
    }

    return { season: "Ordinary Time", colorName: "Green", colorHex: 0x4d9c5a };
}
