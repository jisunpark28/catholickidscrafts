// English texts aligned with USCCB basic prayers and Roman Missal (ICEL)
// https://www.usccb.org/prayer-and-worship/prayers-and-devotions/prayers
import type { PrayerTranslationMap } from "@/lib/prayers/prayer-types";

export const EN_PRAYERS: PrayerTranslationMap = {
  "sign-of-the-cross": {
    title: "Sign of the Cross",
    text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
  },
  "our-father": {
    title: "Our Father",
    text: "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  },
  "hail-mary": {
    title: "Hail Mary",
    text: "Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
  },
  "glory-be": {
    title: "Glory Be",
    text: "Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.",
  },
  "fatima-prayer": {
    title: "Fatima Prayer",
    text: "O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to heaven, especially those in most need of thy mercy. Amen.",
  },
  "apostles-creed": {
    title: "Apostles' Creed",
    text: `I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead.

I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.`,
  },
  "nicene-creed": {
    title: "Nicene Creed",
    text: `I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible.

I believe in one Lord Jesus Christ, the Only Begotten Son of God, born of the Father before all ages. God from God, Light from Light, true God from true God, begotten, not made, consubstantial with the Father; through him all things were made. For us men and for our salvation he came down from heaven, and by the Holy Spirit was incarnate of the Virgin Mary, and became man. For our sake he was crucified under Pontius Pilate, he suffered death and was buried, and rose again on the third day in accordance with the Scriptures. He ascended into heaven and is seated at the right hand of the Father. He will come again in glory to judge the living and the dead and his kingdom will have no end.

I believe in the Holy Spirit, the Lord, the giver of life, who proceeds from the Father and the Son, who with the Father and the Son is adored and glorified, who has spoken through the prophets.

I believe in one, holy, catholic and apostolic Church. I confess one Baptism for the forgiveness of sins and I look forward to the resurrection of the dead and the life of the world to come. Amen.`,
  },
  "morning-offering": {
    title: "Morning Offering",
    text: "O Jesus, through the Immaculate Heart of Mary, I offer you my prayers, works, joys, and sufferings of this day for all the intentions of your Sacred Heart, in union with the Holy Sacrifice of the Mass throughout the world, for the salvation of souls, the reparation of sins, the reunion of all Christians, and the intentions of our Holy Father. Amen.",
  },
  "angelus": {
    title: "The Angelus",
    text: `V. The Angel of the Lord declared unto Mary.
R. And she conceived of the Holy Spirit.

Hail Mary…

V. Behold the handmaid of the Lord.
R. Be it done unto me according to thy word.

Hail Mary…

V. And the Word was made flesh.
R. And dwelt among us.

Hail Mary…

V. Pray for us, O holy Mother of God.
R. That we may be made worthy of the promises of Christ.

Let us pray: Pour forth, we beseech thee, O Lord, thy grace into our hearts, that we, to whom the Incarnation of Christ, thy Son, was made known by the message of an Angel, may by his Passion and Cross be brought to the glory of his Resurrection. Through the same Christ our Lord. Amen.`,
  },
  "regina-caeli": {
    title: "Regina Caeli",
    text: `V. Queen of Heaven, rejoice, alleluia.
R. For he whom you merited to bear, alleluia.

V. Has risen, as he said, alleluia.
R. Pray for us to God, alleluia.

V. Rejoice and be glad, O Virgin Mary, alleluia.
R. For the Lord has truly risen, alleluia.

Let us pray: O God, who gave joy to the world through the resurrection of thy Son, our Lord Jesus Christ, grant we beseech thee, that through the intercession of the Virgin Mary, his Mother, we may obtain the joys of everlasting life. Through the same Christ our Lord. Amen.`,
  },
  "grace-before-meals": {
    title: "Grace Before Meals",
    text: "Bless us, O Lord, and these thy gifts, which we are about to receive from thy bounty, through Christ our Lord. Amen.",
  },
  "grace-after-meals": {
    title: "Grace After Meals",
    text: `We give thee thanks, almighty God, for all thy benefits, who livest and reignest, world without end. Amen.

May the souls of the faithful departed, through the mercy of God, rest in peace. Amen.`,
  },
  "guardian-angel": {
    title: "Guardian Angel Prayer",
    text: "Angel of God, my guardian dear, to whom God's love commits me here, ever this day be at my side, to light and guard, to rule and guide. Amen.",
  },
  "come-holy-spirit": {
    title: "Come, Holy Spirit",
    text: `Come, Holy Spirit, fill the hearts of thy faithful and kindle in them the fire of thy love.

Send forth thy Spirit and they shall be created, and thou shalt renew the face of the earth.

Let us pray: O God, who didst instruct the hearts of the faithful by the light of the Holy Spirit, grant us in the same Spirit to be truly wise and ever to rejoice in his consolation. Through Christ our Lord. Amen.`,
  },
  "act-of-contrition": {
    title: "Act of Contrition",
    text: "O my God, I am heartily sorry for having offended thee, and I detest all my sins because of thy just punishments, but most of all because they offend thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of thy grace, to sin no more and to avoid the near occasion of sin. Amen.",
  },
  "anima-christi": {
    title: "Anima Christi",
    text: `Soul of Christ, sanctify me.
Body of Christ, save me.
Blood of Christ, inebriate me.
Water from the side of Christ, wash me.
Passion of Christ, strengthen me.
O good Jesus, hear me.
Within thy wounds hide me.
Permit me not to be separated from thee.
From the wicked foe, defend me.
At the hour of my death, call me
and bid me come to thee,
that with thy saints I may praise thee
forever and ever. Amen.`,
  },
  "prayer-before-communion": {
    title: "Prayer Before Communion",
    text: "Lord, I am not worthy that you should enter under my roof, but only say the word and my soul shall be healed.",
  },
  "prayer-after-communion": {
    title: "Prayer After Communion",
    text: "Lord, may I receive these gifts in purity of heart. May they bring me healing and wholeness of mind and body. Amen.",
  },
  "memorare": {
    title: "Memorare",
    text: "Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thy intercession was left unaided. Inspired with this confidence, I fly unto thee, O Virgin of virgins, my Mother; to thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.",
  },
  "hail-holy-queen": {
    title: "Hail, Holy Queen",
    text: `Hail, holy Queen, Mother of mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.

Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.`,
  },
  "prayer-to-st-michael": {
    title: "Prayer to St. Michael the Archangel",
    subtitle: "Defend us against evil",
    text: "St. Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray, and do thou, O Prince of the heavenly hosts, by the power of God, cast into hell Satan and all the evil spirits who prowl about the world seeking the ruin of souls. Amen.",
  },
  "prayer-of-st-francis": {
    title: "Prayer of St. Francis",
    text: `Lord, make me an instrument of your peace:
where there is hatred, let me sow love;
where there is injury, pardon;
where there is doubt, faith;
where there is despair, hope;
where there is darkness, light;
where there is sadness, joy.

O divine Master, grant that I may not so much seek to be consoled as to console, to be understood as to understand, to be loved as to love. For it is in giving that we receive, in pardoning that we are pardoned, and in dying that we are born to eternal life. Amen.`,
  },
  "eternal-rest": {
    title: "Eternal Rest",
    text: `Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May they rest in peace. Amen.

May their souls and the souls of all the faithful departed, through the mercy of God, rest in peace. Amen.`,
  },
  "sub-tuum": {
    title: "Sub Tuum Praesidium",
    text: "We fly to thy protection, O holy Mother of God; despise not our petitions in our necessities, but deliver us always from all dangers, O glorious and blessed Virgin. Amen.",
  },
};
