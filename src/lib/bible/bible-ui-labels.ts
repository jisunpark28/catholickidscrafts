import type { PrayerLanguageCode } from "@/lib/prayers/prayer-languages";

export type BibleUiLabels = {
  language: string;
  chapterNotes: string;
  chapterNotesTitle: (book: string, chapter: number) => string;
  disclaimer: string;
  chapter: string;
  stickerSaved: (chapter: number, book: string) => string;
  backTo: (book: string) => string;
};

const LABELS: Record<PrayerLanguageCode, BibleUiLabels> = {
  en: {
    language: "Language",
    chapterNotes: "Chapter notes",
    chapterNotesTitle: (book, chapter) => `${book} — Chapter ${chapter} notes`,
    disclaimer: "Notes help understanding; they are not part of the Bible text you type.",
    chapter: "Chapter",
    stickerSaved: (chapter, book) =>
      `Your praise sticker for chapter ${chapter} is saved. Back to ${book} to see your collection.`,
    backTo: (book) => `Back to ${book}`,
  },
  es: {
    language: "Idioma",
    chapterNotes: "Notas del capítulo",
    chapterNotesTitle: (book, chapter) => `Notas — ${book}, capítulo ${chapter}`,
    disclaimer:
      "Estas notas ayudan a comprender; no forman parte del texto bíblico que escribes.",
    chapter: "Capítulo",
    stickerSaved: (chapter, book) =>
      `Tu pegatina de alabanza del capítulo ${chapter} está guardada. Vuelve a ${book} para ver tu colección.`,
    backTo: (book) => `Volver a ${book}`,
  },
  fr: {
    language: "Langue",
    chapterNotes: "Notes du chapitre",
    chapterNotesTitle: (book, chapter) => `Notes — ${book}, chapitre ${chapter}`,
    disclaimer:
      "Ces notes aident à comprendre ; elles ne font pas partie du texte biblique que vous tapez.",
    chapter: "Chapitre",
    stickerSaved: (chapter, book) =>
      `Votre autocollant de louange pour le chapitre ${chapter} est enregistré. Retournez à ${book} pour voir votre collection.`,
    backTo: (book) => `Retour à ${book}`,
  },
  ko: {
    language: "언어",
    chapterNotes: "장 노트",
    chapterNotesTitle: (book, chapter) => `${book} ${chapter}장 노트`,
    disclaimer: "이 설명은 이해를 돕기 위한 것이며, 타이핑하는 성경 본문이 아닙니다.",
    chapter: "장",
    stickerSaved: (chapter, book) =>
      `${chapter}장 찬미 스티커가 저장되었습니다. ${book}(으)로 돌아가 모음을 확인하세요.`,
    backTo: (book) => `${book}(으)로 돌아가기`,
  },
  pt: {
    language: "Idioma",
    chapterNotes: "Notas do capítulo",
    chapterNotesTitle: (book, chapter) => `Notas — ${book}, capítulo ${chapter}`,
    disclaimer:
      "Estas notas ajudam na compreensão; não fazem parte do texto bíblico que você digita.",
    chapter: "Capítulo",
    stickerSaved: (chapter, book) =>
      `Seu adesivo de louvor do capítulo ${chapter} foi salvo. Volte a ${book} para ver sua coleção.`,
    backTo: (book) => `Voltar a ${book}`,
  },
  it: {
    language: "Lingua",
    chapterNotes: "Note del capitolo",
    chapterNotesTitle: (book, chapter) => `Note — ${book}, capitolo ${chapter}`,
    disclaimer:
      "Queste note aiutano la comprensione; non fanno parte del testo biblico che digiti.",
    chapter: "Capitolo",
    stickerSaved: (chapter, book) =>
      `Il tuo adesivo di lode per il capitolo ${chapter} è stato salvato. Torna a ${book} per vedere la raccolta.`,
    backTo: (book) => `Torna a ${book}`,
  },
  de: {
    language: "Sprache",
    chapterNotes: "Kapitelnotizen",
    chapterNotesTitle: (book, chapter) => `Notizen — ${book}, Kapitel ${chapter}`,
    disclaimer:
      "Diese Hinweise helfen beim Verstehen; sie sind nicht Teil des Bibeltextes, den du tippst.",
    chapter: "Kapitel",
    stickerSaved: (chapter, book) =>
      `Dein Lob-Sticker für Kapitel ${chapter} wurde gespeichert. Zurück zu ${book}, um deine Sammlung zu sehen.`,
    backTo: (book) => `Zurück zu ${book}`,
  },
  pl: {
    language: "Język",
    chapterNotes: "Notatki do rozdziału",
    chapterNotesTitle: (book, chapter) => `Notatki — ${book}, rozdział ${chapter}`,
    disclaimer:
      "Te notatki pomagają zrozumieć tekst; nie są częścią biblijnego tekstu, który przepisujesz.",
    chapter: "Rozdział",
    stickerSaved: (chapter, book) =>
      `Twoja naklejka pochwalna za rozdział ${chapter} została zapisana. Wróć do ${book}, aby zobaczyć kolekcję.`,
    backTo: (book) => `Powrót do ${book}`,
  },
  vi: {
    language: "Ngôn ngữ",
    chapterNotes: "Ghi chú chương",
    chapterNotesTitle: (book, chapter) => `Ghi chú — ${book}, chương ${chapter}`,
    disclaimer:
      "Những ghi chú này giúp hiểu bài; chúng không phải phần Kinh Thánh bạn đang gõ.",
    chapter: "Chương",
    stickerSaved: (chapter, book) =>
      `Huy hiệu ca ngợi cho chương ${chapter} đã được lưu. Quay lại ${book} để xem bộ sưu tập.`,
    backTo: (book) => `Quay lại ${book}`,
  },
  tl: {
    language: "Wika",
    chapterNotes: "Mga tala sa kabanata",
    chapterNotesTitle: (book, chapter) => `Mga tala — ${book}, kabanata ${chapter}`,
    disclaimer:
      "Ang mga talang ito ay tumutulong sa pag-unawa; hindi sila bahagi ng tekstong biblikal na iyong tina-type.",
    chapter: "Kabanata",
    stickerSaved: (chapter, book) =>
      `Nai-save ang iyong praise sticker para sa kabanata ${chapter}. Bumalik sa ${book} upang makita ang koleksyon.`,
    backTo: (book) => `Bumalik sa ${book}`,
  },
};

export function bibleUiLabels(lang: PrayerLanguageCode): BibleUiLabels {
  return LABELS[lang] ?? LABELS.en;
}
