#!/usr/bin/env node
/**
 * Generates book-specific blurbs (EN + KO for all 73 books).
 * Other locales use category blurbs from category-blurbs.ts.
 */
import fs from "node:fs";

const SLUGS = [
  "genesis", "exodus", "leviticus", "numbers", "deuteronomy", "josue", "judges", "ruth",
  "1-kings-samuel", "2-kings-samuel", "3-kings", "4-kings", "1-paralipomenon", "2-paralipomenon",
  "1-esdras", "2-esdras-nehemias", "tobias", "judith", "esther", "job", "psalms", "proverbs",
  "ecclesiastes", "canticle-of-canticles", "wisdom", "ecclesiasticus", "isaias", "jeremias",
  "lamentations", "baruch", "ezechiel", "daniel", "osee", "joel", "amos", "abdias", "jonas",
  "micheas", "nahum", "habacuc", "sophonias", "aggeus", "zacharias", "malachias",
  "1-machabees", "2-machabees", "matthew", "mark", "luke", "john", "acts", "romans",
  "1-corinthians", "2-corinthians", "galatians", "ephesians", "philippians", "colossians",
  "1-thessalonians", "2-thessalonians", "1-timothy", "2-timothy", "titus", "philemon",
  "hebrews", "james", "1-peter", "2-peter", "1-john", "2-john", "3-john", "jude", "apocalypse",
];

const EN = {
  genesis: "God creates the heavens and the earth and begins his covenant with Abraham.",
  exodus: "God frees Israel from Egypt and gives the Ten Commandments at Sinai.",
  leviticus: "God teaches Israel how to worship and live as his holy people.",
  numbers: "Israel journeys through the desert toward the promised land.",
  deuteronomy: "Moses renews the Law and blesses Israel before they enter the land.",
  josue: "Joshua leads Israel into the promised land.",
  judges: "Judges deliver Israel when the people turn back to God.",
  ruth: "Ruth's faithful love leads her into the family of David.",
  "1-kings-samuel": "Samuel anoints Saul and David as kings of Israel.",
  "2-kings-samuel": "David becomes king and prepares a kingdom for God.",
  "3-kings": "Solomon builds the Temple; later kings struggle with idolatry.",
  "4-kings": "Israel and Judah face prophets, exile, and God's mercy.",
  "1-paralipomenon": "Genealogies and David's reign in worship and prayer.",
  "2-paralipomenon": "Solomon's Temple and the faith of Judah's kings.",
  "1-esdras": "Exiles return and rebuild the Temple in Jerusalem.",
  "2-esdras-nehemias": "Nehemiah rebuilds Jerusalem's walls and renews the covenant.",
  tobias: "Tobit and Tobias show faith, family love, and God's guidance.",
  judith: "Judith saves her people through courage and trust in God.",
  esther: "Esther risks her life to save the Jewish people.",
  job: "Job wrestles with suffering and meets God's wisdom.",
  psalms: "Prayers and songs of praise, lament, and trust in God.",
  proverbs: "Practical wisdom for living with fear of the Lord.",
  ecclesiastes: "Reflection on life's meaning under God's sovereignty.",
  "canticle-of-canticles": "A song of married love that images God's love.",
  wisdom: "Wisdom leads to life and friendship with God.",
  ecclesiasticus: "Sirach teaches wisdom for family, worship, and daily life.",
  isaias: "Isaiah proclaims the Messiah and the hope of a new creation.",
  jeremias: "Jeremiah calls for repentance and promises a new covenant.",
  lamentations: "Poems mourning Jerusalem with hope in God's mercy.",
  baruch: "Prayers of exiles trusting God's justice and mercy.",
  ezechiel: "Ezekiel sees God's glory and promises a new heart for Israel.",
  daniel: "Daniel remains faithful in exile; God rules all kingdoms.",
  osee: "Hosea shows God's faithful love for an unfaithful people.",
  joel: "Joel calls for repentance and promises the Spirit's outpouring.",
  amos: "Amos demands justice for the poor and true worship.",
  abdias: "Obadiah announces judgment and hope for God's people.",
  jonas: "Jonah learns that God's mercy reaches all nations.",
  micheas: "Micah foretells Bethlehem and calls for justice and mercy.",
  nahum: "Nahum announces the fall of cruel Nineveh.",
  habacuc: "Habakkuk learns to live by faith while awaiting God's justice.",
  sophonias: "Zephaniah warns of judgment and promises a humble remnant.",
  aggeus: "Haggai urges the people to rebuild the Temple.",
  zacharias: "Zechariah encourages the returned exiles and foretells the Messiah.",
  malachias: "Malachi calls Israel to sincere worship before the Lord comes.",
  "1-machabees": "The Maccabees defend the Temple and Jewish faith.",
  "2-machabees": "Martyrs witness to resurrection hope and Temple purity.",
  matthew: "Matthew presents Jesus as the fulfillment of the Law and prophets.",
  mark: "Mark shows Jesus as the powerful Son of God who serves and saves.",
  luke: "Luke emphasizes mercy, prayer, and joy in Christ's salvation.",
  john: "John proclaims Jesus as the eternal Word made flesh.",
  acts: "The Holy Spirit empowers the apostles to spread the Gospel.",
  romans: "Paul explains justification by faith and life in the Spirit.",
  "1-corinthians": "Paul teaches unity, love, and worthy Eucharistic worship.",
  "2-corinthians": "Paul defends his ministry and God's power in weakness.",
  galatians: "Paul proclaims freedom in Christ against false gospel.",
  ephesians: "Paul describes the Church as Christ's body and calls for unity.",
  philippians: "Paul rejoices in Christ from prison and urges humble love.",
  colossians: "Christ is supreme; believers are called to holy living.",
  "1-thessalonians": "Paul encourages hope in Christ's return and holy living.",
  "2-thessalonians": "Paul corrects confusion about the Lord's coming.",
  "1-timothy": "Paul guides Timothy in leading the Church faithfully.",
  "2-timothy": "Paul charges Timothy to preach the word with courage.",
  titus: "Paul instructs Titus to appoint leaders and teach sound doctrine.",
  philemon: "Paul appeals for the Christian reconciliation of Onesimus.",
  hebrews: "Jesus is the perfect high priest of the new covenant.",
  james: "Faith must show itself in works of mercy and self-control.",
  "1-peter": "Peter encourages suffering Christians to hope in Christ.",
  "2-peter": "Peter warns against false teachers and affirms Christ's return.",
  "1-john": "John teaches that God is love and calls believers to fellowship.",
  "2-john": "John urges truth and love in the Christian community.",
  "3-john": "John praises hospitality and faithful leadership in the Church.",
  jude: "Jude exhorts believers to contend for the faith once delivered.",
  apocalypse: "John sees Christ's victory and the wedding feast of the Lamb.",
};

