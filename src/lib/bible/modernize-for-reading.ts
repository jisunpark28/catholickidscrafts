/** Bump when modernization rules change so typing drafts reset. */
export const MODERNIZED_TEXT_VERSION = "v3";

/** Typos in the Latin Prayer Douay-Rheims JSON (upstream), corrected before modernization. */
const SOURCE_TEXT_FIXES: readonly (readonly [string, string])[] = [
  ["was led the by the spirit", "was led by the Spirit"],
  ["answered him: is written", "answered him: It is written"],
  ["answered him: Is written", "answered him: It is written"],
];

/** Longest phrases first — Douay-Rheims vocabulary and grammar helpers (all books). */
const DR_PHRASES: readonly (readonly [string, string])[] = [
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
  ["unless a man be born", "unless someone is born"],
  ["unless a man be", "unless someone is"],
  ["Man liveth not", "People do not live"],
  ["liveth not by", "does not live by"],
  ["for the space of", "for"],
  ["all shall be thine", "all shall be yours"],
  ["To thee will I give", "I will give you"],
  ["presently knowing", "immediately knowing"],
  ["it came to pass", "then"],
  ["Be light made", "Let there be light"],
  ["void and empty", "empty"],
  ["the multitude", "the crowd"],
  ["that it be made", "that it become"],
  ["If thou be", "If you are"],
  ["God be with", "God is with"],
  ["Prepare ye", "Prepare"],
  ["shew thyself", "show yourself"],
  ["Art thou", "Are you"],
  ["thou shalt", "you will"],
  ["thou wilt", "you will"],
  ["thou hast", "you have"],
  ["thou canst", "you can"],
  ["thou art", "you are"],
  ["thou dost", "you do"],
  ["thou gavest", "you gave"],
  ["thou knowest", "you know"],
  ["thou hearest", "you hear"],
  ["dost thou", "do you"],
  ["shalt thou", "will you"],
  ["will thou", "will you"],
  ["If thou", "If you"],
  ["Thou fool", "You fool"],
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
  ["Holy Ghost", "Holy Spirit"],
  ["shall adore", "shall worship"],
  ["will adore", "will worship"],
  ["to adore", "to worship"],
  ["adore the", "worship the"],
  ["adore before", "worship before"],
];

/** Fixes awkward grammar left by partial pronoun swaps (run after phrase + word passes). */
const GRAMMAR_CLEANUP: readonly (readonly [string, string])[] = [
  ["If you be", "If you are"],
  ["all shall be your.", "all shall be yours."],
  ["all shall be your,", "all shall be yours,"],
];

const DR_ETH_VERBS: Readonly<Record<string, string>> = {
  ariseth: "arises",
  baptizeth: "baptizes",
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
  doeth: "does",
  eateth: "eats",
  entereth: "enters",
  falleth: "falls",
  findeth: "finds",
  foameth: "foams",
  followeth: "follows",
  giveth: "gives",
  gnasheth: "gnashes",
  goeth: "goes",
  groweth: "grows",
  heareth: "hears",
  honoureth: "honors",
  knoweth: "knows",
  leadeth: "leads",
  liveth: "lives",
  maketh: "makes",
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
  speaketh: "speaks",
  standeth: "stands",
  taketh: "takes",
  writeth: "writes",
};

const DR_WORDS: Readonly<Record<string, string>> = {
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
  spake: "spoke",
  hath: "has",
  doth: "does",
  whosoever: "whoever",
  thyself: "yourself",
  thine: "your",
  thy: "your",
  thee: "you",
  thou: "you",
  ye: "you",
  unto: "to",
  wilt: "will",
  shalt: "will",
  wherewith: "with which",
  behold: "see",
  verily: "truly",
  wherefore: "so",
  wherein: "where",
  whilst: "while",
  amongst: "among",
  whence: "where",
  whither: "where",
  thence: "there",
  hither: "here",
  multitude: "crowd",
  publicans: "tax collectors",
  adore: "worship",
  firmament: "sky",
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
 * Applied to all Bible books for display and typing.
 */
export function modernizeForReading(text: string): string {
  let out = text;

  for (const [from, to] of SOURCE_TEXT_FIXES) {
    out = replacePhrase(out, from, to);
  }

  for (const [from, to] of DR_PHRASES) {
    out = replacePhrase(out, from, to);
  }

  for (const [from, to] of Object.entries(DR_ETH_VERBS)) {
    out = replaceWord(out, from, to);
  }

  for (const [from, to] of Object.entries(DR_WORDS)) {
    out = replaceWord(out, from, to);
  }

  out = replaceWord(out, "no man", "no one");

  for (const [from, to] of GRAMMAR_CLEANUP) {
    out = replacePhrase(out, from, to);
  }

  return out;
}
