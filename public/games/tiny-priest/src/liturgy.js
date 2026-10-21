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

function torontoDateParts(inputDate) {
    try {
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Toronto",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).formatToParts(inputDate);
        const get = (type) => Number(parts.find((p) => p.type === type).value);
        return new Date(get("year"), get("month") - 1, get("day"));
    } catch {
        return startOfDay(inputDate);
    }
}

/** Baptism of the Lord: Sunday after Epiphany (Epiphany = Sunday Jan 2–8); Monday if Epiphany is Jan 7 or 8. */
function getBaptismOfTheLord(year) {
    const jan2 = new Date(year, 0, 2);
    const epiphany = addDays(jan2, (7 - jan2.getDay()) % 7);
    return epiphany.getDate() >= 7 ? addDays(epiphany, 1) : addDays(epiphany, 7);
}

export function getLiturgicalSeason(inputDate = new Date()) {
    const date = torontoDateParts(inputDate);
    const year = date.getFullYear();

    const easterSunday = calculateEasterSunday(year);
    const ashWednesday = addDays(easterSunday, -46);
    const holyThursday = addDays(easterSunday, -3);
    const goodFriday = addDays(easterSunday, -2);
    const holySaturday = addDays(easterSunday, -1);
    const pentecost = addDays(easterSunday, 49);

    const adventStart = getAdventStart(year);
    const christmasDay = new Date(year, 11, 25);
    const baptismOfTheLord = getBaptismOfTheLord(year);

    if (date >= christmasDay || date <= baptismOfTheLord) {
        return { season: "Christmas", colorName: "White", colorHex: 0xf7f4e8, vestmentKey: "white" };
    }
    if (date >= adventStart) {
        return { season: "Advent", colorName: "Purple", colorHex: 0x7d5db0, vestmentKey: "purple" };
    }
    if (date >= ashWednesday && date < holyThursday) {
        return { season: "Lent", colorName: "Purple", colorHex: 0x6f4fa8, vestmentKey: "purple" };
    }
    if (date.getTime() === holyThursday.getTime()) {
        return { season: "Paschal Triduum", day: "Holy Thursday", colorName: "White", colorHex: 0xf7f4e8, vestmentKey: "white" };
    }
    if (date.getTime() === goodFriday.getTime()) {
        return { season: "Paschal Triduum", day: "Good Friday", colorName: "Red", colorHex: 0xb22830, vestmentKey: "red" };
    }
    if (date.getTime() === holySaturday.getTime()) {
        // Holy Saturday: the altar is bare; the Easter Vigil at night is white.
        return { season: "Paschal Triduum", day: "Holy Saturday", colorName: "Purple", colorHex: 0x6f4fa8, vestmentKey: "purple" };
    }
    if (date >= easterSunday && date <= pentecost) {
        return { season: "Easter", colorName: "White", colorHex: 0xffffff, vestmentKey: "white" };
    }

    return { season: "Ordinary Time", colorName: "Green", colorHex: 0x4d9c5a, vestmentKey: "green" };
}
