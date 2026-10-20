import { DR_ETH_BASE, DR_ETH_FORMS, DR_THOU_FORMS } from "./archaic-verb-maps";
import { getVerseOverride } from "./verse-overrides";

/** Bump when modernization rules change so typing drafts reset. */
export const MODERNIZED_TEXT_VERSION = "v5";

/**
 * Light Douay-Rheims (public domain) wording refresh for easier reading.
 * Policy: keep Catholic / Douay vocabulary (penance, charity, chalice, Hail, full of grace,
 * adore, behold, firmament, multitude); modernize only pronouns, verb endings and grammar.
 * Never import wording from copyrighted translations.
 */

/** Typos in the Latin Prayer Douay-Rheims JSON (upstream), corrected before modernization. */
const SOURCE_TEXT_FIXES: readonly (readonly [string, string])[] = [
  ["was led the by the spirit", "was led by the Spirit"],
  ["answered him: is written", "answered him: It is written"],
  ["answered him: Is written", "answered him: It is written"],
  ["thou hath", "thou hast"],
  ["thou has", "thou hast"],
  ["thou was", "thou wast"],
  ["IN THEE", "IN YOU"],
  ["THY KING", "YOUR KING"],
];

/** Phrase rewrites (applied first, longest first). Case-sensitive, with a capitalized variant. */
const DR_PHRASES: readonly (readonly [string, string])[] = [
  ["man sick of the palsy", "paralyzed man"],
  ["sick of the palsy", "paralyzed"],
  ["remission of sins", "forgiveness of sins"],
  ["leathern girdle", "leather belt"],
  ["river of Jordan", "Jordan River"],
  ["all they of Jerusalem", "all the people of Jerusalem"],
  ["came over the strait of the sea", "crossed the sea"],
  ["coast of Judea", "region of Judea"],
  ["unless a man be born", "unless someone is born"],
  ["for the space of", "for"],
  ["entered into", "entered"],
  ["presently knowing", "immediately knowing"],
  ["it came to pass, that", "it happened that"],
  ["it came to pass that", "it happened that"],
  ["it came to pass", "it happened"],
  ["it shall come to pass, that", "it shall be that"],
  ["it shall come to pass that", "it shall be that"],
  ["shall come to pass", "shall happen"],
  ["came to pass", "happened"],
  ["is come to pass", "has happened"],
  ["Be light made", "Let there be light"],
  ["Holy Ghost", "Holy Spirit"],
  ["Prepare ye", "Prepare"],
  ["If thou be", "If you are"],
  ["If ye be", "If you are"],
  ["See thou", "See that you"],
  ["Thou fool", "You fool"],
  ["blessed art thou", "blessed are you"],
  ["from whence", "from where"],
  ["from thence", "from there"],
  ["the which", "which"],
  ["peradventure", "perhaps"],
  ["howbeit", "however"],
];

const MODALS = new Set(["are", "have", "had", "were", "do", "did", "can", "could", "will", "would", "shall", "should", "may", "might", "ought"]);

const PAST_TO_PRESENT: Readonly<Record<string, string>> = {
  went: "go", saw: "see", gave: "give", came: "come", made: "make", said: "say", knew: "know",
  heard: "hear", brought: "bring", sent: "send", spoke: "speak", took: "take", stood: "stand",
  slew: "slay", threw: "throw", left: "leave", swore: "swear", became: "become", drew: "draw",
  struck: "strike", broke: "break", began: "begin", thought: "think", besought: "beseech", sat: "sit",
};

/** Simple word swaps (word-boundary, capitalized variant handled). */
const DR_WORDS: Readonly<Record<string, string>> = {
  Isaias: "Isaiah", Capharnaum: "Capernaum", Gerasens: "Gerasenes", Magdalen: "Magdalene",
  sepulchre: "tomb", sepulchres: "tombs", palsy: "paralysis", damsel: "girl", damsels: "girls",
  shew: "show", shewed: "showed", shewn: "shown", shewing: "showing",
  spake: "spoke", sware: "swore",
  honour: "honor", honours: "honors", honoured: "honored", honourable: "honorable", dishonour: "dishonor",
  dishonoured: "dishonored", favour: "favor", favours: "favors", favoured: "favored", labour: "labor",
  labours: "labors", laboured: "labored", neighbour: "neighbor", neighbours: "neighbors", Saviour: "Savior",
  colour: "color", colours: "colors", savour: "savor", odour: "odor", odours: "odors", vapour: "vapor",
  valour: "valor", rumour: "rumor", harbour: "harbor", splendour: "splendor", armour: "armor",
  fervour: "fervor", succour: "succor", clamour: "clamor", endeavour: "endeavor", behaviour: "behavior",
  whosoever: "whoever", whatsoever: "whatever", whomsoever: "whomever", wheresoever: "wherever",
  whensoever: "whenever", unto: "to", verily: "truly", wherewith: "with which", wherein: "in which",
  whereby: "by which", whereof: "of which", whilst: "while", amongst: "among", whence: "from where",
  whither: "where", thence: "from there", hither: "here", thither: "there", publicans: "tax collectors",
  shalt: "shall", wilt: "will", canst: "can", hast: "have", dost: "do", didst: "did", hadst: "had",
  wast: "were", wert: "were", couldst: "could", wouldst: "would", shouldst: "should", mayest: "may",
  thyself: "yourself", thee: "you", thy: "your", thou: "you", ye: "you",
};

