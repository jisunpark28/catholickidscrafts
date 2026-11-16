import type { VerseClawDollId } from "@/lib/verse-claw/dolls";

/**
 * Short Douay-Rheims verses for kids (curated). bookSlug matches site Bible routes.
 */
export type VerseClawVerse = {
  id: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  /** Display reference, e.g. "John 3:16". */
  ref: string;
  text: string;
  keepnote: string;
  dolls: VerseClawDollId[];
};

export const VERSE_CLAW_VERSES: VerseClawVerse[] = [
  {
    id: "jn-3-16",
    bookSlug: "john",
    chapter: 3,
    verse: 16,
    ref: "John 3:16",
    text: "For God so loved the world, as to give his only begotten Son; that whosoever believeth in him, may not perish, but may have life everlasting.",
    keepnote: "He loves you so much—just as you are. You are His precious child.",
    dolls: ["little-sheep", "halo-lamb"],
  },
  {
    id: "mt-19-14",
    bookSlug: "matthew",
    chapter: 19,
    verse: 14,
    ref: "Matthew 19:14",
    text: "But Jesus said to them: Suffer the little children, and forbid them not to come to me: for the kingdom of heaven is for such.",
    keepnote: "Jesus always makes room for little ones—like you.",
    dolls: ["little-sheep", "tiny-ark"],
  },
  {
    id: "ps-22-1",
    bookSlug: "psalms",
    chapter: 22,
    verse: 1,
    ref: "Psalm 22:1",
    text: "The Lord ruleth me: and I shall want nothing.",
    keepnote: "The Good Shepherd takes care of His sheep.",
    dolls: ["little-sheep", "halo-lamb"],
  },
  {
    id: "jn-14-27",
    bookSlug: "john",
    chapter: 14,
    verse: 27,
    ref: "John 14:27",
    text: "Peace I leave with you, my peace I give unto you: not as the world giveth, do I give unto you. Let not your heart be troubled, nor let it be afraid.",
    keepnote: "Jesus gives a quiet peace that stays with you.",
    dolls: ["peace-dove"],
  },
  {
    id: "gal-5-22",
    bookSlug: "galatians",
    chapter: 5,
    verse: 22,
    ref: "Galatians 5:22",
    text: "But the fruit of the Spirit is, charity, joy, peace, patience, benignity, goodness, longanimity.",
    keepnote: "The Holy Spirit grows good fruit in our hearts.",
    dolls: ["peace-dove", "joy-apple"],
  },
  {
    id: "mt-3-16",
    bookSlug: "matthew",
    chapter: 3,
    verse: 16,
    ref: "Matthew 3:16",
    text: "And Jesus being baptized, forthwith came out of the water: and lo, the heavens were opened to him: and he saw the Spirit of God descending as a dove, and coming upon him.",
    keepnote: "The Spirit came like a gentle dove.",
    dolls: ["peace-dove"],
  },
  {
    id: "mt-4-19",
    bookSlug: "matthew",
    chapter: 4,
    verse: 19,
    ref: "Matthew 4:19",
    text: "And he saith to them: Come ye after me, and I will make you to be fishers of men.",
    keepnote: "Follow Jesus—He invites you to share His love.",
    dolls: ["ichthys-fish"],
  },
  {
    id: "jn-21-6",
    bookSlug: "john",
    chapter: 21,
    verse: 6,
    ref: "John 21:6",
    text: "He saith to them: Cast the net on the right side of the ship, and you shall find. They cast therefore; and now they were not able to draw it, for the multitude of fishes.",
    keepnote: "When we listen to Jesus, joy overflows.",
    dolls: ["ichthys-fish", "tiny-ark"],
  },
  {
    id: "jn-1-29",
    bookSlug: "john",
    chapter: 1,
    verse: 29,
    ref: "John 1:29",
    text: "The next day, John saw Jesus coming to him, and he saith: Behold the Lamb of God, behold him who taketh away the sin of the world.",
    keepnote: "Jesus is the gentle Lamb who saves us.",
    dolls: ["halo-lamb"],
  },
  {
    id: "rv-7-17",
    bookSlug: "apocalypse",
    chapter: 7,
    verse: 17,
    ref: "Apocalypse 7:17",
    text: "For the Lamb, which is in the midst of the throne, shall rule them, and shall lead them to the fountains of the waters of life, and God shall wipe away all tears from their eyes.",
    keepnote: "The Lamb leads us to living water and comfort.",
    dolls: ["halo-lamb"],
  },
  {
    id: "jn-6-35",
    bookSlug: "john",
    chapter: 6,
    verse: 35,
    ref: "John 6:35",
    text: "And Jesus said to them: I am the bread of life: he that cometh to me shall not hunger: and he that believeth in me shall never thirst.",
    keepnote: "Jesus feeds our hearts with Himself.",
    dolls: ["bread-friend"],
  },
  {
    id: "lk-22-19",
    bookSlug: "luke",
    chapter: 22,
    verse: 19,
    ref: "Luke 22:19",
    text: "And taking bread, he gave thanks, and brake; and gave to them, saying: This is my body, which is given for you. Do this for a commemoration of me.",
    keepnote: "At Mass we remember Jesus with love.",
    dolls: ["bread-friend"],
  },
  {
    id: "ps-33-9",
    bookSlug: "psalms",
    chapter: 33,
    verse: 9,
    ref: "Psalm 33:9",
    text: "O taste, and see that the Lord is sweet: blessed is the man that hopeth in him.",
    keepnote: "God’s goodness is a joy to taste and see.",
    dolls: ["joy-apple", "bread-friend"],
  },
  {
    id: "phil-4-4",
    bookSlug: "philippians",
    chapter: 4,
    verse: 4,
    ref: "Philippians 4:4",
    text: "Rejoice in the Lord always; again, I say, rejoice.",
    keepnote: "Joy is a gift we can share every day.",
    dolls: ["joy-apple"],
  },
  {
    id: "mt-2-10",
    bookSlug: "matthew",
    chapter: 2,
    verse: 10,
    ref: "Matthew 2:10",
    text: "And seeing the star they rejoiced with exceeding great joy.",
    keepnote: "The Christmas star still points us to Jesus.",
    dolls: ["night-star"],
  },
  {
    id: "mt-5-14",
    bookSlug: "matthew",
    chapter: 5,
    verse: 14,
    ref: "Matthew 5:14",
    text: "You are the light of the world. A city seated on a mountain cannot be hid.",
    keepnote: "Your kindness can shine like a little star.",
    dolls: ["night-star"],
  },
  {
    id: "gn-9-13",
    bookSlug: "genesis",
    chapter: 9,
    verse: 13,
    ref: "Genesis 9:13",
    text: "I will set my bow in the clouds, and it shall be the sign of a covenant between me, and between the earth.",
    keepnote: "God keeps His promises—like a rainbow after the storm.",
    dolls: ["tiny-ark"],
  },
  {
    id: "ps-90-11",
    bookSlug: "psalms",
    chapter: 90,
    verse: 11,
    ref: "Psalm 90:11",
    text: "For he hath given his angels charge over thee; to keep thee in all thy ways.",
    keepnote: "God watches over your family with care.",
    dolls: ["tiny-ark", "night-star"],
  },
  {
    id: "1jn-4-8",
    bookSlug: "1-john",
    chapter: 4,
    verse: 8,
    ref: "1 John 4:8",
    text: "He that loveth not, knoweth not God: for God is charity.",
    keepnote: "God is love—and love is meant to be shared.",
    dolls: ["little-sheep", "joy-apple", "peace-dove"],
  },
  {
    id: "jos-1-9",
    bookSlug: "josue",
    chapter: 1,
    verse: 9,
    ref: "Josue 1:9",
    text: "Behold I command thee, take courage, and be strong. Fear not and be not dismayed: because the Lord thy God is with thee in all things whatsoever thou shalt go to.",
    keepnote: "Be brave—God goes with you.",
    dolls: ["ichthys-fish", "tiny-ark", "night-star"],
  },
];

export function pickVerseForDoll(dollId: VerseClawDollId, excludeId?: string): VerseClawVerse {
  const themed = VERSE_CLAW_VERSES.filter((v) => v.dolls.includes(dollId) && v.id !== excludeId);
  const pool = themed.length > 0 ? themed : VERSE_CLAW_VERSES.filter((v) => v.id !== excludeId);
  const list = pool.length > 0 ? pool : VERSE_CLAW_VERSES;
  const index = Math.floor(Math.random() * list.length);
  return list[index]!;
}
