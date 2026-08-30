/**
 * Catholic book names for UI copy (not scripture text).
 * Korean: 가톨릭 정식 명칭 (예: 마르코 — 개신교식 "마가" 사용 금지).
 */

export type BibleBookNameLocale = "en" | "ko";

/** Korean Catholic book titles keyed by latinprayer slug. */
export const CATHOLIC_BOOK_NAME_KO: Readonly<Record<string, string>> = {
  genesis: "창세기",
  exodus: "탈출기",
  leviticus: "레위기",
  numbers: "민수기",
  deuteronomy: "신명기",
  josue: "여호수아",
  judges: "판관기",
  ruth: "룻기",
  "1-kings-samuel": "사무엘 상권",
  "2-kings-samuel": "사무엘 하권",
  "3-kings": "열왕기 상권",
  "4-kings": "열왕기 하권",
  "1-paralipomenon": "역대기 상권",
  "2-paralipomenon": "역대기 하권",
  "1-esdras": "에즈라",
  "2-esdras-nehemias": "느헤미야",
  tobias: "토빗",
  judith: "유딧",
  esther: "에스테르",
  job: "욥기",
  psalms: "시편",
  proverbs: "잠언",
  ecclesiastes: "코헬렛",
  "canticle-of-canticles": "아가",
  wisdom: "지혜서",
  ecclesiasticus: "집회서",
  isaias: "이사야",
  jeremias: "예레미야",
  lamentations: "애가",
  baruch: "바룩",
  ezechiel: "에제키엘",
  daniel: "다니엘",
  osee: "호세아",
  joel: "요엘",
  amos: "아모스",
  abdias: "오바디야",
  jonas: "요나",
  micheas: "미카",
  nahum: "나훔",
  habacuc: "하바쿡",
  sophonias: "스바니야",
  aggeus: "하까이",
  zacharias: "즈카리야",
  malachias: "말라키",
  "1-machabees": "마카베오 상권",
  "2-machabees": "마카베오 하권",
  matthew: "마태오",
  mark: "마르코",
  luke: "루카",
  john: "요한",
  acts: "사도행전",
  romans: "로마서",
  "1-corinthians": "코린토 1서",
  "2-corinthians": "코린토 2서",
  galatians: "갈라티아서",
  ephesians: "에페소서",
  philippians: "필리피서",
  colossians: "콜로새서",
  "1-thessalonians": "테살로니카 1서",
  "2-thessalonians": "테살로니카 2서",
  "1-timothy": "티모테오 1서",
  "2-timothy": "티모테오 2서",
  titus: "티토서",
  philemon: "필레몬서",
  hebrews: "히브리서",
  james: "야고보서",
  "1-peter": "베드로 1서",
  "2-peter": "베드로 2서",
  "1-john": "요한 1서",
  "2-john": "요한 2서",
  "3-john": "요한 3서",
  jude: "유다서",
  apocalypse: "요한 묵시록",
};

/** Short Korean label for the four Gospels (evangelist name). */
export const CATHOLIC_GOSPEL_EVANGELIST_KO: Readonly<Record<string, string>> = {
  matthew: "마태오",
  mark: "마르코",
  luke: "루카",
  john: "요한",
};

export function getCatholicBookName(
  bookSlug: string,
  locale: BibleBookNameLocale,
  fallback = "",
): string {
  if (locale === "ko") {
    return CATHOLIC_BOOK_NAME_KO[bookSlug] ?? fallback;
  }
  return fallback;
}

/** e.g. "마르코가 전한 복음" */
export function catholicGospelLabelKo(bookSlug: string): string | null {
  const evangelist = CATHOLIC_GOSPEL_EVANGELIST_KO[bookSlug];
  if (!evangelist) return null;
  return `${evangelist}가 전한 복음`;
}

export function catholicChapterNotesTitle(
  bookSlug: string,
  chapter: number,
  locale: BibleBookNameLocale,
  englishFallback: string,
): string {
  if (locale === "ko") {
    const book = getCatholicBookName(bookSlug, "ko");
    if (book) return `${book} ${chapter}장 노트`;
  }
  return englishFallback;
}
