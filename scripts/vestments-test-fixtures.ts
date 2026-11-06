/** Independent expected answers from GIRM 346, not derived from the game data. */
export const EXPECTED_VESTMENT_QUIZ = {
  ordinary: { title: "Ordinary Time", colors: ["green"] },
  christmas: { title: "Christmas Season", colors: ["white"] },
  pentecost: { title: "Pentecost", colors: ["red"] },
  "advent-1": { title: "Advent - 1st Sunday", colors: ["purple"] },
  "advent-2": { title: "Advent - 2nd Sunday", colors: ["purple"] },
  "advent-gaudete": { title: "Advent - 3rd Sunday (Gaudete)", colors: ["rose", "purple"] },
  "advent-4": { title: "Advent - 4th Sunday", colors: ["purple"] },
  "lent-1": { title: "Lent - 1st Sunday", colors: ["purple"] },
  "lent-2": { title: "Lent - 2nd Sunday", colors: ["purple"] },
  "lent-3": { title: "Lent - 3rd Sunday", colors: ["purple"] },
  "lent-laetare": { title: "Lent - 4th Sunday (Laetare)", colors: ["rose", "purple"] },
  "lent-5": { title: "Lent - 5th Sunday", colors: ["purple"] },
} as const;

export const EXPECTED_VESTMENT_LABELS = {
  white: "White", red: "Red", purple: "Purple", green: "Green", rose: "Rose (pink)",
} as const;

/** SHA-256 of each visually reviewed garment; changing artwork requires a fresh visual review. */
export const REVIEWED_VESTMENT_HASHES = {
  white: "fd6cdfe4318876ca950174ba0fa0d18e6e9e207c16e702b3547a311b974cb10c",
  red: "414c8c8003d0bba1e3e79253e0cc770c2c7b718caba00e38d6b3b4b4a1bb6a55",
  purple: "5920b0fdae6e1c09f18a8cafd8a3fbf86c3f17c8adc417175315730cd5f58b2d",
  green: "670743f171665ea654e7b9c9fdcd13fd1141246d645c9ada1d3be16cddeb1423",
  rose: "804e6a4f5fb36992afe54b07fcb55c6cdfa1eb807cdb55e22f94cafdcc675820",
} as const;
