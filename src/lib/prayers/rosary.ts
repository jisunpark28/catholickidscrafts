/**
 * Interactive Rosary data. Prayer texts are copied word for word from the
 * approved Rosary PDF (English column); keep them verbatim.
 */

export type RosaryMode = "mini" | "standard" | "full";
export type MysterySet = "joyful" | "luminous" | "sorrowful" | "glorious";
export type PrayerKey = "soc" | "creed" | "of" | "hm" | "gb" | "fat" | "hhq";
export type StepKey = PrayerKey | "ann";

export type Prayer = { t: string; all?: string; lead?: string; resp?: string; kid: string };
/** [name, icon (unused), caption, meaning, talk question] */
export type Mystery = [string, string, string, string, string];
export type MysteryInfo = { short: string; name: string; emoji: string; when: string; list: Mystery[] };

export type RosaryStep = { k: StepKey; d: number; b?: number; intro?: 1 };

export const PRAYERS: Record<PrayerKey, Prayer> = {
 soc:{t:"Sign of the Cross",all:"In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
   kid:"We trace a cross on ourselves to say: I belong to God."},
 creed:{t:"Apostles’ Creed",all:"I believe in God, the Father Almighty, Creator of Heaven and earth; and in Jesus Christ, His only Son, Our Lord, Who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. He descended into Hell, on the third day He arose again from the dead. He ascended into Heaven, and is seated at the right hand of God the Father Almighty; from thence He shall come to judge the living and the dead. I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and the life everlasting. Amen.",
   kid:"The Creed is our family's big “I believe!”"},
 of:{t:"Our Father",lead:"Our Father, Who art in heaven, hallowed be Thy name. Thy kingdom come, Thy will be done, on earth as it is in heaven.",resp:"Give us this day our daily bread, and forgive us our trespasses as we forgive those who trespass against us, and lead us not into temptation, but deliver us from evil. Amen.",
   kid:"Jesus taught us this prayer himself."},
 hm:{t:"Hail Mary",lead:"Hail Mary, full of grace, the Lord is with thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus.",resp:"Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
   kid:"These are the angel's and Elizabeth's words to Mary."},
 gb:{t:"Glory Be",all:"Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.",
   kid:"A short prayer of praise to God: Father, Son and Holy Spirit."},
 fat:{t:"O My Jesus",all:"O my Jesus, forgive us our sins, save us from the fires of hell, and lead all souls to heaven, especially those in most need of Thy mercy.",
   kid:"Mary taught this prayer to three children at Fatima."},
 hhq:{t:"Hail, Holy Queen",all:"Hail, Holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve: to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary! Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.",
   kid:"We finish by asking Mary, our Queen and Mother, to show us Jesus."}
};
export const MYSTERIES: Record<MysterySet, MysteryInfo> = {
 joyful:{short:"Joyful",name:"Joyful Mysteries",emoji:"☀️",when:"Mon/Sat",list:[
  ["The Annunciation","🌸","Mary says Yes to God!","Mary said yes to God's plan with a joyful heart.","Who visited Mary?"],
  ["The Visitation","🏠","Mary visits Elizabeth!","Mary hurried to help her cousin Elizabeth.","Who jumped for joy?"],
  ["The Nativity","⭐","Jesus is born!","Baby Jesus came to live with us.","Why did Jesus come?"],
  ["The Presentation","🕯️","Jesus at the Temple!","Simeon saw Baby Jesus and praised God.","Who held baby Jesus?"],
  ["The Finding of Jesus in the Temple","📖","Jesus found in Temple!","Mary and Joseph found Jesus teaching in the Temple.","Where did they find Jesus?"]]},
 luminous:{short:"Luminous",name:"Luminous Mysteries",emoji:"💧",when:"Thu",list:[
  ["The Baptism of the Lord","🕊️","Jesus is baptized!","God said, “This is My beloved Son!”","What came down like a dove?"],
  ["The Wedding Feast at Cana","🏺","Water becomes wine!","Mary said, “Do whatever He tells you.”","What did Mary say?"],
  ["The Proclamation of the Kingdom","☀️","Jesus says Follow Me!","Jesus invited friends to follow Him.","What did the fishermen leave?"],
  ["The Transfiguration","⛰️","Jesus shines like sun!","Jesus' face shone and God said to listen.","What did Jesus look like?"],
  ["The Institution of the Eucharist","🍞","This is My Body!","At the Last Supper Jesus gave us the Eucharist.","What did Jesus say about the bread?"]]},
 sorrowful:{short:"Sorrowful",name:"Sorrowful Mysteries",emoji:"💜",when:"Tue/Fri",list:[
  ["The Agony in the Garden","🙏","Jesus prays in garden!","Jesus prayed bravely before His suffering.","Where did Jesus pray?"],
  ["The Scourging at the Pillar","💧","Jesus suffers for us!","Jesus took our hurts upon Himself.","Why did Jesus suffer?"],
  ["The Crowning with Thorns","👑","Jesus wears thorns!","Soldiers mocked Jesus with a crown of thorns.","What crown did Jesus wear?"],
  ["The Carrying of the Cross","✝️","Jesus carries His cross!","Jesus carried the cross for love of us.","Who helped Jesus?"],
  ["The Crucifixion of Jesus","✝️🌅","Jesus dies for us!","Jesus gave His life so we can live with God.","Why is the cross special?"]]},
 glorious:{short:"Glorious",name:"Glorious Mysteries",emoji:"👑",when:"Wed/Sun",list:[
  ["The Resurrection","🌅","Jesus is risen!","The tomb was empty — Jesus is alive!","What did Mary find?"],
  ["The Ascension","☁️","Jesus goes to heaven!","Jesus blessed His friends and went up to heaven.","What did Jesus do before He went up?"],
  ["The Descent of the Holy Spirit","🔥","Holy Spirit comes!","The Holy Spirit filled the friends of Jesus.","What did Jesus give His friends?"],
  ["The Assumption of Mary","💗","Mary goes to heaven!","God took Mary, body and soul, into heaven.","Where is Mary now?"],
  ["The Coronation of Mary","👑","Mary crowned Queen!","Mary is crowned Queen of Heaven and Earth.","What is Mary called?"]]}
};
export const DAY_SET: MysterySet[] = ["glorious","joyful","sorrowful","glorious","luminous","sorrowful","joyful"];
export const SETS: MysterySet[] = ["joyful","luminous","sorrowful","glorious"];
export const MODE_META: Record<RosaryMode, { full: string; short: string; menu: string }> = {
  mini:{full:"🌱 Mini Decade",short:"🌱 Mini",menu:"🌱 Mini Decade (Kids)"},
  standard:{full:"⭐ 1 Decade",short:"⭐ 1 Dec",menu:"⭐ 1 Decade (Standard)"},
  full:{full:"🕊️ Full Rosary",short:"🕊️ Full",menu:"🕊️ Full Rosary (5 Decades)"}
};

