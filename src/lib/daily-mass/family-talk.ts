/**
 * Daily Mass "Family talk" prompts, keyed by civil date (YYYY-MM-DD).
 *
 * Questions are original CatholicKidsCrafts text written for children. They
 * reference the day's Gospel by citation only — never paste Lectionary text here.
 * Citations come from the USCCB Daily Readings pages for each date.
 */
export type FamilyTalkEntry = {
  /** Gospel citation for the date (USCCB). */
  gospel: string;
  questions: [string, string, string];
  /** One concrete thing for kids to notice at Mass. */
  lookFor: string;
};

export const FAMILY_TALK: Record<string, FamilyTalkEntry> = {
  "2026-10-20": {
    gospel: "Luke 12:35-38",
    questions: [
      "Jesus tells the servants to keep their lamps lit while they wait. How can we be ready for Jesus every day?",
      "When the master comes home, he serves the servants himself! How does Jesus show us he loves to serve?",
      "Who is someone you can help or serve this week, the way Jesus serves us?",
    ],
    lookFor: "Is the priest wearing green? Green is the color of hope and growing in faith.",
  },
  "2026-10-21": {
    gospel: "Luke 12:39-48",
    questions: [
      "Jesus talks about a servant who takes good care of things while the master is away. What has God given you to take care of?",
      "How can you do your jobs well, even when no one is watching?",
      "Jesus says that people who are given a lot are asked to give a lot. What gifts has God given you to share?",
    ],
    lookFor: "Listen for the word \"servant\" in the Gospel. A servant is someone who helps others, like Jesus does.",
  },
  "2026-10-22": {
    gospel: "Luke 12:49-53",
    questions: [
      "Jesus says he came to bring fire to the earth. What do you think the fire of God's love looks like?",
      "Sometimes following Jesus is hard, even with people we love. What helps you stay brave and kind?",
      "How can you share Jesus' love with your family today?",
    ],
    lookFor: "Find the candles near the altar. Their flames remind us that Jesus is the Light of the World.",
  },
  "2026-10-23": {
    gospel: "Luke 12:54-59",
    questions: [
      "People could tell when rain was coming by looking at the sky. What signs show us that God loves us?",
      "Jesus tells us to make peace quickly. Is there someone you need to say sorry to?",
      "What can we do to make peace after an argument with a friend or a brother or sister?",
    ],
    lookFor: "At the Sign of Peace, turn to the people near you and offer them peace with a smile.",
  },
  "2026-10-24": {
    gospel: "Luke 13:1-9",
    questions: [
      "The gardener asked for one more year to help the fig tree grow fruit. How is God patient with us?",
      "What good fruit can you grow in your life, like kindness, sharing, or patience?",
      "Jesus asks us to turn back to God. How can we tell God we are sorry? (Hint: Confession!)",
    ],
    lookFor: "Listen for \"Lord, have mercy.\" We ask God for mercy, and he is always ready to forgive.",
  },
  "2026-10-25": {
    gospel: "Matthew 22:34-40",
    questions: [
      "Jesus says the greatest commandment is to love God with all your heart. How can you show God you love him?",
      "Jesus says to love your neighbor. Who is one neighbor you can be kind to this week?",
      "What is one way to treat others the way you want to be treated?",
    ],
    lookFor: "Listen for Jesus' two great commandments in the Gospel: love God, and love your neighbor.",
  },
  "2026-10-26": {
    gospel: "Luke 13:10-17",
    questions: [
      "Jesus healed a woman who had been bent over for eighteen years. How do you think she felt when she could stand up straight?",
      "Right away, the woman praised God. What can you thank God for today?",
      "Jesus showed that the Lord's Day is a day for doing good. What good thing can your family do on Sunday?",
    ],
    lookFor: "Notice when we stand, sit, and kneel at Mass. Our bodies pray too!",
  },
  "2026-10-27": {
    gospel: "Luke 13:18-21",
    questions: [
      "Jesus says God's Kingdom is like a tiny mustard seed that grows into a big tree. What small thing can you do to help God's love grow?",
      "A little yeast makes a whole loaf of bread rise. How can one kind act change someone's whole day?",
      "How is our faith like a seed that keeps growing?",
    ],
    lookFor: "Watch the bread brought to the altar. At the consecration it becomes the Body of Jesus.",
  },
};

export function familyTalkFor(dateKey: string): FamilyTalkEntry | null {
  return FAMILY_TALK[dateKey] ?? null;
}
