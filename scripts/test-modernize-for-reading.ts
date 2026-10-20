import { modernizeForReading, modernizeVerse } from "../src/lib/bible/modernize-for-reading";
import {
  catholicGospelLabel,
  getCatholicBookName,
} from "../src/lib/bible/catholic-book-names";
import { catholicEnglishCitation } from "../src/lib/bible/latinprayer";

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
assert(luke4Sample.includes("Man does not live"), "liveth not → does not live");
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
assert(catholicEnglishCitation("josue", "Josue 1 (Douay-Rheims)", "Josue") === "Joshua 1 (Douay-Rheims)", "citation Josue → Joshua");
assert(catholicEnglishCitation("apocalypse", "Apocalypse 1 (Douay-Rheims)", "Apocalypse") === "Revelation 1 (Douay-Rheims)", "citation Apocalypse → Revelation");
assert(catholicGospelLabel("mark", "ko") === "마르코가 전한 복음", "Gospel label KO");
assert((catholicGospelLabel("mark", "es") ?? "").includes("Marcos"), "Gospel label ES");

console.log("test-modernize-for-reading: ok");

// --- v4 regression tests (Douay-Rheims fidelity + grammar) ---
function eq(actual: string, expected: string, label: string) {
  assert(actual === expected, `${label}\n  expected: ${expected}\n  actual:   ${actual}`);
}
eq(modernizeForReading("And saying: Do penance: for the kingdom of heaven is at hand."),
  "And saying: Do penance: for the kingdom of heaven is at hand.", "keeps 'Do penance' (Mt 3:2)");
eq(modernizeForReading("And the angel being come in, said unto her: Hail, full of grace, the Lord is with thee: blessed art thou among women."),
  "And the angel being come in, said to her: Hail, full of grace, the Lord is with you: blessed are you among women.", "Hail Mary wording (Lk 1:28)");
eq(modernizeForReading("Thou shalt not kill."), "You shall not kill.", "commandments use 'you shall' (Ex 20:13)");
eq(modernizeForReading("Neither shalt thou swear by thy head, because thou canst not make one hair white or black."),
  "Neither shall you swear by your head, because you cannot make one hair white or black.", "Mt 5:36");
eq(modernizeForReading("And Moses was a very great man in the land of Egypt"), "And Moses was a very great man in the land of Egypt", "no 'very large' (Ex 11:3)");
eq(modernizeForReading("Thine is the day, and thine is the night"), "Yours is the day, and yours is the night", "thine -> yours (Ps 73:16)");
assert(modernizeForReading("the shepherds said one to another: Let us go").includes("said to one another"), "one to another (Lk 2:15)");
assert(!modernizeForReading("And it came to pass, that Cain offered").includes("then"), "it came to pass (Gn 4:3)");
eq(modernizeVerse("luke", 1, 43, "And whence is this to me that the mother of my Lord should come to me?"),
  "And how is it that the mother of my Lord should come to me?", "Lk 1:43 override");
eq(modernizeForReading("And Philip said: If thou believest with all thy heart, thou mayest."),
  "And Philip said: If you believe with all your heart, you may.", "no substring hit 'If thou be'+lievest (Acts 8:37)");
assert(modernizeForReading("Jesus said to him: Knowest thou not that I have power?").includes("Do you not know"), "question inversion");
assert(modernizeForReading("Begone, Satan: for it is written: The Lord thy God shalt thou adore").includes("adore"), "keeps adore (Mt 4:10)");
assert(modernizeForReading("Charity never falleth away").includes("Charity never falls away"), "keeps charity (1 Cor 13:8)");
assert(modernizeForReading("And taking the chalice, he gave thanks").includes("chalice"), "keeps chalice");
assert(modernizeForReading("And God said: Let there be a firmament made amidst the waters").includes("firmament"), "keeps firmament (Gn 1:6)");
assert(modernizeForReading("Our Father who art in heaven, hallowed be thy name.") === "Our Father who art in heaven, hallowed be your name.", "Lord's Prayer keeps 'who art'");
assert(modernizeForReading("Beareth all things, believeth all things, hopeth all things, endureth all things.") === "Bears all things, believes all things, hopes all things, endures all things.", "all -eth forms (1 Cor 13:7)");
assert(modernizeForReading("For the servant knoweth not what his lord doth.") === "For the servant does not know what his lord does.", "-eth not");
console.log("test-modernize-for-reading v4: ok");

// --- v5 Gospel polish regression checks (Mark) ---
assert(modernizeVerse("mark", 1, 15, "x").includes("Repent and believe the gospel"), "Mk 1:15");
assert(modernizeVerse("mark", 6, 12, "x") === "And they went out and preached that people should do penance.", "Mk 6:12 keeps penance");
assert(modernizeVerse("mark", 14, 23, "x").includes("chalice"), "Mk 14:23 keeps chalice");
assert(modernizeVerse("mark", 16, 16, "x").startsWith("Whoever believes and is baptized"), "Mk 16:16 'he that believes' -> whoever");
assert(modernizeVerse("mark", 3, 32, "x").includes("your brethren"), "Mk 3:32 keeps 'brethren' for Jesus' relatives");
assert(modernizeVerse("mark", 10, 29, "x").includes("brothers or sisters"), "Mk 10:29 brethren -> brothers");
assert(modernizeVerse("mark", 15, 19, "x").includes("adored him"), "Mk 15:19 keeps adore");
console.log("test-modernize-for-reading v5: ok");