export const MODES: RosaryMode[] = ["mini", "standard", "full"];
export const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth"];

/** Mini 14 steps, 1 Decade 22 steps, Full 79 steps. */
export function buildSteps(mode: RosaryMode, dec: number): RosaryStep[] {
  const s: RosaryStep[] = [];
  if (mode === "mini") {
    s.push({ k: "soc", d: dec });
    s.push({ k: "of", d: dec });
    for (let b = 0; b < 10; b++) s.push({ k: "hm", d: dec, b });
    s.push({ k: "gb", d: dec });
    s.push({ k: "fat", d: dec });
    return s;
  }
  s.push({ k: "soc", d: dec, intro: 1 });
  s.push({ k: "creed", d: dec, intro: 1 });
  s.push({ k: "of", d: dec, intro: 1 });
  for (let b = 0; b < 3; b++) s.push({ k: "hm", d: dec, b, intro: 1 });
  s.push({ k: "gb", d: dec, intro: 1 });
  s.push({ k: "fat", d: dec, intro: 1 });
  const n = mode === "full" ? 5 : 1;
  for (let i = 0; i < n; i++) {
    const d = mode === "full" ? i : dec;
    s.push({ k: "ann", d });
    s.push({ k: "of", d });
    for (let b = 0; b < 10; b++) s.push({ k: "hm", d, b });
    s.push({ k: "gb", d });
    s.push({ k: "fat", d });
  }
  if (mode === "full") s.push({ k: "hhq", d: 4 });
  return s;
}

/** Which bead each step lands on. */
export function beadKey(st: RosaryStep, mode: RosaryMode): string {
  const k = st.k;
  if (k === "soc" || k === "creed") return "cross";
  if (mode !== "full") {
    if (st.intro) {
      if (k === "of") return "of";
      if (k === "hm") return "i" + st.b;
      return "medal"; // intro Glory Be + O My Jesus
    }
    if (k === "ann" || k === "of") return "medal";
    if (k === "hm") return "h" + st.b;
    return "cross"; // closing Glory Be + O My Jesus: back at the cross
  }
  if (st.intro) {
    if (k === "of") return "pOF";
    if (k === "hm") return "p" + st.b;
    return "pB";
  }
  if (k === "ann" || k === "of") return st.d === 0 ? "pB" : "b" + (st.d - 1);
  if (k === "hm") return "d" + st.d + "h" + st.b;
  if (k === "gb" || k === "fat") return st.d < 4 ? "b" + st.d : "center";
  return "center"; // Hail, Holy Queen
}
