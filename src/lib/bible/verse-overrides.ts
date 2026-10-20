/**
 * Hand-corrected verses (key: "<latinprayer slug> <chapter>:<verse>"), applied after modernization.
 * Every entry is derived only from the public-domain Douay-Rheims text of the same verse.
 */
import { MARK_OVERRIDES } from "./verse-overrides/mark";
import { MATTHEW_OVERRIDES } from "./verse-overrides/matthew";
import { LUKE_OVERRIDES } from "./verse-overrides/luke";
import { JOHN_OVERRIDES } from "./verse-overrides/john";

/** Per-book hand-polished overrides (key "chapter:verse"). */
const BOOK_OVERRIDES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  matthew: MATTHEW_OVERRIDES,
  mark: MARK_OVERRIDES,
  luke: LUKE_OVERRIDES,
  john: JOHN_OVERRIDES,
};

const GENERAL_OVERRIDES: Readonly<Record<string, string>> = {
  // Douay "whence is this to me" = how does this come to me (not a place question).
  "luke 1:43": "And how is it that the mother of my Lord should come to me?",
  // Douay "Go, and do thou in like manner."
  "luke 10:37": "But he said: The one who showed mercy to him. And Jesus said to him: Go, and do the same.",
  // Douay "Drink ye all of this."
  "matthew 26:27": "And taking the chalice, he gave thanks and gave to them, saying: Drink of this, all of you.",
  // Douay "one sick of the palsy"
  "matthew 9:2": "And behold they brought to him a paralyzed man lying in a bed. And Jesus, seeing their faith, said to the paralyzed man: Be of good heart, son, your sins are forgiven you.",
  // Upstream has a stray period: "friends. because"
  "john 15:15": "I will not now call you servants: for the servant does not know what his lord does. But I have called you friends, because all things, whatever I have heard of my Father, I have made known to you.",
};

/** Look up a hand-corrected verse; per-book polish wins over general fixes. */
export function getVerseOverride(bookSlug: string, chapter: number, verse: number): string | undefined {
  return BOOK_OVERRIDES[bookSlug]?.[`${chapter}:${verse}`] ?? GENERAL_OVERRIDES[`${bookSlug} ${chapter}:${verse}`];
}
