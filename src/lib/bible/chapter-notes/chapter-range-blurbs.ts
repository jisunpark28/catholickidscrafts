import type { PrayerLanguageCode } from "@/lib/prayers/prayer-languages";

/** Story for a chapter range so notes do not reuse one book plot on every chapter. */
type RangeBlurb = {
  from: number;
  to: number;
  en: string;
  ko: string;
};

const RANGES: Partial<Record<string, readonly RangeBlurb[]>> = {
  genesis: [
    { from: 1, to: 2, en: "God creates the heavens and the earth and forms the first human family.", ko: "하느님께서 천지를 창조하시고 첫 인간 가족을 이루십니다." },
    { from: 3, to: 5, en: "Sin enters the world; Cain and Abel follow, then the early generations.", ko: "죄가 세상에 들어오고, 카인과 아벨, 초기 세대가 이어집니다." },
    { from: 6, to: 9, en: "Noah's flood and God's covenant with the earth afterward.", ko: "노아의 홍수와 그 뒤에 땅과 맺으신 하느님의 계약이 나옵니다." },
    { from: 10, to: 11, en: "The nations spread out, and the tower of Babel scatters the people.", ko: "민족들이 퍼지고, 바벨 탑으로 사람들이 흩어집니다." },
    { from: 12, to: 25, en: "God calls Abraham and begins the covenant of promise.", ko: "하느님께서 아브라함을 부르시고 약속의 계약을 시작하십니다." },
    { from: 26, to: 36, en: "Isaac and Jacob live the promise; Jacob becomes Israel.", ko: "이사악과 야곱이 약속을 이어받고, 야곱은 이스라엘이 됩니다." },
    { from: 37, to: 50, en: "Joseph is sold into Egypt, then saves his family in the famine.", ko: "요셉이 이집트에 팔렸다가, 기근 때에 가족을 구합니다." },
  ],
  exodus: [
    { from: 1, to: 2, en: "Israel suffers in Egypt, and Moses is saved as a child.", ko: "이스라엘이 이집트에서 고통받고, 아기 모세가 구출됩니다." },
    { from: 3, to: 4, en: "God calls Moses from the burning bush to free Israel.", ko: "하느님께서 불타는 떨기에서 모세를 부르시어 이스라엘을 해방하게 하십니다." },
    { from: 5, to: 11, en: "Moses confronts Pharaoh, and the plagues strike Egypt.", ko: "모세가 파라오와 맞서고, 재앙이 이집트를 칩니다." },
    { from: 12, to: 15, en: "The Passover night and the crossing of the sea.", ko: "파스카 밤과 바다를 건너는 구원이 이루어집니다." },
    { from: 16, to: 18, en: "God feeds Israel in the desert and teaches them to trust.", ko: "하느님께서 광야에서 이스라엘을 먹이시고 신뢰하도록 가르치십니다." },
    { from: 19, to: 24, en: "At Sinai God gives the Ten Commandments and the covenant.", ko: "시나이에서 하느님께서 십계명과 계약을 주십니다." },
    { from: 25, to: 31, en: "God shows Moses how to build the Dwelling for worship.", ko: "하느님께서 모세에게 예배할 성막을 짓는 법을 보여 주십니다." },
    { from: 32, to: 34, en: "The golden calf, then God renews the covenant in mercy.", ko: "금송아지 사건 뒤, 하느님께서 자비로 계약을 새롭게 하십니다." },
    { from: 35, to: 40, en: "Israel builds the Dwelling, and God's glory fills it.", ko: "이스라엘이 성막을 짓고, 하느님의 영광이 그곳을 채우십니다." },
  ],
  numbers: [
    { from: 1, to: 10, en: "Israel is counted and sets out from Sinai through the desert.", ko: "이스라엘이 인구조사를 하고 시나이를 떠나 광야로 갑니다." },
    { from: 11, to: 21, en: "Complaints, the spies, and hard lessons on the way.", ko: "불평과 정탐꾼 이야기, 길 위의 어려운 교훈이 이어집니다." },
    { from: 22, to: 36, en: "Balaam, new leaders, and preparation to enter the land.", ko: "발람과 새 지도자들, 땅으로 들어가기 위한 준비가 나옵니다." },
  ],
  deuteronomy: [
    { from: 1, to: 4, en: "Moses retells the desert journey and calls Israel to remember.", ko: "모세가 광야 길을 되짚으며 이스라엘에게 기억하라고 권합니다." },
    { from: 5, to: 26, en: "Moses repeats the Law for life in the promised land.", ko: "모세가 약속의 땅에서 살 율법을 다시 선포합니다." },
    { from: 27, to: 34, en: "Blessings and warnings, then Moses dies and Joshua is ready.", ko: "축복과 경고 뒤, 모세가 죽고 여호수아가 준비됩니다." },
  ],
  josue: [
    { from: 1, to: 5, en: "Joshua leads Israel across the Jordan into the land.", ko: "여호수아가 이스라엘을 요르단을 건너 땅으로 인도합니다." },
    { from: 6, to: 12, en: "Jericho falls, and Israel takes the land in stages.", ko: "예리코가 무너지고, 이스라엘이 땅을 단계적으로 차지합니다." },
    { from: 13, to: 24, en: "The tribes receive their share, and Joshua renews the covenant.", ko: "지파들이 몫을 받고, 여호수아가 계약을 새롭게 합니다." },
  ],
  judges: [
    { from: 1, to: 3, en: "Israel fails to finish the conquest, and the first judges rise.", ko: "이스라엘이 정복을 끝내지 못하고, 첫 판관들이 일어납니다." },
    { from: 4, to: 5, en: "Deborah and Barak deliver Israel, and they sing a victory song.", ko: "드보라와 바락이 이스라엘을 구하고 승리의 노래를 부릅니다." },
    { from: 6, to: 8, en: "Gideon trusts God with a small army and defeats Midian.", ko: "기드온이 작은 군대로 하느님을 신뢰하며 미디안을 이깁니다." },
    { from: 9, to: 12, en: "Abimelech's violence and Jephthah's troubled victory follow.", ko: "아비멜렉의 폭력과 입다의 괴로운 승리가 이어집니다." },
    { from: 13, to: 16, en: "Samson is set apart, struggles, and brings down the Philistine temple.", ko: "삼손이 구별되어 싸우다가 필리스티아 신전을 무너뜨립니다." },
    { from: 17, to: 21, en: "Without a king, Israel falls into idolatry and civil war.", ko: "임금이 없어 이스라엘이 우상 숭배와 내전에 빠집니다." },
  ],
  ruth: [
    { from: 1, to: 1, en: "Ruth stays with Naomi and they return from Moab to Bethlehem.", ko: "룻이 나오미를 따르고, 모압에서 베들레헴으로 돌아옵니다." },
    { from: 2, to: 2, en: "Ruth gleans in Boaz's field, and he shows her kindness.", ko: "룻이 보아즈의 밭에서 떨어진 곡식을 줍고, 보아즈가 호의를 베풉니다." },
    { from: 3, to: 4, en: "Boaz marries Ruth; their family line leads to David.", ko: "보아즈가 룻과 결혼하고, 그 가계가 다윗에게로 이어집니다." },
  ],
  "1-kings-samuel": [
    { from: 1, to: 7, en: "Hannah, Samuel, and the Lord's call in Eli's day.", ko: "한나와 사무엘, 엘리 시대에 내리신 주님의 부르심이 나옵니다." },
    { from: 8, to: 15, en: "Israel asks for a king, and Saul rises then falls.", ko: "이스라엘이 임금을 청하고, 사울이 세워졌다가 넘어집니다." },
    { from: 16, to: 31, en: "David is anointed and hunted by Saul until Saul dies.", ko: "다윗이 기름부음받고, 사울이 죽을 때까지 쫓깁니다." },
  ],
  "2-kings-samuel": [
    { from: 1, to: 10, en: "David becomes king and brings the ark to Jerusalem.", ko: "다윗이 임금이 되어 계약의 궤를 예루살렘으로 모십니다." },
    { from: 11, to: 20, en: "David sins, then faces family strife and Absalom's revolt.", ko: "다윗이 죄를 짓고, 집안 분쟁과 압살롬의 반란을 겪습니다." },
    { from: 21, to: 24, en: "Closing stories of David's reign, including census and altar.", ko: "인구조사와 제단 등 다윗 통치의 마지막 이야기입니다." },
  ],
  "3-kings": [
    { from: 1, to: 11, en: "Solomon asks for wisdom and builds the Temple, then turns aside.", ko: "솔로몬이 지혜를 구하고 성전을 지었다가, 나중에 빗나갑니다." },
    { from: 12, to: 16, en: "The kingdom splits into Israel and Judah.", ko: "나라가 이스라엘과 유다로 갈라집니다." },
    { from: 17, to: 22, en: "Elijah confronts Ahab and the prophets of Baal.", ko: "엘리야가 아합과 바알 예언자들과 맞섭니다." },
  ],
  "4-kings": [
    { from: 1, to: 8, en: "Elisha serves as prophet with signs of God's care.", ko: "엘리사가 예언자로 봉사하며 하느님 돌보심의 표징을 행합니다." },
    { from: 9, to: 17, en: "Israel's kings fall, and the northern kingdom goes into exile.", ko: "이스라엘 왕들이 넘어지고, 북왕국이 유배로 갑니다." },
    { from: 18, to: 25, en: "Judah's last kings, the fall of Jerusalem, and exile.", ko: "유다의 마지막 왕들, 예루살렘 함락과 유배가 나옵니다." },
  ],
  "1-paralipomenon": [
    { from: 1, to: 9, en: "Genealogies from Adam through the tribes and those who returned.", ko: "아담부터 지파들과 돌아온 이들까지의 족보가 나옵니다." },
    { from: 10, to: 21, en: "David becomes king, and his reign including the census is told.", ko: "다윗이 임금이 되고, 인구조사를 포함한 통치가 전해집니다." },
    { from: 22, to: 29, en: "David prepares worship and the Temple for Solomon.", ko: "다윗이 솔로몬을 위해 예배와 성전을 준비합니다." },
  ],
  "2-paralipomenon": [
    { from: 1, to: 9, en: "Solomon asks for wisdom and builds the Temple.", ko: "솔로몬이 지혜를 구하고 성전을 짓습니다." },
    { from: 10, to: 36, en: "Judah's kings, the fall of Jerusalem, and hope of return.", ko: "유다 왕들과 예루살렘 함락, 귀환의 희망이 이어집니다." },
  ],
  "1-esdras": [
    { from: 1, to: 6, en: "Exiles return and rebuild the Temple in Jerusalem.", ko: "유배에서 돌아온 이들이 예루살렘 성전을 재건합니다." },
    { from: 7, to: 10, en: "Ezra teaches the Law and calls the people to conversion.", ko: "에즈라가 율법을 가르치고 백성에게 회개를 촉구합니다." },
  ],
  "2-esdras-nehemias": [
    { from: 1, to: 7, en: "Nehemiah rebuilds Jerusalem's walls despite opposition.", ko: "느헤미야가 반대 속에서도 예루살렘 성벽을 재건합니다." },
    { from: 8, to: 13, en: "Ezra reads the Law, and the people renew the covenant.", ko: "에즈라가 율법을 읽고, 백성이 계약을 새롭게 합니다." },
  ],
  esther: [
    { from: 1, to: 2, en: "Queen Vashti is dismissed, and Esther becomes queen.", ko: "와스티 왕비가 물러나고, 에스테르가 왕비가 됩니다." },
    { from: 3, to: 7, en: "Haman plots against the Jews; Esther risks her life and Haman falls.", ko: "하만이 유다인들을 해치려 하자, 에스테르가 목숨을 걸고 하만이 넘어집니다." },
    { from: 8, to: 10, en: "The people are saved, and Purim is kept in memory.", ko: "백성이 구원되고, 푸림이 기념으로 지켜집니다." },
    { from: 11, to: 16, en: "Added prayers and royal letters deepen the same deliverance.", ko: "추가된 기도와 임금의 편지가 같은 구원 이야기를 깊게 합니다." },
  ],
  job: [
    { from: 1, to: 2, en: "Job is tested; he loses much yet will not curse God.", ko: "욥이 시련을 받아 많은 것을 잃어도 하느님을 저주하지 않습니다." },
    { from: 3, to: 37, en: "Job and his friends wrestle with suffering and justice.", ko: "욥과 친구들이 고통과 정의를 놓고 씨름합니다." },
    { from: 38, to: 42, en: "God speaks from the whirlwind, and Job's life is restored.", ko: "하느님께서 폭풍 속에서 말씀하시고, 욥의 삶이 회복됩니다." },
  ],
  daniel: [
    { from: 1, to: 6, en: "Daniel and his friends stay faithful in the Babylonian court.", ko: "다니엘과 친구들이 바빌론 궁정에서도 충실히 살아갑니다." },
    { from: 7, to: 12, en: "Daniel receives visions of kingdoms and God's coming victory.", ko: "다니엘이 나라들과 하느님의 승리에 대한 환시를 받습니다." },
    { from: 13, to: 13, en: "Susanna is falsely accused, then saved when Daniel speaks.", ko: "수산나가 억울한 고발을 당했다가 다니엘의 말로 구출됩니다." },
    { from: 14, to: 14, en: "Daniel exposes the idol Bel and is rescued from the lions.", ko: "다니엘이 우상 벨을 폭로하고 사자 굴에서 구출됩니다." },
  ],
  jonas: [
    { from: 1, to: 2, en: "Jonah flees, the storm comes, and he prays inside the fish.", ko: "요나가 도망치고 폭풍이 일며, 물고기 속에서 기도합니다." },
    { from: 3, to: 4, en: "Nineveh repents, and Jonah learns God's mercy for all nations.", ko: "니네베가 회개하고, 요나는 모든 민족을 향한 하느님 자비를 배웁니다." },
  ],
  "1-machabees": [
    { from: 1, to: 2, en: "Persecution strikes, and Mattathias begins the revolt.", ko: "박해가 닥치고, 마타티야가 항쟁을 시작합니다." },
    { from: 3, to: 9, en: "Judas Maccabeus fights to defend the Temple and the Law.", ko: "유다 마카베오가 성전과 율법을 지키려 싸웁니다." },
    { from: 10, to: 16, en: "Jonathan and Simon lead after Judas, and the people keep the faith.", ko: "유다 이후 요나탄과 시몬이 이끌며 백성이 신앙을 지킵니다." },
  ],
  matthew: [
    { from: 1, to: 1, en: "The genealogy and birth of Jesus, fulfilling the prophets.", ko: "예수님의 족보와 탄생이 예언을 이루며 시작됩니다." },
    { from: 2, to: 2, en: "The Magi, the flight into Egypt, and the return to Nazareth.", ko: "동방 박사, 이집트 피난, 나자렛 귀환이 이어집니다." },
    { from: 3, to: 7, en: "Baptism, the desert, and the Sermon on the Mount.", ko: "세례와 광야, 산상 설교가 이어집니다." },
    { from: 8, to: 13, en: "Healings, the Twelve, and parables of the kingdom.", ko: "치유와 열두 제자, 하늘 나라 비유가 나옵니다." },
    { from: 14, to: 20, en: "Bread in the wilderness, the Church, and the road to Jerusalem.", ko: "광야의 빵, 교회, 예루살렘으로 가는 길이 이어집니다." },
    { from: 21, to: 23, en: "Jesus enters Jerusalem and contends with the Temple leaders.", ko: "예수님께서 예루살렘에 입성하시고 성전 지도자들과 맞서십니다." },
    { from: 24, to: 25, en: "Jesus teaches about the last days and staying watchful.", ko: "예수님께서 종말과 깨어 있음을 가르치십니다." },
    { from: 26, to: 28, en: "The Passion, death, and Resurrection of Jesus.", ko: "예수님의 수난과 죽음, 부활이 선포됩니다." },
  ],
  luke: [
    { from: 1, to: 2, en: "The births of John and Jesus, with Mary's yes and the shepherds.", ko: "요한과 예수님의 탄생, 마리아의 승낙과 목자들이 나옵니다." },
    { from: 3, to: 9, en: "Jesus' baptism, Galilee ministry, and the Twelve.", ko: "예수님의 세례, 갈릴래아 활동, 열두 제자가 이어집니다." },
    { from: 10, to: 19, en: "The journey to Jerusalem, mercy parables, and the lost who are found.", ko: "예루살렘으로 가는 길, 자비의 비유, 잃어버린 이를 찾으심이 나옵니다." },
    { from: 20, to: 24, en: "Teaching in the Temple, the Passion, Emmaus, and the Ascension.", ko: "성전 가르침, 수난, 엠마오, 승천이 이어집니다." },
  ],
  john: [
    { from: 1, to: 1, en: "The Word becomes flesh, and the first disciples follow Jesus.", ko: "말씀이 사람이 되시고, 첫 제자들이 예수님을 따릅니다." },
    { from: 2, to: 4, en: "Cana, Nicodemus, and the Samaritan woman.", ko: "카나, 니코데모, 사마리아 여인이 나옵니다." },
    { from: 5, to: 12, en: "Signs in Jerusalem and Galilee, then Lazarus and Palm Sunday.", ko: "예루살렘과 갈릴래아의 표징, 라자로와 성지 주일이 이어집니다." },
    { from: 13, to: 17, en: "The Last Supper, the washing of feet, and the farewell prayer.", ko: "최후의 만찬, 발 씻김, 고별 기도가 나옵니다." },
    { from: 18, to: 21, en: "The Passion, the empty tomb, and the risen Lord by the sea.", ko: "수난과 빈 무덤, 바다에서 나타나신 부활하신 주님입니다." },
  ],
  acts: [
    { from: 1, to: 1, en: "Jesus ascends, and the apostles wait and choose Matthias.", ko: "예수님께서 승천하시고, 사도들이 기다리며 마티아를 뽑습니다." },
    { from: 2, to: 7, en: "Pentecost, the Church in Jerusalem, and Stephen's witness.", ko: "성령 강림과 예루살렘 교회, 스테파노의 증언이 이어집니다." },
    { from: 8, to: 12, en: "The Gospel reaches Samaria, Saul is called, and Peter visits Cornelius.", ko: "복음이 사마리아에 이르고, 사울이 부르심받으며 베드로가 코르넬리오를 만납니다." },
    { from: 13, to: 28, en: "Paul's missions take the Gospel to the nations, ending in Rome.", ko: "바오로의 선교로 복음이 민족들에게 가고, 로마에서 이야기가 마무리됩니다." },
  ],
  apocalypse: [
    { from: 1, to: 3, en: "John sees the risen Christ and letters to the seven churches.", ko: "요한이 부활하신 그리스도와 일곱 교회에 보내는 편지를 봅니다." },
    { from: 4, to: 11, en: "Heavenly worship, seals, and trumpets unfold God's plan.", ko: "하늘의 예배와 봉인, 나팔로 하느님의 계획이 펼쳐집니다." },
    { from: 12, to: 18, en: "The woman, the beasts, and the fall of Babylon.", ko: "여인과 짐승들, 바빌론의 몰락이 나옵니다." },
    { from: 19, to: 22, en: "Christ's victory, the wedding feast, and the new heaven and earth.", ko: "그리스도의 승리와 혼례 잔치, 새 하늘과 새 땅이 선포됩니다." },
  ],
};

export const CHAPTER_RANGE_BOOK_SLUGS = Object.keys(RANGES);

export function getChapterRangeBlurb(
  bookSlug: string,
  chapter: number,
  locale: PrayerLanguageCode,
): string | undefined {
  const ranges = RANGES[bookSlug];
  if (!ranges) return undefined;
  const match = ranges.find((range) => chapter >= range.from && chapter <= range.to);
  if (!match) return undefined;
  if (locale === "ko") return match.ko;
  if (locale === "en") return match.en;
  return undefined;
}