const POSSESSIVE_STOP = new Set([
  "is", "are", "was", "were", "be", "and", "or", "also", "not", "shall", "will", "hath", "has", "for",
  "that", "which", "the", "a", "an", "in", "of", "to", "own?", "with", "by", "from", "as", "but",
]);

const GOSPELS = new Set(["matthew", "mark", "luke", "john"]);

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function matchCase(src: string, out: string): string {
  return /^[A-Z]/.test(src) ? cap(out) : out;
}
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/** Whole-word phrase replace (never matches inside a longer word). */
function replacePhrase(text: string, from: string, to: string): string {
  const b = (s: string) => new RegExp(`(?<![A-Za-z])${escapeRe(s)}(?![A-Za-z])`, "g");
  let out = text.replace(b(from), to);
  const capFrom = cap(from);
  if (capFrom !== from) out = out.replace(b(capFrom), cap(to));
  return out;
}
function replaceWord(text: string, from: string, to: string): string {
  const re = new RegExp(`\\b(${from}|${cap(from)})\\b`, "g");
  return text.replace(re, (m) => matchCase(m, to));
}
function lc(w: string) {
  return w.toLowerCase();
}

/** "Knowest thou" -> "Do you know"; "Art thou" -> "Are you"; "Knowest thou not" -> "Do you not know". */
function invertThouQuestions(text: string): string {
  return text.replace(/\b([A-Za-z]+) (thou|thee)( not)?\b/g, (m, verb: string, _p, not?: string) => {
    const base = DR_THOU_FORMS[lc(verb)];
    if (!base) return m;
    const neg = not ? " not" : "";
    if (MODALS.has(base)) return matchCase(verb, base) + " you" + neg;
    const pres = PAST_TO_PRESENT[base];
    if (pres) return matchCase(verb, "did") + " you" + neg + " " + pres;
    if (/ed$/.test(base)) return matchCase(verb, base) + " you" + neg;
    return matchCase(verb, "do") + " you" + neg + " " + base;
  });
}

/** "thou knowest not" -> "you do not know" ; "thou canst not" -> "you cannot". */
function thouNot(text: string): string {
  return text.replace(/\b([Tt]hou) ([a-z]+) not\b/g, (m, t: string, verb: string) => {
    const base = DR_THOU_FORMS[verb];
    if (!base) return m;
    const you = matchCase(t, "you");
    if (base === "can") return `${you} cannot`;
    if (MODALS.has(base)) return `${you} ${base} not`;
    const pres = PAST_TO_PRESENT[base];
    if (pres) return `${you} did not ${pres}`;
    if (/ed$/.test(base)) return `${you} ${base} not`;
    return `${you} do not ${base}`;
  });
}

/** Within each clause that has "thou", turn remaining thou-verb forms into base forms. */
function thouClauses(text: string): string {
  return text.replace(/[^.;:?!]+[.;:?!]*/g, (clause) => {
    if (!/\b[Tt]hou\b/.test(clause)) return clause;
    let c = clause.replace(/\b([A-Za-z]+)\b/g, (w) => {
      if (lc(w) === "art") return w;
      const base = DR_THOU_FORMS[lc(w)];
      return base ? matchCase(w, base) : w;
    });
    // "thou art", "thou, O Lord, art", "thou who art", "thou only art"
    c = c.replace(/\b([Tt]hou)((?:,? (?:O [A-Z][a-z]+|[a-z]+),?){0,4}?) art\b/g, "$1$2 are");
    return c;
  });
}

/** "thine"/"mine" -> "your"/"yours", "my"/"mine". */
function possessives(text: string): string {
  text = text.replace(/\b([Tt])hine\b(\s+([A-Za-z]+))?/g, (m, t: string, rest?: string, next?: string) => {
    const yoursOrYour = !next || POSSESSIVE_STOP.has(lc(next)) || /^[A-Z]/.test(next) ? "yours" : "your";
    return (t === "T" ? cap(yoursOrYour) : yoursOrYour) + (rest ?? "");
  });
  text = text.replace(/\b([Mm])ine (?=([a-z]+))/g, (m, mm: string, next: string) => {
    if (POSSESSIVE_STOP.has(next) || !/^[aeiouh]/.test(next)) return m;
    return (mm === "M" ? "My" : "my") + " ";
  });
  return text;
}