const KO = {
  genesis: "하나님께서 천지를 창조하시고 아브라함과 언약을 시작하십니다.",
  exodus: "하나님께서 이스라엘을 이집트에서 해방하시고 시나이에서 십계명을 주십니다.",
  leviticus: "이스라엘이 거룩한 백성으로 예배하고 살 길을 배웁니다.",
  numbers: "이스라엘이 광야를 지나 약속의 땅을 향해 갑니다.",
  deuteronomy: "모세가 율법을 다시 선포하고 백성을 축복합니다.",
  josue: "여호수아가 이스라엘을 약속의 땅으로 인도합니다.",
  judges: "판관들이 백성이 돌아올 때 이스라엘을 구원합니다.",
  ruth: "룻의 충실한 사랑이 다윗 가문으로 이어집니다.",
  "1-kings-samuel": "사무엘은 사울과 다윗에게 기름을 부어 왕으로 세웁니다.",
  "2-kings-samuel": "다윗이 왕이 되어 하느님 나라를 준비합니다.",
  "3-kings": "솔로몬이 성전을 짓고, 이후 왕들은 우상 숭배와 씨름합니다.",
  "4-kings": "이스라엘과 유다는 예언자, 유배, 자비를 맞닥뜨립니다.",
  "1-paralipomenon": "족보와 다윗 왕의 예배와 기도가 기록됩니다.",
  "2-paralipomenon": "솔로몬의 성전과 유다 왕들의 신앙이 다뤄집니다.",
  "1-esdras": "포로 귀환자들이 예루살렘 성전을 재건합니다.",
  "2-esdras-nehemias": "느헤미야가 성벽을 재건하고 언약을 새롭게 합니다.",
  tobias: "토빗과 토비아는 믿음과 가족 사랑으로 하느님의 인도를 경험합니다.",
  judith: "유딧은 용기와 신뢰로 백성을 구합니다.",
  esther: "에스테르는 민족을 구하기 위해 목숨을 걸습니다.",
  job: "욥은 고난 속에서 하느님의 지혜를 만납니다.",
  psalms: "찬양과 탄원, 신뢰의 기도와 노래 모음입니다.",
  proverbs: "주를 경외하며 사는 실천적 지혜를 가르칩니다.",
  ecclesiastes: "하느님 주권 아래 인생의 의미를 묻습니다.",
  "canticle-of-canticles": "결혼 사랑의 노래로 하느님 사랑을 비춥니다.",
  wisdom: "지혜는 생명과 하느님과의 우정으로 이끕니다.",
  ecclesiasticus: "집회서는 가정, 예배, 일상의 지혜를 가르칩니다.",
  isaias: "이사야는 메시아와 새 창조의 희망을 선포합니다.",
  jeremias: "예레미야는 회개를 촉구하고 새 언약을 약속합니다.",
  lamentations: "예루살렘의 애가와 자비에 대한 희망을 노래합니다.",
  baruch: "바룩은 유배 중 기도와 정의를 신뢰합니다.",
  ezechiel: "에제키엘은 하느님 영광과 새 마음을 약속합니다.",
  daniel: "다니엘은 유배 중에도 충실하며 하느님께서 역사를 다스리심을 보여 줍니다.",
  osee: "호세아는 불충실한 백성에게 하느님의 신실한 사랑을 보여 줍니다.",
  joel: "요엘은 회개를 촉구하고 성령 부어 주심을 약속합니다.",
  amos: "아모스는 가난한 이를 위한 정의와 참된 예배를 요구합니다.",
  abdias: "오바디야는 심판과 하느님 백성의 희망을 선포합니다.",
  jonas: "요나는 하느님 자비가 모든 민족에게 미침을 배웁니다.",
  micheas: "미카는 베들레헴과 정의·자비를 예고합니다.",
  nahum: "나훔은 잔혹한 니니웨의 멸망을 선포합니다.",
  habacuc: "하바쿡은 믿음으로 살며 정의를 기다립니다.",
  sophonias: "스바니야는 심판과 겸손한 남은 자를 약속합니다.",
  aggeus: "하까이는 성전 재건을 촉구합니다.",
  zacharias: "즈카리야는 귀환 백성을 격려하고 메시아를 예고합니다.",
  malachias: "말라키는 주 오심 전 진실한 예배를 촉구합니다.",
  "1-machabees": "마카베오 가문이 성전과 신앙을 지킵니다.",
  "2-machabees": "순교자들이 부활 희망과 성전 정결을 증언합니다.",
  matthew: "마태오는 예수님을 율법과 예언의 완성으로 보여 줍니다.",
  mark: "마르코는 섬기시며 구원하시는 하느님의 아들을 보여 줍니다.",
  luke: "루카는 자비, 기도, 구원의 기쁨을 강조합니다.",
  john: "요한은 영원한 말씀이신 예수님을 선포합니다.",
  acts: "성령께서 사도들을 통해 복음을 퍼뜨리십니다.",
  romans: "바오로는 믿음으로 의롭게 됨과 성령 안의 삶을 설명합니다.",
  "1-corinthians": "바오로는 일치, 사랑, 거룩한 성체 예배를 가르칩니다.",
  "2-corinthians": "바오로는 약함 속 하느님 권능을 증언합니다.",
  galatians: "바오로는 그리스도 안의 자유를 선포합니다.",
  ephesians: "교회는 그리스도의 몸이며 일치가 요청됩니다.",
  philippians: "바오로는 감옥에서도 그리스도 안에서 기뻐합니다.",
  colossians: "그리스도는 최고이시며 거룩한 삶이 요청됩니다.",
  "1-thessalonians": "주님 재림의 희망과 거룩한 삶을 격려합니다.",
  "2-thessalonians": "주님 오심에 대한 오해를 바로잡습니다.",
  "1-timothy": "바오로는 티모테오에게 충실한 지도를 권합니다.",
  "2-timothy": "바오로는 말씀을 담대히 전하라고 명합니다.",
  titus: "바오로는 티토에게 지도자와 바른 교리를 가르칩니다.",
  philemon: "바오로는 오네시모의 화해를 간청합니다.",
  hebrews: "예수님은 새 언약의 완전한 대제사장이십니다.",
  james: "믿음은 자비와 절제의 행동으로 드러나야 합니다.",
  "1-peter": "베드로는 고난 중 희망을 격려합니다.",
  "2-peter": "베드로는 거짓 교사를 경고하고 주님 오심을 확신합니다.",
  "1-john": "요한은 하느님이 사랑이심을 가르칩니다.",
  "2-john": "요한은 진리와 사랑을 권합니다.",
  "3-john": "요한은 환대와 충실한 지도를 칭찬합니다.",
  jude: "유다는 전해진 신앙을 지키라고 권합니다.",
  apocalypse: "요한은 그리스도의 승리와 어린 양의 혼례 잔치를 봅니다.",
};

