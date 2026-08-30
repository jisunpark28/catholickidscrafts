import { modernizeForReading } from "../src/lib/bible/modernize-for-reading";
import {
  catholicGospelLabelKo,
  getCatholicBookName,
} from "../src/lib/bible/catholic-book-names";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const mark2Sample =
  "And again he entered into Capharnaum after some days. And they came to him, bringing one sick of the palsy, who was carried by four.";

const modernized = modernizeForReading(mark2Sample, { bookSlug: "mark" });

assert(modernized.includes("Capernaum"), "Capharnaum → Capernaum");
assert(modernized.includes("paralyzed"), "sick of the palsy → paralyzed");
assert(!modernized.includes("entered into"), "entered into → entered");
assert(!modernized.includes("Capharnaum"), "no leftover Capharnaum");

const mark16End = modernizeForReading(
  "Therefore the Son of man is Lord of the sabbath also.",
  { bookSlug: "mark" },
);
assert(
  mark16End === "Therefore the Son of man is Lord of the sabbath also.",
  "unchanged when no rules apply",
);

const johnSample = modernizeForReading(mark2Sample, { bookSlug: "john" });
assert(johnSample === mark2Sample, "non-pilot books unchanged");

const pronouns = modernizeForReading("Prepare ye the way; thy sins are forgiven thee.", {
  bookSlug: "mark",
});
assert(pronouns.includes("Prepare the way"), "Prepare ye");
assert(pronouns.includes("your sins"), "thy → your");
assert(pronouns.includes("forgiven you"), "thee → you");

assert(getCatholicBookName("mark", "ko") === "마르코", "Korean Catholic name for Mark");
assert(getCatholicBookName("mark", "ko") !== "마가", "never use Protestant 마가");
assert(catholicGospelLabelKo("mark") === "마르코가 전한 복음", "Gospel label");

console.log("test-modernize-for-reading: ok");
