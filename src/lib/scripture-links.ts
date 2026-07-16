import { toDateKey } from "@/lib/dates";

const LWC_READINGS_BASE = "https://readings.livingwithchrist.ca";

/** Daily Mass readings (Living with Christ / Bayard). */
export function livingWithChristReadingUrl(date: Date | string): string {
  const key = typeof date === "string" ? date : toDateKey(date);
  return `${LWC_READINGS_BASE}/daily-texts/reading/${key}`;
}

export function livingWithChristHomeUrl(): string {
  return `${LWC_READINGS_BASE}/`;
}

const GOODNEWS_MISSA_BASE =
  "https://maria.catholic.or.kr/mi_pr/missa/missa.asp";

/** Daily Mass text (서울대교구 GoodNews 매일미사). */
export function goodNewsDailyMissaUrl(date: Date | string): string {
  const key = typeof date === "string" ? date : toDateKey(date);
  const params = new URLSearchParams({
    schcode: "",
    mode: "day",
    goDay: key,
    missatype: "DA",
  });
  return `${GOODNEWS_MISSA_BASE}?${params.toString()}`;
}