// Romance/Germanic/Slavic/Vietnamese/Tagalog — book-specific blurbs (Catholic tone).
const ES = {
  genesis: "Dios crea el cielo y la tierra e inicia su alianza con Abraham.",
  exodus: "Dios libera a Israel de Egipto y entrega los Diez Mandamientos.",
  matthew: "Mateo presenta a Jesús como cumplimiento de la Ley y los profetas.",
  mark: "Marcos muestra a Jesús, Hijo de Dios, que sirve y salva.",
  luke: "Lucas destaca la misericordia, la oración y la alegría de la salvación.",
  john: "Juan proclama a Jesús como el Verbo eterno hecho carne.",
  acts: "El Espíritu Santo impulsa a los apóstoles a predicar el Evangelio.",
  romans: "Pablo explica la justificación por la fe y la vida en el Espíritu.",
  apocalypse: "Juan contempla la victoria de Cristo y la boda del Cordero.",
  psalms: "Oraciones y cantos de alabanza, lamento y confianza en Dios.",
};

const FR = {
  genesis: "Dieu crée les cieux et la terre et commence son alliance avec Abraham.",
  exodus: "Dieu libère Israël d'Égypte et donne les Dix Commandements.",
  matthew: "Matthieu présente Jésus comme l'accomplissement de la Loi et des prophètes.",
  mark: "Marc montre Jésus, Fils de Dieu, qui sert et sauve.",
  luke: "Luc met en avant la miséricorde, la prière et la joie du salut.",
  john: "Jean proclame Jésus comme le Verbe éternel fait chair.",
  acts: "L'Esprit Saint pousse les apôtres à répandre l'Évangile.",
  romans: "Paul explique la justification par la foi et la vie dans l'Esprit.",
  apocalypse: "Jean voit la victoire du Christ et les noces de l'Agneau.",
  psalms: "Prières et cantiques de louange, de lamentation et de confiance.",
};

