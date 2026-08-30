import { modernizeForReading } from "../src/lib/bible/modernize-for-reading";
import {
  catholicGospelLabel,
  getCatholicBookName,
} from "../src/lib/bible/catholic-book-names";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const mark2Sample =
  "And again he entered into Capharnaum after some days. And they came to him, bringing one sick of the palsy, who was carried by four.";

const modernized = modernizeForReading(mark2Sample);

assert(modernized.includes("Capernaum"), "Capharnaum → Capernaum");
assert(modernized.includes("paralyzed"), "sick of the palsy → paralyzed");
assert(!modernized.includes("entered into"), "entered into → entered");

const genesisSample = modernizeForReading("And the Lord said unto Noe: Make thee an ark.");
assert(genesisSample.includes("you"), "unto/thee modernized in all books");

const pronouns = modernizeForReading("Prepare ye the way; thy sins are forgiven thee.");
assert(pronouns.includes("Prepare the way"), "Prepare ye");
assert(pronouns.includes("your sins"), "thy → your");

assert(getCatholicBookName("mark", "ko") === "마르코", "Korean Catholic name for Mark");
assert(getCatholicBookName("mark", "ko") !== "마가", "never use Protestant 마가");
assert(catholicGospelLabel("mark", "ko") === "마르코가 전한 복음", "Gospel label KO");
assert(catholicGospelLabel("mark", "es")?.includes("Marcos"), "Gospel label ES");

console.log("test-modernize-for-reading: ok");
