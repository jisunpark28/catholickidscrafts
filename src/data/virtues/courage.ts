/** Courage, the first catechism virtue bundle. Internal name for the section: 덕목. */

export type VirtueStory = {
  /** Picture card, when this story has one. */
  cardId?: string;
  ref: string;
  title: string;
  summary: string;
};

export type VirtueScenario = {
  situation: string;
  questions: readonly string[];
  image: string;
  imageAlt: string;
};

export type VirtueBundle = {
  slug: string;
  name: string;
  basis: string;
  /** Landing-tile picture of the virtue itself. Not a story card. */
  cover: string;
  coverAlt: string;
  stories: readonly VirtueStory[];
  keyVerse: { ref: string; text: string; note: string; cardId: string };
  scenarios: readonly VirtueScenario[];
  commitment: string;
  encouragement: string;
  worksheet: { slug: string; key: string; title: string; href: string };
};

export const COURAGE: VirtueBundle = {
  slug: "courage",
  name: "Courage",
  basis: "CCC 1808. Fortitude is the cardinal virtue that holds on to the good when it is hard. For children the name is Courage.",
  cover: "/images/virtues/courage.webp",
  coverAlt: "A child stands calmly beside a friend",
  stories: [
    {
      cardId: "VIR-078",
      ref: "Mark 3:1–6",
      title: "The man with the withered hand",
      summary:
        "In the synagogue, people watched to see if Jesus would heal on the sabbath so they could accuse him. He asked whether it is lawful to do good on the sabbath rather than to do evil. They stayed silent. He said, “Stretch out your hand.” The man stretched it out and his hand was restored.",
    },
    {
      cardId: "VIR-079",
      ref: "Mark 10:13–16",
      title: "Let the children come",
      summary:
        "People were bringing children to Jesus, and the disciples tried to turn them away. Jesus was indignant and said, “Let the children come to me; do not prevent them, for the kingdom of God belongs to such as these.” Then he embraced the children and blessed them.",
    },
    {
      cardId: "VIR-081",
      ref: "Daniel 6:11–24",
      title: "Daniel keeps praying",
      summary:
        "After a law said that for thirty days people could pray only to the king, Daniel still went home, knelt, and prayed to God three times a day with the windows open toward Jerusalem. He was put into the lions' den. God sent an angel and closed the lions' mouths, and Daniel was unharmed because he trusted in his God.",
    },
  ],
  keyVerse: {
    ref: "Matthew 10:31",
    text: "So do not be afraid; you are worth more than many sparrows.",
    note: "The sentence begins with “So.” It follows the sparrows and the counted hairs in Matthew 10:29–30.",
    cardId: "VIR-080",
  },
  scenarios: [
    {
      situation: "Classmates are mocking a friend's drawing.",
      image: "/images/virtues/courage-drawing.webp",
      imageAlt: "Classmates laugh at a drawing while one child stands with the friend",
      questions: [
        "What would it be like if most of your class teased one friend and only you stopped?",
        "Have you ever thought it was okay because everyone was doing it?",
      ],
    },
    {
      situation: "Kids knock down a friend's block tower.",
      image: "/images/virtues/courage-blocks.webp",
      imageAlt: "A block tower is knocked over and one child comes to help rebuild",
      questions: [
        "How would you feel if everyone knocked down your blocks?",
        "What would you want a friend to do when you're upset?",
      ],
    },
  ],
  commitment:
    "I will be courageous. Even when everyone joins in, I will not follow along with something that would hurt me if it were done to me.",
  encouragement: "That is real courage. What would Jesus want us to do?",
  worksheet: {
    slug: "courage",
    key: "VIR_COURAGE",
    title: "Courage Virtue Challenge",
    href: "/catholic-virtue-challenge/courage",
  },
};
