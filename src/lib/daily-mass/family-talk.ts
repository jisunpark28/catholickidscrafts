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
  "2026-10-28": {
    gospel: "Luke 6:12-16",
    questions: [
      "Before choosing his twelve apostles, Jesus prayed all night. Why do you think he prayed first?",
      "Saints Simon and Jude were ordinary people Jesus called to be his friends. How does Jesus call you to be his friend?",
      "What is one big choice you can pray about before you decide?",
    ],
    lookFor: "Listen for the names of the apostles. Today we remember Saint Simon and Saint Jude, and the priest wears red for them.",
  },
  "2026-10-29": {
    gospel: "Luke 13:31-35",
    questions: [
      "Jesus says he wants to gather his people like a mother hen gathers her chicks under her wings. How does that picture show God's love?",
      "When do you feel safe and cared for, like a chick under its mother's wings?",
      "How can you help someone in your family feel safe and loved today?",
    ],
    lookFor: "Is the priest wearing green? Green is the color of hope and growing in faith.",
  },
  "2026-10-30": {
    gospel: "Luke 14:1-6",
    questions: [
      "Jesus healed a sick man on the Sabbath, even though some people were watching to catch him. Why did Jesus still help?",
      "Is it ever hard to do the right thing when others are watching? What helps you be brave?",
      "Who needs your help today, even if it is not easy?",
    ],
    lookFor: "Listen to the prayers for the sick in the Prayer of the Faithful. Can you think of someone to pray for?",
  },
  "2026-10-31": {
    gospel: "Luke 14:1, 7-11",
    questions: [
      "Jesus says not to rush to the best seat at a party. Why is it good to let others go first?",
      "What does it mean to be humble?",
      "How can you put someone else first at home this week?",
    ],
    lookFor: "Watch how the altar servers help quietly at Mass. Serving others is a humble way to love.",
  },
  "2026-11-01": {
    gospel: "Matthew 5:1-12a",
    questions: [
      "Today is All Saints Day! Jesus teaches the Beatitudes, the happy ways to live. Which one do you like best?",
      "Saints are friends of God who are now in heaven. Which saint would you like to learn more about?",
      "Jesus says peacemakers are blessed. How can you be a peacemaker this week?",
    ],
    lookFor: "Is the priest wearing white or gold? White is the color of joy, for the feast of all the saints in heaven.",
  },
  "2026-11-02": {
    gospel: "John 6:37-40",
    questions: [
      "Today we pray for people who have died. Jesus promises that he will raise them up. How does that promise give us hope?",
      "Is there someone who has died that your family can pray for today?",
      "Jesus says he will never turn away anyone who comes to him. How does that make you feel?",
    ],
    lookFor: "Listen for the prayer for those who have died during Mass. You can quietly say the name of someone you miss.",
  },
  "2026-11-03": {
    gospel: "Luke 14:15-24",
    questions: [
      "In Jesus' story, a man invites many people to a great dinner, but they make excuses. Why do you think they did not come?",
      "God invites us to Mass every Sunday. How can we say yes to God's invitation?",
      "The man invited the poor and people who are often left out. Who could you include this week?",
    ],
    lookFor: "At Communion, listen for \"Blessed are those called to the supper of the Lamb.\" Jesus invites us to his table!",
  },
  "2026-11-04": {
    gospel: "Luke 14:25-33",
    questions: [
      "Jesus says a builder plans carefully before building a tower. Why is it good to think before we start something?",
      "Following Jesus means putting him first. What is one way you can put Jesus first today?",
      "Saint Charles Borromeo worked hard to teach people about God. Who teaches you about God?",
    ],
    lookFor: "Is the priest wearing green? Green is the color of hope and growing in faith.",
  },
  "2026-11-05": {
    gospel: "Luke 15:1-10",
    questions: [
      "The shepherd leaves ninety-nine sheep to find the one that was lost. How does that show how much God loves each of us?",
      "The woman celebrated when she found her lost coin. Why is heaven happy when someone comes back to God?",
      "Have you ever lost something special and then found it? How did you feel?",
    ],
    lookFor: "Look for a picture or statue of Jesus the Good Shepherd in your church. Can you find a lamb?",
  },
  "2026-11-06": {
    gospel: "Luke 16:1-8",
    questions: [
      "In Jesus' story, a manager thinks quickly to make friends for the future. How can we use our time wisely for God?",
      "What are some good gifts God has given you to take care of?",
      "How can you plan ahead to do something kind this week?",
    ],
    lookFor: "Is the priest wearing green? Green is the color of hope and growing in faith.",
  },
  "2026-11-07": {
    gospel: "Luke 16:9-15",
    questions: [
      "Jesus says that people who can be trusted with small things can be trusted with big things. What small jobs can you do faithfully?",
      "Jesus says we cannot serve God and money. What does it mean to love God more than things?",
      "How can your family share what you have with someone in need?",
    ],
    lookFor: "Watch for the collection basket. Giving is one way we thank God for everything he gives us.",
  },
  "2026-11-08": {
    gospel: "Matthew 25:1-13",
    questions: [
      "In Jesus' story, some bridesmaids brought extra oil for their lamps and some did not. Why was it smart to be prepared?",
      "How can we keep our hearts ready for Jesus, like a lamp that stays lit?",
      "What helps you remember to pray every day?",
    ],
    lookFor: "Look at the candles on the altar. Like the lamps in today's Gospel, they remind us to stay ready for Jesus.",
  },
  "2026-11-09": {
    gospel: "John 2:13-22",
    questions: [
      "Jesus was upset that people were treating God's house like a market. Why is church a special place?",
      "Jesus said the real temple was his own body. How can we show respect for God's house and for our own bodies?",
      "What is one way you can show love for God when you walk into church?",
    ],
    lookFor: "Today we celebrate a famous church in Rome. As you come in, notice the holy water and make the Sign of the Cross.",
  },
  "2026-11-10": {
    gospel: "Luke 17:7-10",
    questions: [
      "Jesus says servants do their jobs without needing a big reward. How can we help without expecting a prize?",
      "What is a chore you can do cheerfully today, just because it is good?",
      "Saint Leo the Great was a pope who served God's people. How do our priests and bishops serve us?",
    ],
    lookFor: "Is the priest wearing green? Green is the color of hope and growing in faith.",
  },
  "2026-11-11": {
    gospel: "Luke 17:11-19",
    questions: [
      "Jesus healed ten men, but only one came back to say thank you. Why is saying thank you important?",
      "What are three things you can thank God for right now?",
      "Who is someone you can thank today for helping you?",
    ],
    lookFor: "At the start of the Eucharistic Prayer, listen for \"Let us give thanks to the Lord our God.\" The word Eucharist means thanksgiving!",
  },
  "2026-11-12": {
    gospel: "Luke 17:20-25",
    questions: [
      "Jesus says the Kingdom of God is among us. Where do you see God's love around you?",
      "How can kind words and actions help God's Kingdom grow at school or at home?",
      "Saint Josaphat worked hard to bring Christians together. How can you help people get along?",
    ],
    lookFor: "Is the priest wearing red today? Red reminds us of saints, like Saint Josaphat, who gave their lives for Jesus.",
  },
  "2026-11-13": {
    gospel: "Luke 17:26-37",
    questions: [
      "Jesus says that in Noah's time, people were too busy to notice God. How can we make time for God even when we are busy?",
      "Noah listened to God and built the ark. How can you listen to God?",
      "What is one quiet moment today when you can say a prayer?",
    ],
    lookFor: "Is the priest wearing green? Green is the color of hope and growing in faith.",
  },
  "2026-11-14": {
    gospel: "Luke 18:1-8",
    questions: [
      "In Jesus' story, a widow keeps asking until the judge listens. Why does Jesus want us to keep praying?",
      "Is there something you have been praying for? Let's pray for it together.",
      "How does it feel to know that God always hears our prayers?",
    ],
    lookFor: "Listen to the Prayer of the Faithful. After each prayer, we answer together, \"Lord, hear our prayer.\"",
  },
  "2026-11-15": {
    gospel: "Matthew 25:14-30",
    questions: [
      "In Jesus' story, servants were given talents, or money, to use well. What talents has God given you?",
      "The servant who hid his talent was afraid. How can we be brave and use our gifts?",
      "How can you use one of your gifts to help someone this week?",
    ],
    lookFor: "Watch the gifts of bread and wine brought up to the altar. We offer our gifts to God too.",
  },
  "2026-11-16": {
    gospel: "Luke 18:35-43",
    questions: [
      "A blind man called out to Jesus again and again, even when people told him to be quiet. Why didn't he give up?",
      "Jesus asked, \"What do you want me to do for you?\" What would you ask Jesus?",
      "After he could see, the man followed Jesus and praised God. How can we praise God today?",
    ],
    lookFor: "Listen for \"Lord, have mercy\" near the start of Mass. The blind man asked Jesus for mercy too.",
  },
  "2026-11-17": {
    gospel: "Luke 19:1-10",
    questions: [
      "Zacchaeus was short, so he climbed a tree to see Jesus. What can we do to get closer to Jesus?",
      "Jesus went to Zacchaeus's house, and Zacchaeus changed his heart. How can meeting Jesus change us?",
      "Saint Elizabeth of Hungary shared food with the poor. How could your family help someone who is hungry?",
    ],
    lookFor: "Is the priest wearing green? Green is the color of hope and growing in faith.",
  },
  "2026-11-18": {
    gospel: "Luke 19:11-28",
    questions: [
      "In Jesus' story, a king gives his servants coins and asks them to use them well. How can we use what God gives us?",
      "What is one good habit you can grow, a little at a time?",
      "Why do you think God trusts us with gifts?",
    ],
    lookFor: "Is the priest wearing green? Green is the color of hope and growing in faith.",
  },
  "2026-11-19": {
    gospel: "Luke 19:41-44",
    questions: [
      "Jesus cried over the city of Jerusalem because he loved its people. What does that tell us about Jesus' heart?",
      "Jesus wants us to recognize when God is close to us. How can we notice God every day?",
      "How can you bring peace to someone who is sad?",
    ],
    lookFor: "At the Sign of Peace, look at the person next to you and wish them peace with a smile.",
  },
  "2026-11-20": {
    gospel: "Luke 19:45-48",
    questions: [
      "Jesus said God's house should be a house of prayer. What do you like to pray about in church?",
      "People hung on every word Jesus said. How can you be a good listener at Mass?",
      "How can we make our home a place of prayer too?",
    ],
    lookFor: "Find the tabernacle, the special box where Jesus is kept. Is the candle beside it lit?",
  },
  "2026-11-21": {
    gospel: "Luke 20:27-40",
    questions: [
      "Jesus says God is the God of the living. What do you think heaven will be like?",
      "Today we remember Mary being presented to God in the Temple as a child. How can you give yourself to God?",
      "Who is someone in your family who has died that we can pray for today?",
    ],
    lookFor: "Look for a statue or picture of Mary. Today we remember when she was brought to God's Temple as a little girl.",
  },
  "2026-11-22": {
    gospel: "Matthew 25:31-46",
    questions: [
      "Today is Christ the King! Jesus says that when we help someone in need, we help him. Who can you help this week?",
      "Jesus talks about feeding the hungry and visiting the sick. Which kind act could your family do together?",
      "What kind of king is Jesus? How is he different from other kings?",
    ],
    lookFor: "Is the priest wearing white or gold? Today we celebrate Jesus, the King of the whole universe.",
  },
  "2026-11-23": {
    gospel: "Luke 21:1-4",
    questions: [
      "A poor widow gave two small coins, and Jesus said she gave more than anyone. Why did Jesus say that?",
      "Giving from the heart matters more than giving a lot. What can you give to God today?",
      "Can you give some of your time, a toy, or a smile to someone this week?",
    ],
    lookFor: "Watch the collection at Mass. Jesus cares most about the love in our hearts when we give.",
  },
  "2026-11-24": {
    gospel: "Luke 21:5-11",
    questions: [
      "Jesus says that even beautiful buildings will not last forever, but God's love will. What lasts forever?",
      "When we feel scared, Jesus tells us not to be afraid. What helps you feel brave?",
      "Saint Andrew Dung-Lac and his friends stayed faithful to Jesus. How can you stay close to Jesus when things are hard?",
    ],
    lookFor: "Is the priest wearing red? Red reminds us of the martyrs we remember today, who loved Jesus very much.",
  },
  "2026-11-25": {
    gospel: "Luke 21:12-19",
    questions: [
      "Jesus promises to give his friends the right words when they need them. When could you ask the Holy Spirit for help?",
      "Jesus says not a hair on your head will be lost. How does it feel to know God cares about every little thing?",
      "How can you be patient and keep trusting God when something is hard?",
    ],
    lookFor: "Listen for the Holy Spirit in the prayers at Mass. The priest asks the Holy Spirit to come upon the gifts.",
  },
  "2026-11-26": {
    gospel: "Luke 21:20-28",
    questions: [
      "Jesus says, \"Stand up and raise your heads,\" because he is coming. How does that help us feel hopeful?",
      "When something scary happens, how can we remember that Jesus is with us?",
      "What is one thing you are thankful for today?",
    ],
    lookFor: "Is the priest wearing green? Green is the color of hope and growing in faith.",
  },
  "2026-11-27": {
    gospel: "Luke 21:29-33",
    questions: [
      "Jesus says when leaves grow on a fig tree, we know summer is near. What signs show us that Christmas and Advent are coming?",
      "Jesus says his words will never pass away. What is your favorite thing Jesus said?",
      "How can your family get ready for Advent this week?",
    ],
    lookFor: "This is the last week before Advent. Next week, look for the Advent wreath with its purple and pink candles!",
  },
  "2026-11-28": {
    gospel: "Luke 21:34-36",
    questions: [
      "Jesus tells us to stay awake and pray. What does it mean to stay awake for Jesus?",
      "How can we keep our hearts ready for Jesus as Advent begins tomorrow?",
      "What is one way your family can pray together during Advent?",
    ],
    lookFor: "This is the last day of the Church year! Tomorrow is the first Sunday of Advent, and the priest will wear purple.",
  },
};

export function familyTalkFor(dateKey: string): FamilyTalkEntry | null {
  return FAMILY_TALK[dateKey] ?? null;
}
