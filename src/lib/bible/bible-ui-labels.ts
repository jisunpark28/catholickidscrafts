import type { PrayerLanguageCode } from "@/lib/prayers/prayer-languages";

export type BibleUiLabels = {
  language: string;
  chapterNotes: string;
  chapterNotesTitle: (book: string, chapter: number) => string;
  chapter: string;
  stickerSaved: (chapter: number, book: string) => string;
  backTo: (book: string) => string;
};

const LABELS: Record<PrayerLanguageCode, BibleUiLabels> = {
  en: {
    language: "Language",
    chapterNotes: "Chapter notes",
    chapterNotesTitle: (book, chapter) => `${book} — Chapter ${chapter} notes`,
    chapter: "Chapter",
    stickerSaved: (chapter, book) =>
      `Your praise sticker for chapter ${chapter} is saved. Back to ${book} to see your collection.`,
    backTo: (book) => `Back to ${book}`,
  },
  es: {
    language: "Idioma",
    chapterNotes: "Notas del capítulo",
    chapterNotesTitle: (book, chapter) => `Notas — ${book}, capítulo ${chapter}`,
    chapter: "Capítulo",
    stickerSaved: (chapter, book) =>
      `Tu pegatina de alabanza del capítulo ${chapter} está guardada. Vuelve a ${book} para ver tu colección.`,
    backTo: (book) => `Volver a ${book}`,
  },
  fr: {
    language: "Langue",
    chapterNotes: "Notes du chapitre",
    chapterNotesTitle: (book, chapter) => `Notes — ${book}, chapitre ${chapter}`,
    chapter: "Chapitre",
    stickerSaved: (chapter, book) =>
      `Votre autocollant de louange pour le chapitre ${chapter} est enregistré. Retournez à ${book} pour voir votre collection.`,
    backTo: (book) => `Retour à ${book}`,
  },
  ko: {
    language: "언어",
    chapterNotes: "장 노트",
    chapterNotesTitle: (book, chapter) => `${book} ${chapter}장 노트`,
    chapter: "장",
    stickerSaved: (chapter, book) =>
      `${chapter}장 찬미 스티커가 저장되었습니다. ${book}(으)로 돌아가 모음을 확인하세요.`,
    backTo: (book) => `${book}(으)로 돌아가기`,
  },
  pt: {
    language: "Idioma",
    chapterNotes: "Notas do capítulo",
    chapterNotesTitle: (book, chapter) => `Notas — ${book}, capítulo ${chapter}`,
    chapter: "Capítulo",
    stickerSaved: (chapter, book) =>
      `Seu adesivo de louvor do capítulo ${chapter} foi salvo. Volte a ${book} para ver sua coleção.`,
    backTo: (book) => `Voltar a ${book}`,
  },
  it: {
    language: "Lingua",
    chapterNotes: "Note del capitolo",
    chapterNotesTitle: (book, chapter) => `Note — ${book}, capitolo ${chapter}`,
    chapter: "Capitolo",
    stickerSaved: (chapter, book) =>
      `Il tuo adesivo di lode per il capitolo ${chapter} è stato salvato. Torna a ${book} per vedere la raccolta.`,
    backTo: (book) => `Torna a ${book}`,
  },
  de: {
    language: "Sprache",
    chapterNotes: "Kapitelnotizen",
    chapterNotesTitle: (book, chapter) => `Notizen — ${book}, Kapitel ${chapter}`,
    chapter: "Kapitel",
    stickerSaved: (chapter, book) =>
      `Dein Lob-Sticker für Kapitel ${chapter} wurde gespeichert. Zurück zu ${book}, um deine Sammlung zu sehen.`,
    backTo: (book) => `Zurück zu ${book}`,
  },
  pl: {
    language: "Język",
    chapterNotes: "Notatki do rozdziału",
    chapterNotesTitle: (book, chapter) => `Notatki — ${book}, rozdział ${chapter}`,
    chapter: "Rozdział",
    stickerSaved: (chapter, book) =>
      `Twoja naklejka pochwalna za rozdział ${chapter} została zapisana. Wróć do ${book}, aby zobaczyć kolekcję.`,
    backTo: (book) => `Powrót do ${book}`,
  },
  vi: {
    language: "Ngôn ngữ",
    chapterNotes: "Ghi chú chương",
    chapterNotesTitle: (book, chapter) => `Ghi chú — ${book}, chương ${chapter}`,
    chapter: "Chương",
    stickerSaved: (chapter, book) =>
      `Huy hiệu ca ngợi cho chương ${chapter} đã được lưu. Quay lại ${book} để xem bộ sưu tập.`,
    backTo: (book) => `Quay lại ${book}`,
  },
  tl: {
    language: "Wika",
    chapterNotes: "Mga tala sa kabanata",
    chapterNotesTitle: (book, chapter) => `Mga tala — ${book}, kabanata ${chapter}`,
    chapter: "Kabanata",
    stickerSaved: (chapter, book) =>
      `Nai-save ang iyong praise sticker para sa kabanata ${chapter}. Bumalik sa ${book} upang makita ang koleksyon.`,
    backTo: (book) => `Bumalik sa ${book}`,
  },
};

export function bibleUiLabels(lang: PrayerLanguageCode): BibleUiLabels {
  return LABELS[lang] ?? LABELS.en;
}
