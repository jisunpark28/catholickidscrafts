export type PlayWordsAdminConfig = {
  apiBase: string;
  adminListPath: string;
  editPathPrefix: string;
  playHref: string;
  playLabel: string;
  intro: string;
  wordNote: string;
  deleteConfirmLabel: string;
};

export const TYPING_WORDS_ADMIN: PlayWordsAdminConfig = {
  apiBase: "/api/admin/typing-words",
  adminListPath: "/admin/typing-words",
  editPathPrefix: "/admin/typing-words",
  playHref: "/play/typing",
  playLabel: "Play → Typing",
  intro: "Words appear in Word mode at",
  wordNote: "Use short kid-friendly words (letters and spaces work best).",
  deleteConfirmLabel: "typing word",
};

export const HANGMAN_WORDS_ADMIN: PlayWordsAdminConfig = {
  apiBase: "/api/admin/hangman-words",
  adminListPath: "/admin/hangman-words",
  editPathPrefix: "/admin/hangman-words",
  playHref: "/play/hangman",
  playLabel: "Play → Hangman",
  intro: "Words appear in the hangman game at",
  wordNote: "Letters and spaces work best (e.g. holy water).",
  deleteConfirmLabel: "hangman word",
};