const PT = { ...ES };
const IT = {
  genesis: "Dio crea il cielo e la terra e inizia l'alleanza con Abramo.",
  mark: "Marco mostra Gesù, Figlio di Dio, che serve e salva.",
  matthew: "Matteo presenta Gesù come adempimento della Legge e dei profeti.",
  john: "Giovanni proclama Gesù come Verbo eterno fatto carne.",
  apocalypse: "Giovanni vede la vittoria di Cristo e le nozze dell'Agnello.",
};
const DE = {
  genesis: "Gott schafft Himmel und Erde und beginnt seinen Bund mit Abraham.",
  mark: "Markus zeigt Jesus, den dienenden und rettenden Gottessohn.",
  matthew: "Matthäus zeigt Jesus als Erfüllung von Gesetz und Propheten.",
  john: "Johannes verkündet Jesus als das ewige Wort im Fleisch.",
  apocalypse: "Johannes sieht Christi Sieg und das Hochzeitsmahl des Lammes.",
};
const PL = {
  genesis: "Bóg stwarza niebo i ziemię i rozpoczyna przymierze z Abrahamem.",
  mark: "Marek ukazuje Jezusa, Syna Bożego, który służy i zbawia.",
  matthew: "Mateusz ukazuje Jezusa jako wypełnienie Prawa i proroków.",
  apocalypse: "Jan widzi zwycięstwo Chrystusa i ucztę Baranka.",
};
const VI = {
  genesis: "Chúa tạo trời đất và bắt đầu giao ước với Abraham.",
  mark: "Mác trình bày Chúa Giêsu, Con Thiên Chúa, phục vụ và cứu độ.",
  matthew: "Matthêô trình bày Chúa Giêsu là sự hoàn thành Luật và các tiên tri.",
  apocalypse: "Gioan thấy chiến thắng của Chúa Kitô và lễ cưới Chiên Con.",
};
const TL = {
  genesis: "Nilikha ng Diyos ang langit at lupa at sinimulan ang tipan kay Abraham.",
  mark: "Ipinapakita ni Marcos si Jesus, Anak ng Diyos, na naglilingkod at nagligtas.",
  matthew: "Ipinapakita ni Mateo si Jesus bilang katuparan ng Kautusan at mga propeta.",
  apocalypse: "Nakita ni Juan ang tagumpay ni Kristo at ang piging ng Kordero.",
};

const LOCALES = { en: EN, ko: KO, es: ES, fr: FR, pt: PT, it: IT, de: DE, pl: PL, vi: VI, tl: TL };

const out = `import type { PrayerLanguageCode } from "@/lib/prayers/prayer-languages";

/** Optional book-specific blurbs; category blurbs fill gaps. */
const BOOK_BLURBS: Partial<
  Record<string, Partial<Record<PrayerLanguageCode, string>>>
> = ${JSON.stringify(
  Object.fromEntries(
    SLUGS.map((slug) => [
      slug,
      Object.fromEntries(
        Object.entries(LOCALES)
          .map(([locale, table]) => [locale, table[slug] ?? EN[slug]])
          .filter(([, v]) => Boolean(v)),
      ),
    ]),
  ),
  null,
  2,
)};

export function getBookSpecificBlurb(
  bookSlug: string,
  locale: PrayerLanguageCode,
): string | undefined {
  return BOOK_BLURBS[bookSlug]?.[locale];
}
`;

fs.writeFileSync("src/lib/bible/chapter-notes/book-blurbs.ts", out);
console.log("wrote book-blurbs.ts");
