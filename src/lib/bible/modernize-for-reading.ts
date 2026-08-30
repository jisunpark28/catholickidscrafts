/** Books using the reading-modernization pilot (Douay-Rheims wording refresh). */
export const MODERNIZED_BOOK_SLUGS = new Set(["mark"]);

/** Bump when modernization rules change so typing drafts reset. */
export const MODERNIZED_TEXT_VERSION = "v1";

export function usesModernizedReading(bookSlug: string): boolean {
  return MODERNIZED_BOOK_SLUGS.has(bookSlug);
}

/** Longest phrases first — vocabulary and grammar helpers for Mark. */
const MARK_PHRASES: readonly (readonly [string, string])[] = [
  ["man sick of the palsy", "paralyzed man"],
  ["sick of the palsy", "paralyzed"],
  ["baptism of penance", "baptism of repentance"],
  ["remission of sins", "forgiveness of sins"],
  ["leathern girdle", "leather belt"],
  ["river of Jordan", "Jordan River"],
  ["all they of Jerusalem", "all the people of Jerusalem"],
  ["came over the strait of the sea", "crossed the sea"],
  ["strait of the sea", "the sea"],
  ["bill of divorce", "certificate of divorce"],
  ["coast of Judea", "region of Judea"],
  ["one to another", "each other"],
  ["no, not even", "not even"],
  ["Prepare ye", "Prepare"],
  ["shew thyself", "show yourself"],
  ["Art thou", "Are you"],
  ["thou shalt", "you will"],
  ["thou wilt", "you will"],
  ["thou hast", "you have"],
  ["thou canst", "you can"],
  ["thou art", "you are"],
  ["dost thou", "do you"],
  ["If thou", "If you"],
  ["unto thee", "to you"],
  ["with thee", "with you"],
  ["for thee", "for you"],
  ["of thee", "of you"],
  ["to thee", "to you"],
  ["entered into", "entered"],
  ["very great", "very large"],
  ["sweet spices", "spices"],
  ["Be thou", "Be"],
  ["See thou", "See that you"],
];

const MARK_ETH_VERBS: Readonly<Record<string, string>> = {
  ariseth: "arises",
  becometh: "becomes",
  believeth: "believes",
  blasphemeth: "blasphemes",
  bringeth: "brings",
  calleth: "calls",
  casteth: "casts",
  cometh: "comes",
  commandeth: "commands",
  committeth: "commits",
  dasheth: "dashes",
  dieth: "dies",
  dippeth: "dips",
  eateth: "eats",
  entereth: "enters",
  falleth: "falls",
  findeth: "finds",
  foameth: "foams",
  followeth: "follows",
  gnasheth: "gnashes",
  goeth: "goes",
  groweth: "grows",
  honoureth: "honors",
  knoweth: "knows",
  leadeth: "leads",
  pineth: "pines",
  putteth: "puts",
  readeth: "reads",
  receiveth: "receives",
  seeth: "sees",
  sendeth: "sends",
  seweth: "sews",
  shooteth: "shoots",
  sitteth: "sits",
  sleepeth: "sleeps",
  soweth: "sows",
  taketh: "takes",
};

const MARK_WORDS: Readonly<Record<string, string>> = {
  Isaias: "Isaiah",
  Capharnaum: "Capernaum",
  Gerasens: "Gerasenes",
  Magdalen: "Magdalene",
  sepulchre: "tomb",
  monuments: "tombs",
  palsy: "paralysis",
  penance: "repentance",
  damsel: "girl",
  shew: "show",
  shewed: "showed",
  honour: "honor",
  neighbour: "neighbor",
  labour: "labor",
  saith: "says",
  hath: "has",
  doth: "does",
  whosoever: "whoever",
  thyself: "yourself",
  thine: "your",
  thy: "your",
  thee: "you",
  ye: "you",
  unto: "to",
  wilt: "will",
  shalt: "will",
  wherewith: "with which",
};

function replacePhrase(text: string, from: string, to: string): string {
  let out = text.split(from).join(to);
  const capFrom = from.charAt(0).toUpperCase() + from.slice(1);
  if (capFrom !== from) {
    const capTo = to.charAt(0).toUpperCase() + to.slice(1);
    out = out.split(capFrom).join(capTo);
  }
  return out;
}

function replaceWord(text: string, from: string, to: string): string {
  const pattern = new RegExp(`\\b${from}\\b`, "g");
  const capPattern = new RegExp(`\\b${from.charAt(0).toUpperCase()}${from.slice(1)}\\b`, "g");
  return text.replace(capPattern, to.charAt(0).toUpperCase() + to.slice(1)).replace(pattern, to);
}

/**
 * Light Douay-Rheims wording refresh for easier reading. Does not change meaning or add text.
 * Pilot: Gospel of Mark only.
 */
export function modernizeForReading(
  text: string,
  options?: { bookSlug?: string },
): string {
  const bookSlug = options?.bookSlug;
  if (bookSlug && !usesModernizedReading(bookSlug)) return text;

  let out = text;
  for (const [from, to] of MARK_PHRASES) {
    out = replacePhrase(out, from, to);
  }

  for (const [from, to] of Object.entries(MARK_ETH_VERBS)) {
    out = replaceWord(out, from, to);
  }

  for (const [from, to] of Object.entries(MARK_WORDS)) {
    out = replaceWord(out, from, to);
  }

  out = replaceWord(out, "no man", "no one");

  return out;
}
