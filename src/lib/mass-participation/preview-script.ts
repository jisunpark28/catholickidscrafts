/** Preview subset — St. Andrew Kim Sunday School projector flow (Introductory Rites). */

export type MassSpeakerRole = "priest" | "assembly" | "rubric";

export type MassParticipationLine = {
  id: string;
  section: string;
  role: MassSpeakerRole;
  text: string;
  /** Assembly lines can be hidden for practice. */
  revealable?: boolean;
  /** Omit when season is advent-lent (no Gloria). */
  skipWhen?: "advent-lent";
};

export const MASS_PREVIEW_SECTIONS = [
  { id: "intro", label: "Introductory Rites" },
  { id: "word", label: "Liturgy of the Word (sample)" },
] as const;

export const MASS_PREVIEW_LINES: MassParticipationLine[] = [
  {
    id: "intro-1",
    section: "intro",
    role: "rubric",
    text: "Entrance hymn — sing while the priest and ministers enter.",
  },
  {
    id: "intro-2",
    section: "intro",
    role: "priest",
    text: "In the name of the Father, and of the Son, and of the Holy Spirit.",
  },
  {
    id: "intro-3",
    section: "intro",
    role: "assembly",
    text: "Amen.",
    revealable: true,
  },
  {
    id: "intro-4",
    section: "intro",
    role: "priest",
    text: "The grace of our Lord Jesus Christ and the love of God and the communion of the Holy Spirit be with you all.",
  },
  {
    id: "intro-5",
    section: "intro",
    role: "assembly",
    text: "And with your spirit.",
    revealable: true,
  },
  {
    id: "intro-6",
    section: "intro",
    role: "assembly",
    text: "I confess to almighty God and to you, my brothers and sisters, that I have greatly sinned, in my thoughts and in my words, in what I have done and in what I have failed to do,",
    revealable: true,
  },
  {
    id: "intro-7",
    section: "intro",
    role: "rubric",
    text: "Strike your breast three times.",
  },
  {
    id: "intro-8",
    section: "intro",
    role: "assembly",
    text: "through my fault, through my fault, through my most grievous fault; therefore I ask blessed Mary ever-Virgin, all the Angels and Saints, and you, my brothers and sisters, to pray for me to the Lord our God.",
    revealable: true,
  },
  {
    id: "intro-9",
    section: "intro",
    role: "priest",
    text: "May almighty God have mercy on us, forgive us our sins, and bring us to everlasting life.",
  },
  {
    id: "intro-10",
    section: "intro",
    role: "assembly",
    text: "Amen.",
    revealable: true,
  },
  {
    id: "intro-11",
    section: "intro",
    role: "assembly",
    text: "Lord, have mercy, Lord, have mercy. Christ, have mercy, Christ, have mercy. Lord, have mercy, Lord, have mercy.",
    revealable: true,
  },
  {
    id: "intro-12",
    section: "intro",
    role: "assembly",
    text: "Glory to God in the highest, and on earth peace to people of good will. We praise you, we bless you, we adore you, we glorify you. We give you thanks for your great glory, Lord God, heavenly King, O God, almighty Father.",
    revealable: true,
    skipWhen: "advent-lent",
  },
  {
    id: "intro-13",
    section: "intro",
    role: "assembly",
    text: "Lord Jesus Christ, only Begotten Son, Lord God, Lamb of God, Son of the Father, you take away the sins of the world, have mercy on us; you take away the sins of the world, receive our prayer; you are seated at the right hand of the Father; have mercy on us.",
    revealable: true,
    skipWhen: "advent-lent",
  },
  {
    id: "intro-14",
    section: "intro",
    role: "assembly",
    text: "For you alone are the Holy One, you alone are the Lord, you alone are the Most High, Jesus Christ, with the Holy Spirit, in the glory of God the Father. Amen.",
    revealable: true,
    skipWhen: "advent-lent",
  },
  {
    id: "intro-15",
    section: "intro",
    role: "priest",
    text: "Let us pray. … Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever.",
  },
  {
    id: "intro-16",
    section: "intro",
    role: "assembly",
    text: "Amen.",
    revealable: true,
  },
  {
    id: "word-1",
    section: "word",
    role: "rubric",
    text: "After the first reading:",
  },
  {
    id: "word-2",
    section: "word",
    role: "priest",
    text: "The word of the Lord.",
  },
  {
    id: "word-3",
    section: "word",
    role: "assembly",
    text: "Thanks be to God.",
    revealable: true,
  },
  {
    id: "word-4",
    section: "word",
    role: "priest",
    text: "The Lord be with you.",
  },
  {
    id: "word-5",
    section: "word",
    role: "assembly",
    text: "And with your spirit.",
    revealable: true,
  },
  {
    id: "word-6",
    section: "word",
    role: "priest",
    text: "A reading from the holy Gospel according to N.",
  },
  {
    id: "word-7",
    section: "word",
    role: "assembly",
    text: "Glory to you, O Lord.",
    revealable: true,
  },
  {
    id: "word-8",
    section: "word",
    role: "priest",
    text: "The Gospel of the Lord.",
  },
  {
    id: "word-9",
    section: "word",
    role: "assembly",
    text: "Praise to you, Lord Jesus Christ.",
    revealable: true,
  },
];

export type MassSeasonPreset = "ordinary" | "advent-lent" | "easter";

export function filterPreviewLines(
  lines: MassParticipationLine[],
  season: MassSeasonPreset,
): MassParticipationLine[] {
  if (season !== "advent-lent") return lines;
  return lines.filter((line) => line.skipWhen !== "advent-lent");
}
