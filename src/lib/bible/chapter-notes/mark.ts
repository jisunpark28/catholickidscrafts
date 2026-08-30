import type { ChapterNote, ChapterNoteLocale } from "@/lib/bible/chapter-notes/types";

const MARK_NOTES: Record<number, Record<ChapterNoteLocale, ChapterNote>> = {
  1: {
    en: {
      summary:
        "John the Baptist prepares the way in the desert. Jesus is baptized, tempted, and begins calling disciples and healing in Galilee.",
      words: [
        { term: "baptism", gloss: "Being washed in water as a sign of turning back to God." },
        { term: "Galilee", gloss: "The northern region of Israel where Jesus did much of his teaching." },
      ],
    },
    ko: {
      summary:
        "마르코가 전한 복음이 시작됩니다. 세례 요한이 광야에서 길을 준비하고, 예수님께서 세례를 받으시고 시험을 이기신 뒤, 제자들을 부르시며 갈릴리에서 치유 사역을 시작하십니다.",
      words: [
        { term: "세례", gloss: "하나님께 돌아섬을 표시하는 거룩한 의식입니다." },
        { term: "갈릴리", gloss: "예수님께서 많이 가르치신 이스라엘 북부 지역입니다." },
      ],
    },
  },
  2: {
    en: {
      summary:
        "Jesus heals a paralyzed man, calls Levi, and teaches that he came to heal sinners—not only the healthy.",
      words: [
        { term: "paralyzed", gloss: "Unable to move part of the body." },
        { term: "Pharisees", gloss: "Jewish teachers who watched closely whether people kept God's law." },
      ],
    },
    ko: {
      summary:
        "예수님께서 마비된 사람을 고치시고, 레위를 부르시며, 건강한 사람뿐 아니라 죄인을 부르시러 오셨음을 가르치십니다.",
      words: [
        { term: "마비", gloss: "몸의 일부를 움직일 수 없는 상태입니다." },
        { term: "바리사이인", gloss: "율법 준수를 엄격히 보던 유대인 교사들입니다." },
      ],
    },
  },
  3: {
    en: {
      summary:
        "Jesus heals on the Sabbath, chooses the Twelve apostles, and warns about blaming the Holy Spirit for his good works.",
      words: [
        { term: "Sabbath", gloss: "Saturday, God's holy day of rest for the Jewish people." },
        { term: "apostles", gloss: "The twelve men Jesus sent to spread the Gospel." },
      ],
    },
    ko: {
      summary:
        "예수님께서 안식일에 병자를 고치시고, 열두 사도를 세우시며, 선한 일을 성령 탓으로 돌리지 말라고 경고하십니다.",
      words: [
        { term: "안식일", gloss: "유대인에게 거룩한 쉼의 날인 토요일입니다." },
        { term: "사도", gloss: "복음을 전하도록 보내신 열두 제자입니다." },
      ],
    },
  },
  4: {
    en: {
      summary:
        "Jesus teaches in parables about seeds and soil, then calms a storm on the sea—showing his power over nature.",
      words: [
        { term: "parable", gloss: "A short story that teaches a lesson about God." },
        { term: "disciples", gloss: "Followers who learned from Jesus day by day." },
      ],
    },
    ko: {
      summary:
        "예수님께서 씨와 땅에 대한 비유로 가르치시고, 바다의 폭풍을 잠잠히 하시며 자연에 대한 권능을 보여 주십니다.",
      words: [
        { term: "비유", gloss: "하나님에 대한 교훈을 담은 짧은 이야기입니다." },
        { term: "제자", gloss: "예수님을 따르며 매일 배운 사람들입니다." },
      ],
    },
  },
  5: {
    en: {
      summary:
        "Jesus frees a man possessed by demons, heals a woman who touched his cloak, and raises Jairus's daughter.",
      words: [
        { term: "demons", gloss: "Evil spirits opposed to God." },
        { term: "faith", gloss: "Trusting and relying on Jesus." },
      ],
    },
    ko: {
      summary:
        "예수님께서 귀신 들린 사람을 해방시키시고, 옷자락을 만진 여인을 고치시며, 야이로의 딸을 살리십니다.",
      words: [
        { term: "귀신", gloss: "하나님께 반대하는 악한 영입니다." },
        { term: "믿음", gloss: "예수님을 신뢰하고 의지하는 것입니다." },
      ],
    },
  },
  6: {
    en: {
      summary:
        "Jesus is rejected in Nazareth, sends out the Twelve, feeds five thousand, and walks on water.",
      words: [
        { term: "Nazareth", gloss: "The town where Jesus grew up." },
        { term: "miracle", gloss: "A mighty sign that shows God's power." },
      ],
    },
    ko: {
      summary:
        "예수님께서 나자렛에서 배척당하시고, 열두 제자를 보내시며, 오천 명을 먹이시고 물 위를 걸으십니다.",
      words: [
        { term: "나자렛", gloss: "예수님이 자라신 고향 동네입니다." },
        { term: "기적", gloss: "하나님의 능력을 보여 주는 큰 표징입니다." },
      ],
    },
  },
  7: {
    en: {
      summary:
        "Jesus teaches that true purity comes from the heart, then heals a Gentile woman's daughter and a deaf man.",
      words: [
        { term: "Gentile", gloss: "Someone who is not Jewish." },
        { term: "tradition", gloss: "Customs handed down; Jesus contrasts human rules with God's command." },
      ],
    },
    ko: {
      summary:
        "예수님께서 참된 정결은 마음에서 온다고 가르치시고, 이방 여인의 딸과 귀먹은 사람을 고치십니다.",
      words: [
        { term: "이방인", gloss: "유대인이 아닌 사람을 뜻합니다." },
        { term: "전통", gloss: "내려온 관습; 예수님은 사람의 규칙과 하나님의 계명을 대조하십니다." },
      ],
    },
  },
  8: {
    en: {
      summary:
        "Jesus feeds four thousand, warns against pride, heals a blind man, and asks Peter who people say he is.",
      words: [
        { term: "Messiah", gloss: "God's anointed Savior—the Christ." },
        { term: "cross", gloss: "Jesus foretells he will suffer and die, then rise." },
      ],
    },
    ko: {
      summary:
        "예수님께서 사천 명을 먹이시고 교만을 경고하시며, 맹인을 고치시고 베드로에게 자신이 누구인지 물으십니다.",
      words: [
        { term: "메시아", gloss: "하나님이 기름 부으신 구원자, 그리스도입니다." },
        { term: "십자가", gloss: "예수님께서 고난과 죽음, 그리고 부활을 예고하십니다." },
      ],
    },
  },
  9: {
    en: {
      summary:
        "Jesus is transfigured in glory, heals a boy with an evil spirit, and teaches that the greatest must serve.",
      words: [
        { term: "transfiguration", gloss: "Jesus' face and clothes shone with heavenly glory on the mountain." },
        { term: "service", gloss: "Jesus says real greatness means helping others." },
      ],
    },
    ko: {
      summary:
        "예수님께서 영광 가운데 변모하시고, 귀신 들린 아이를 고치시며, 가장 큰 사람은 섬겨야 한다고 가르치십니다.",
      words: [
        { term: "변모", gloss: "산에서 예수님의 얼굴과 옷이 하늘 영광으로 빛난 사건입니다." },
        { term: "섬김", gloss: "예수님은 참된 위대함은 남을 돕는 것이라고 하십니다." },
      ],
    },
  },
  10: {
    en: {
      summary:
        "Jesus teaches about marriage, welcomes children, challenges a rich man, and foretells his passion again.",
      words: [
        { term: "kingdom of God", gloss: "God's loving rule in our hearts and in the world." },
        { term: "passion", gloss: "Jesus' suffering and death in Jerusalem." },
      ],
    },
    ko: {
      summary:
        "예수님께서 결혼에 대해 가르치시고, 어린이를 품으시며, 부자 청년을 도전하시고, 다시 고난을 예고하십니다.",
      words: [
        { term: "하나님 나라", gloss: "우리 마음과 세상에서 하나님의 사랑의 통치입니다." },
        { term: "수난", gloss: "예루살렘에서 겪으실 예수님의 고통과 죽음입니다." },
      ],
    },
  },
  11: {
    en: {
      summary:
        "Jesus enters Jerusalem on a donkey, clears the Temple, and teaches about prayer and forgiveness.",
      words: [
        { term: "Hosanna", gloss: "A shout of praise: 'Save us, Lord!'" },
        { term: "Temple", gloss: "The holy place in Jerusalem where people worshiped God." },
      ],
    },
    ko: {
      summary:
        "예수님께서 당나귀를 타고 예루살렘에 입성하시고, 성전을 정화하시며, 기도와 용서에 대해 가르치십니다.",
      words: [
        { term: "호산나", gloss: "'주님, 구원하소서!'라는 찬양의 외침입니다." },
        { term: "성전", gloss: "예루살렘에서 하나님께 예배드리던 거룩한 곳입니다." },
      ],
    },
  },
  12: {
    en: {
      summary:
        "Religious leaders question Jesus; he tells parables and teaches the greatest commandment is love.",
      words: [
        { term: "vineyard", gloss: "A grape farm; in parables it often means God's people." },
        { term: "widow's mite", gloss: "A poor widow's small gift showed great trust in God." },
      ],
    },
    ko: {
      summary:
        "종교 지도자들이 예수님을 캐묻고, 예수님께서 비유로 가르치시며 가장 큰 계명은 사랑임을 말씀하십니다.",
      words: [
        { term: "포도원", gloss: "포도 농장; 비유에서 종종 하나님의 백성을 뜻합니다." },
        { term: "과부의 헌금", gloss: "가난한 과부의 작은 헌물이 큰 신뢰를 보여 줍니다." },
      ],
    },
  },
  13: {
    en: {
      summary:
        "Jesus foretells troubles, the destruction of the Temple, and calls disciples to stay watchful and faithful.",
      words: [
        { term: "watch", gloss: "Stay awake spiritually—ready to follow Jesus." },
        { term: "end times", gloss: "Jesus warns of trials before God fully renews the world." },
      ],
    },
    ko: {
      summary:
        "예수님께서 환난과 성전 파괴를 예고하시며, 제자들에게 깨어 믿음을 지키라고 말씀하십니다.",
      words: [
        { term: "깨어 있음", gloss: "영적으로 잠들지 않고 예수님을 따를 준비를 하는 것입니다." },
        { term: "말세", gloss: "하나님께서 세상을 새롭게 하시기 전의 시련을 가리킵니다." },
      ],
    },
  },
  14: {
    en: {
      summary:
        "A woman anoints Jesus; he institutes the Eucharist at the Last Supper, prays in Gethsemane, and is arrested.",
      words: [
        { term: "Eucharist", gloss: "The holy meal of Jesus' Body and Blood at Mass." },
        { term: "Gethsemane", gloss: "The garden where Jesus prayed before his arrest." },
      ],
    },
    ko: {
      summary:
        "한 여인이 예수님께 향유를 부으시고, 최후의 만찬에서 성체성사를 제정하시며, 겟세마니에서 기도하신 뒤 체포되십니다.",
      words: [
        { term: "성체성사", gloss: "미사에서 예수님의 몸과 피를 나누는 거룩한 성사입니다." },
        { term: "겟세마니", gloss: "체포되시기 전 예수님께서 기도하신 동산입니다." },
      ],
    },
  },
  15: {
    en: {
      summary:
        "Jesus is condemned, crucified, and buried. The centurion confesses, 'Truly this man was the Son of God.'",
      words: [
        { term: "crucifixion", gloss: "Death on a cross—the way Jesus saved us." },
        { term: "centurion", gloss: "A Roman army officer who saw Jesus die." },
      ],
    },
    ko: {
      summary:
        "예수님께서 정죄당하시고 십자가에 못 박히신 뒤 묻히십니다. 백부장은 '이분은 참으로 하느님의 아들'이라 고백합니다.",
      words: [
        { term: "십자가형", gloss: "십자가에서 죽으심—우리를 구원하신 방법입니다." },
        { term: "백부장", gloss: "예수님의 임종을 본 로마 군 지휘관입니다." },
      ],
    },
  },
  16: {
    en: {
      summary:
        "Women find the empty tomb; an angel announces Jesus has risen. The Gospel ends with the mission to preach to all nations.",
      words: [
        { term: "Resurrection", gloss: "Jesus rose from the dead—our hope of eternal life." },
        { term: "Go preach", gloss: "Disciples are sent to share the Good News everywhere." },
      ],
    },
    ko: {
      summary:
        "여인들이 빈 무덤을 발견하고, 천사가 예수님의 부활을 알립니다. 마르코가 전한 복음은 모든 민족에게 전하라는 사명으로 끝납니다.",
      words: [
        { term: "부활", gloss: "죽음에서 다시 살아나심—영원한 삶의 우리 희망입니다." },
        { term: "전파", gloss: "제자들은 온 세상에 복음을 전하도록 보내집니다." },
      ],
    },
  },
};

export function getMarkChapterNote(
  chapter: number,
  locale: ChapterNoteLocale,
): ChapterNote | null {
  const row = MARK_NOTES[chapter];
  if (!row) return null;
  return row[locale] ?? row.en ?? null;
}