// --- v5 Gospel polish regression checks (Matthew) ---
assert(modernizeVerse("matthew", 1, 25, "x").startsWith("And he knew her not until she brought forth her firstborn son"), "Mt 1:25 Douay-faithful");
assert(modernizeVerse("matthew", 3, 2, "And saying: Do penance: for the kingdom of heaven is at hand.").includes("Do penance"), "Mt 3:2 Do penance");
assert(modernizeVerse("matthew", 4, 17, "From that time Jesus began to preach, and to say: Do penance, for the kingdom of heaven is at hand.").includes("Do penance"), "Mt 4:17 Do penance");
assert(modernizeVerse("matthew", 6, 11, "Give us this day our supersubstantial bread.") === "Give us this day our supersubstantial bread.", "Mt 6:11 supersubstantial");
assert(modernizeVerse("matthew", 16, 18, "And I say to thee: That thou art Peter; and upon this rock I will build my church, and the gates of hell shall not prevail against it.").includes("upon this rock I will build my church"), "Mt 16:18");
assert(modernizeVerse("matthew", 16, 19, "x").includes("keys of the kingdom of heaven"), "Mt 16:19 keys");
assert(modernizeVerse("matthew", 26, 26, "x").includes("This is my body"), "Mt 26:26");
assert(modernizeVerse("matthew", 26, 28, "x").includes("this is my blood of the new testament"), "Mt 26:28");
assert(modernizeVerse("matthew", 12, 46, "x").includes("his brethren"), "Mt 12:46 brethren (relatives)");
assert(modernizeVerse("matthew", 23, 8, "x").includes("you are all brothers"), "Mt 23:8 brothers");
console.log("test-modernize-for-reading v5 matthew: ok");

// --- v5 Gospel polish regression checks (Luke) ---
const lk = (c: number, v: number, t = "x") => modernizeVerse("luke", c, v, t);
assert(lk(1, 28, "And the angel being come in, said unto her: Hail, full of grace, the Lord is with thee: blessed art thou among women.").includes("Hail, full of grace, the Lord is with you: blessed are you among women"), "Lk 1:28 Hail full of grace");
assert(lk(1, 34).includes("I know not man"), "Lk 1:34");
assert(lk(2, 7).includes("her firstborn son"), "Lk 2:7 firstborn");
assert(lk(8, 19).includes("his mother and brethren"), "Lk 8:19 brethren (relatives)");
assert(lk(13, 3).includes("do penance"), "Lk 13:3 penance");
assert(lk(15, 7).includes("one sinner who does penance"), "Lk 15:7 penance");
assert(lk(22, 19).includes("This is my body, which is given for you. Do this for a commemoration of me."), "Lk 22:19");
assert(lk(22, 20).includes("This is the chalice, the new testament in my blood"), "Lk 22:20 chalice");
assert(lk(24, 35).includes("in the breaking of bread"), "Lk 24:35");
assert(lk(22, 32).includes("strengthen your brothers"), "Lk 22:32 brothers");
console.log("test-modernize-for-reading v5 luke: ok");

// --- v5 Gospel polish regression checks (John + Luke 10:37) ---
const jn = (c: number, v: number, t = "x") => modernizeVerse("john", c, v, t);
assert(jn(1, 1, "In the beginning was the Word: and the Word was with God: and the Word was God.") === "In the beginning was the Word: and the Word was with God: and the Word was God.", "Jn 1:1");
assert(jn(1, 14, "And the Word was made flesh and dwelt among us (and we saw his glory, the glory as it were of the only begotten of the Father), full of grace and truth.").includes("the Word was made flesh"), "Jn 1:14");
assert(jn(2, 4).includes("Woman, what is that to me and to you?"), "Jn 2:4 Cana");
assert(jn(3, 5, "Jesus answered: Amen, amen, I say to thee, unless a man be born again of water and the Holy Ghost, he cannot enter into the kingdom of God.").includes("of water and the Holy Spirit"), "Jn 3:5");
assert(jn(6, 54).includes("unless you eat the flesh of the Son of man and drink his blood"), "Jn 6:54");
assert(jn(7, 3).includes("his brethren"), "Jn 7:3 brethren (relatives)");
assert(jn(19, 26).includes("Woman, behold your son"), "Jn 19:26");
assert(jn(19, 27).includes("Behold your mother"), "Jn 19:27");
assert(jn(20, 22).includes("Receive the Holy Spirit"), "Jn 20:22");
assert(jn(20, 23, "Whose sins you shall forgive, they are forgiven them: and whose sins you shall retain, they are retained.").includes("Whose sins you shall forgive, they are forgiven them"), "Jn 20:23");
assert(jn(20, 28, "Thomas answered and said to him: My Lord and my God.").includes("My Lord and my God"), "Jn 20:28");
assert(jn(21, 15).includes("Feed my lambs") && jn(21, 17, "He said to him: Feed my sheep.").includes("Feed my sheep"), "Jn 21:15-17");
assert(jn(20, 17).includes("go to my brothers"), "Jn 20:17 brothers (disciples)");
assert(modernizeVerse("luke", 10, 37, "x").includes("The one who showed mercy to him") && modernizeVerse("luke", 10, 37, "x").includes("do the same"), "Lk 10:37 shared override");
console.log("test-modernize-for-reading v5 john: ok");

assert(modernizeVerse("john", 6, 56, "For my flesh is meat indeed: and my blood is drink indeed.") === "For my flesh is food indeed: and my blood is drink indeed.", "Jn 6:56 food indeed");
console.log("test-modernize-for-reading v5 john 6:56: ok");
