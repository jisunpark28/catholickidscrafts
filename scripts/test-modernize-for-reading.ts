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

const luke4Sample = modernizeForReading(
  "And Jesus being full of the Holy Ghost, returned from the Jordan and was led the by the spirit into the desert. And the devil said to him: If thou be the Son of God. And Jesus answered him: is written that Man liveth not by bread alone.",
);
assert(luke4Sample.includes("Holy Spirit"), "Holy Ghost → Holy Spirit");
assert(luke4Sample.includes("led by the Spirit"), "fixes upstream led the by typo");
assert(luke4Sample.includes("It is written"), "fixes upstream missing It");
assert(luke4Sample.includes("If you are"), "If thou be → If you are");
assert(luke4Sample.includes("do not live"), "liveth not → does not live");
assert(!luke4Sample.includes("led the by"), "no led the by typo");

const pronouns = modernizeForReading("Prepare ye the way; thy sins are forgiven thee.");
assert(pronouns.includes("Prepare the way"), "Prepare ye");
assert(pronouns.includes("your sins"), "thy → your");

assert(getCatholicBookName("mark", "ko") === "마르코 복음서", "Korean Catholic name for Mark");
assert(getCatholicBookName("mark", "ko") !== "마가", "never use Protestant 마가");
assert(getCatholicBookName("luke", "ko") === "루카 복음서", "Korean Catholic name for Luke");
assert(getCatholicBookName("exodus", "ko") === "탈출기", "Korean Catholic name for Exodus");
assert(getCatholicBookName("judges", "ko") === "판관기", "Korean Catholic name for Judges");
assert(getCatholicBookName("josue", "ko") === "여호수아기", "CBCK Joshua");
assert(getCatholicBookName("abdias", "ko") === "오바드야서", "CBCK Obadiah");
assert(getCatholicBookName("zacharias", "ko") === "즈카르야서", "CBCK Zechariah");
assert(getCatholicBookName("apocalypse", "ko") === "요한 묵시록", "Korean Catholic name for Revelation");
assert(getCatholicBookName("josue", "en") === "Joshua", "NAB/CBCK English Joshua, not Josue");
assert(getCatholicBookName("1-kings-samuel", "en") === "1 Samuel", "NAB 1 Samuel, not 1 Kings");
assert(getCatholicBookName("3-kings", "en") === "1 Kings", "NAB 1 Kings, not 3 Kings");
assert(getCatholicBookName("1-paralipomenon", "en") === "1 Chronicles", "NAB Chronicles");
assert(getCatholicBookName("tobias", "en") === "Tobit", "NAB Tobit");
assert(getCatholicBookName("ecclesiasticus", "en") === "Sirach", "NAB Sirach");
assert(getCatholicBookName("canticle-of-canticles", "en") === "Song of Songs", "NAB Song of Songs");
assert(getCatholicBookName("apocalypse", "en") === "Revelation", "NAB Revelation, not Apocalypse");
assert(getCatholicBookName("isaias", "en") === "Isaiah", "NAB Isaiah");
assert(catholicGospelLabel("mark", "ko") === "마르코가 전한 복음", "Gospel label KO");
assert((catholicGospelLabel("mark", "es") ?? "").includes("Marcos"), "Gospel label ES");

console.log("test-modernize-for-reading: ok");