function ethForms(text: string): string {
  text = text.replace(/\b([A-Za-z]+eth|saith|hath|doth) not\b/g, (m, w: string) => {
    const l = lc(w);
    if (l === "hath") return matchCase(w, "has") + " not";
    if (l === "doth" || l === "doeth") return matchCase(w, "does") + " not";
    const base = DR_ETH_BASE[l];
    return base ? matchCase(w, "does") + " not " + base : m;
  });
  return text.replace(/\b([A-Za-z]+(?:eth|ith|th))\b/g, (w) => {
    const f = DR_ETH_FORMS[lc(w)];
    return f ? matchCase(w, f) : w;
  });
}

function wherefore(text: string): string {
  return text.replace(/\b([Ww])herefore\b([^.;:?!]*[.;:?!]?)/g, (_m, w: string, rest: string) => {
    const word = rest.trim().endsWith("?") ? "why" : "therefore";
    return (w === "W" ? cap(word) : word) + rest;
  });
}

export type ModernizeOptions = { bookSlug?: string };

export function modernizeForReading(text: string, opts: ModernizeOptions = {}): string {
  let out = text;
  for (const [from, to] of SOURCE_TEXT_FIXES) out = replacePhrase(out, from, to);
  for (const [from, to] of DR_PHRASES) out = replacePhrase(out, from, to);
  out = out.replace(/(?<!\b(?:from|to|One|one) )\b([Oo])ne to another\b/g, (_m, o: string) => (o === "O" ? "To" : "to") + " one another");
  out = out.replace(/\b([Tt])hou shalt\b/g, (_m, t: string) => (t === "T" ? "You" : "you") + " shall");

  out = out.replace(/\b([Dd])o not thou\b/g, "$1o not");
  // Imperative + thou at clause start: "Go thou and do likewise" -> "Go and do likewise".
  out = out.replace(/(^|[.;:?!(] )([A-Z]?[a-z]+) thou\b/g, (m, pre: string, verb: string) =>
    DR_THOU_FORMS[lc(verb)] || /^(and|but|for|if|that|when|O|or|nor|yet|so|as|because|then)$/i.test(verb) ? m : pre + verb);
  out = invertThouQuestions(out);
  out = thouNot(out);
  out = thouClauses(out);
  out = possessives(out);
  out = ethForms(out);
  out = wherefore(out);
  for (const [from, to] of Object.entries(DR_WORDS)) out = replaceWord(out, from, to);
  if (opts.bookSlug && GOSPELS.has(opts.bookSlug)) out = replaceWord(out, "monuments", "tombs");
  out = replaceWord(out, "no man", "no one");

  // Grammar cleanup after pronoun swaps.
  out = out
    .replace(/\b(I|we|they|you|We|They|You) know (you|him|her|them|me|us|it) not\b/g, "$1 do not know $2")
    .replace(/\b(I|we|they|you|We|They|You) know not\b/g, "$1 do not know")
    .replace(/\b(he|she|He|She) knows not\b/g, "$1 does not know")
    .replace(/\bIf you be\b/g, "If you are")
    .replace(/\bif you be\b/g, "if you are")
    .replace(/\byou art\b/g, "you are")
    .replace(/\bart you\b/g, "are you")
    .replace(/\bArt you\b/g, "Are you")
    .replace(/\byou can not\b/g, "you cannot")
    .replace(/\b(if|If|unless|Unless|until|lest|that|though) (he|she|it|any man|any one|anyone|one|a man|a woman|someone) have\b/g, "$1 $2 has")
    .replace(/\b(Till|till) (he|she|it) have\b/g, "$1 $2 has")
    .replace(/([a-z])\. (you|he|she|they|we|it)\b/g, (_m, a: string, p: string) => `${a}. ${cap(p)}`)
    .replace(/([a-z])\. (and|or|but|nor|with|which|who|whom|whose|that|for|to|in|of|the|lest|from|saying|said|into|having|being|now|because|as)\b/g, "$1, $2")
    .replace(/\bWhat do you here\b/g, "What are you doing here")
    .replace(/\bwhat do you here\b/g, "what are you doing here")
    .replace(/\b([Ww])hy do you these\b/g, "$1hy are you doing these")
    .replace(/\bauthority do you these things\b/g, "authority are you doing these things")
    .replace(/\bWhy do you so\?/g, "Why do you do this?")
    .replace(/\bdo you nothing\b/g, "do nothing")
    .replace(/\bneither do you any\b/g, "neither do any")
    .replace(/\bdo you it for\b/g, "do it for")
    .replace(/ {2,}/g, " ");
  return out;
}

/** Modernize one verse, then apply a hand-corrected override when one exists. */
export function modernizeVerse(bookSlug: string, chapter: number, verse: number, text: string): string {
  const override = getVerseOverride(bookSlug, chapter, verse);
  if (override !== undefined) return override;
  return modernizeForReading(text, { bookSlug });
}
