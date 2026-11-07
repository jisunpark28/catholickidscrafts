import type { Mission } from './model';
/** 200 authored situations; location-specific, Catholic numbering. */
export const MISSIONS: Mission[] = [
  {
    "id": "church-01",
    "location": "church",
    "commandment": 1,
    "prompt": "You enter church and see the tabernacle. What can help you remember whom you came to worship?",
    "choices": [
      {
        "id": "care",
        "text": "Pause to greet Jesus in prayer."
      },
      {
        "id": "other-a",
        "text": "Count how many people notice you."
      },
      {
        "id": "other-b",
        "text": "Think only about the snacks later."
      }
    ],
    "correctId": "care",
    "feedback": "Prayer turns our attention toward God, who comes first."
  },
  {
    "id": "church-02",
    "location": "church",
    "commandment": 1,
    "prompt": "A friend says a lucky stone makes prayer unnecessary. What could you say?",
    "choices": [
      {
        "id": "care",
        "text": "A stone cannot replace trusting God."
      },
      {
        "id": "other-a",
        "text": "The biggest stone has the most power."
      },
      {
        "id": "other-b",
        "text": "Only pray if the stone fails."
      }
    ],
    "correctId": "care",
    "feedback": "We trust God rather than treating objects as powers over our lives."
  },
  {
    "id": "church-03",
    "location": "church",
    "commandment": 1,
    "prompt": "You light a candle with an adult. What does the candle mean?",
    "choices": [
      {
        "id": "care",
        "text": "It can be a sign of a prayer to God."
      },
      {
        "id": "other-a",
        "text": "It forces God to grant a wish."
      },
      {
        "id": "other-b",
        "text": "It earns a better place than other people."
      }
    ],
    "correctId": "care",
    "feedback": "Candles help us pray; they do not control God or buy his love."
  },
  {
    "id": "church-04",
    "location": "church",
    "commandment": 1,
    "prompt": "Your prayer was not answered as you hoped. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Tell God your sadness and keep trusting him."
      },
      {
        "id": "other-a",
        "text": "Decide God only loves winners."
      },
      {
        "id": "other-b",
        "text": "Try to bargain for God's love."
      }
    ],
    "correctId": "care",
    "feedback": "God welcomes honest prayer, even when we are disappointed."
  },
  {
    "id": "church-05",
    "location": "church",
    "commandment": 1,
    "prompt": "You admire a beautiful statue of Mary. What do Catholics do?",
    "choices": [
      {
        "id": "care",
        "text": "Honor Mary and worship God alone."
      },
      {
        "id": "other-a",
        "text": "Treat the statue itself as a god."
      },
      {
        "id": "other-b",
        "text": "Think the statue can grant any order."
      }
    ],
    "correctId": "care",
    "feedback": "Sacred images remind us of holy people; worship belongs to God."
  },
  {
    "id": "church-06",
    "location": "church",
    "commandment": 2,
    "prompt": "A classmate uses Jesus' name as a punchline in the church hall. What is a good response?",
    "choices": [
      {
        "id": "care",
        "text": "Say calmly that his name matters to you."
      },
      {
        "id": "other-a",
        "text": "Make a louder joke about God."
      },
      {
        "id": "other-b",
        "text": "Shout insults at the classmate."
      }
    ],
    "correctId": "care",
    "feedback": "We can defend God's name respectfully without hurting another person."
  },
  {
    "id": "church-07",
    "location": "church",
    "commandment": 2,
    "prompt": "You are asked to read a prayer aloud. How can you prepare?",
    "choices": [
      {
        "id": "care",
        "text": "Practice saying God's name with care."
      },
      {
        "id": "other-a",
        "text": "Add a joke whenever God's name appears."
      },
      {
        "id": "other-b",
        "text": "Rush so the words do not matter."
      }
    ],
    "correctId": "care",
    "feedback": "God's name is holy, so we speak it reverently."
  },
  {
    "id": "church-08",
    "location": "church",
    "commandment": 2,
    "prompt": "A friend wants you to swear by God that you will always pick their team. What can you say?",
    "choices": [
      {
        "id": "care",
        "text": "I can be honest without using God's name as a guarantee."
      },
      {
        "id": "other-a",
        "text": "I swear by God, even if I change my mind."
      },
      {
        "id": "other-b",
        "text": "Use God's name just to stop the argument."
      }
    ],
    "correctId": "care",
    "feedback": "We should not use God's name lightly to pressure people or support promises."
  },
  {
    "id": "church-09",
    "location": "church",
    "commandment": 2,
    "prompt": "A hymn includes the word holy. You do not understand it. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask the catechist what it means."
      },
      {
        "id": "other-a",
        "text": "Replace it with a silly insult."
      },
      {
        "id": "other-b",
        "text": "Pretend the words have no meaning."
      }
    ],
    "correctId": "care",
    "feedback": "Learning sacred words helps us praise God thoughtfully."
  },
  {
    "id": "church-10",
    "location": "church",
    "commandment": 2,
    "prompt": "You hear someone say God hates a child who made a mistake. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask a trusted adult for help correcting that hurtful claim."
      },
      {
        "id": "other-a",
        "text": "Repeat it as if God had said it."
      },
      {
        "id": "other-b",
        "text": "Use it to frighten someone else."
      }
    ],
    "correctId": "care",
    "feedback": "We must not misuse God's name to threaten people or pretend to speak for him."
  },
  {
    "id": "church-11",
    "location": "church",
    "commandment": 3,
    "prompt": "It is Sunday and your family is preparing for Mass. How can you help?",
    "choices": [
      {
        "id": "care",
        "text": "Get ready in time without starting another game."
      },
      {
        "id": "other-a",
        "text": "Hide your shoes to delay everyone."
      },
      {
        "id": "other-b",
        "text": "Tell your family Sunday never matters."
      }
    ],
    "correctId": "care",
    "feedback": "We help make room for Sunday worship with our family."
  },
  {
    "id": "church-12",
    "location": "church",
    "commandment": 3,
    "prompt": "Your family is too ill to attend Mass. What is a helpful response?",
    "choices": [
      {
        "id": "care",
        "text": "Rest, pray if able, and ask an adult about returning when well."
      },
      {
        "id": "other-a",
        "text": "Feel that God has stopped loving you."
      },
      {
        "id": "other-b",
        "text": "Go anyway even if you may spread illness."
      }
    ],
    "correctId": "care",
    "feedback": "Illness can excuse attendance; Sunday remains a day to turn toward God as we are able."
  },
  {
    "id": "church-13",
    "location": "church",
    "commandment": 3,
    "prompt": "After Mass your family plans a quiet meal together. What fits Sunday well?",
    "choices": [
      {
        "id": "care",
        "text": "Join the meal and enjoy time together."
      },
      {
        "id": "other-a",
        "text": "Insist everyone must work every minute."
      },
      {
        "id": "other-b",
        "text": "Say rest is always a waste."
      }
    ],
    "correctId": "care",
    "feedback": "Sunday includes worship, family joy, and suitable rest."
  },
  {
    "id": "church-14",
    "location": "church",
    "commandment": 3,
    "prompt": "You help your family care for a sick grandparent on Sunday. How can you understand this?",
    "choices": [
      {
        "id": "care",
        "text": "Necessary care is a loving work, not a rejection of Sunday."
      },
      {
        "id": "other-a",
        "text": "All help is forbidden on Sunday."
      },
      {
        "id": "other-b",
        "text": "Only paid work ever counts as care."
      }
    ],
    "correctId": "care",
    "feedback": "Works of mercy and necessary care belong with honoring the Lord's Day."
  },
  {
    "id": "church-15",
    "location": "church",
    "commandment": 3,
    "prompt": "Your team has a Sunday game near Mass time. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask your parent to plan a suitable Mass time with you."
      },
      {
        "id": "other-a",
        "text": "Secretly skip Mass without discussing it."
      },
      {
        "id": "other-b",
        "text": "Tell others sports matter more than worship."
      }
    ],
    "correctId": "care",
    "feedback": "Planning with adults helps us keep Sunday worship central."
  },
  {
    "id": "church-16",
    "location": "church",
    "commandment": 4,
    "prompt": "Your parent reminds you to stay nearby after Mass. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Agree on where to wait together."
      },
      {
        "id": "other-a",
        "text": "Leave the church grounds without telling anyone."
      },
      {
        "id": "other-b",
        "text": "Hide so your parent worries."
      }
    ],
    "correctId": "care",
    "feedback": "Listening to reasonable safety directions honors those who care for us."
  },
  {
    "id": "church-17",
    "location": "church",
    "commandment": 4,
    "prompt": "You disagree with your parent about a parish activity. What helps?",
    "choices": [
      {
        "id": "care",
        "text": "Explain your feelings respectfully and listen."
      },
      {
        "id": "other-a",
        "text": "Call your parent names."
      },
      {
        "id": "other-b",
        "text": "Pretend to agree and secretly do the opposite."
      }
    ],
    "correctId": "care",
    "feedback": "Respectful conversation can include honest disagreement."
  },
  {
    "id": "church-18",
    "location": "church",
    "commandment": 4,
    "prompt": "A child says honoring parents means obeying an unsafe request. What should you remember?",
    "choices": [
      {
        "id": "care",
        "text": "You may say no to harm and seek a trusted adult's help."
      },
      {
        "id": "other-a",
        "text": "You must do anything any adult asks."
      },
      {
        "id": "other-b",
        "text": "You must keep frightening requests secret."
      }
    ],
    "correctId": "care",
    "feedback": "Honoring parents never requires doing wrong or accepting harm."
  },
  {
    "id": "church-19",
    "location": "church",
    "commandment": 4,
    "prompt": "Your grandparent cannot read the small hymn number. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Offer to find the hymn together."
      },
      {
        "id": "other-a",
        "text": "Laugh at their eyesight."
      },
      {
        "id": "other-b",
        "text": "Snatch away their book impatiently."
      }
    ],
    "correctId": "care",
    "feedback": "Patient help shows honor to family elders."
  },
  {
    "id": "church-20",
    "location": "church",
    "commandment": 4,
    "prompt": "A younger sibling is confused about a family prayer custom. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask your parent to explain it with you."
      },
      {
        "id": "other-a",
        "text": "Say questions are disrespectful."
      },
      {
        "id": "other-b",
        "text": "Make up an answer to look important."
      }
    ],
    "correctId": "care",
    "feedback": "Families learn through patient questions and shared teaching."
  },
  {
    "id": "church-21",
    "location": "church",
    "commandment": 5,
    "prompt": "Someone falls on the church steps. What can you do first?",
    "choices": [
      {
        "id": "care",
        "text": "Tell a nearby trusted adult and give the person space."
      },
      {
        "id": "other-a",
        "text": "Push through to take a picture."
      },
      {
        "id": "other-b",
        "text": "Pull them up hard without checking."
      }
    ],
    "correctId": "care",
    "feedback": "Protecting life includes getting suitable help rather than adding danger."
  },
  {
    "id": "church-22",
    "location": "church",
    "commandment": 5,
    "prompt": "A child is teased about their hearing aid at parish class. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Speak kindly and tell the teacher about the teasing."
      },
      {
        "id": "other-a",
        "text": "Join in so you fit in."
      },
      {
        "id": "other-b",
        "text": "Hide the hearing aid for a joke."
      }
    ],
    "correctId": "care",
    "feedback": "Every person deserves safety and dignity."
  },
  {
    "id": "church-23",
    "location": "church",
    "commandment": 5,
    "prompt": "You feel furious after losing a parish game. What can help?",
    "choices": [
      {
        "id": "care",
        "text": "Step aside, breathe, and ask for help before acting."
      },
      {
        "id": "other-a",
        "text": "Throw a chair."
      },
      {
        "id": "other-b",
        "text": "Tell yourself anger means you must hit."
      }
    ],
    "correctId": "care",
    "feedback": "Feelings can be strong; we can choose not to hurt people."
  },
  {
    "id": "church-24",
    "location": "church",
    "commandment": 7,
    "prompt": "The parish garden needs gentle care. What is a good choice?",
    "choices": [
      {
        "id": "care",
        "text": "Help water plants as the gardener shows you."
      },
      {
        "id": "other-a",
        "text": "Break branches for fun."
      },
      {
        "id": "other-b",
        "text": "Pour leftover paint into the soil."
      }
    ],
    "correctId": "care",
    "feedback": "Care for creation supports the life God entrusts to us."
  },
  {
    "id": "church-25",
    "location": "church",
    "commandment": 5,
    "prompt": "A lonely newcomer sits outside the class circle. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Offer a place beside you without forcing them."
      },
      {
        "id": "other-a",
        "text": "Call them unfriendly."
      },
      {
        "id": "other-b",
        "text": "Block the entrance to the circle."
      }
    ],
    "correctId": "care",
    "feedback": "Protecting dignity includes welcoming people without pressure."
  },
  {
    "id": "church-26",
    "location": "church",
    "commandment": 6,
    "prompt": "A wedding couple promises to be faithful. What are they promising?",
    "choices": [
      {
        "id": "care",
        "text": "To love one another faithfully in marriage."
      },
      {
        "id": "other-a",
        "text": "To stay together only while gifts are new."
      },
      {
        "id": "other-b",
        "text": "To treat marriage as a game with replaceable partners."
      }
    ],
    "correctId": "care",
    "feedback": "The sixth commandment protects faithful married love."
  },
  {
    "id": "church-27",
    "location": "church",
    "commandment": 6,
    "prompt": "You make a card for a couple's anniversary. Which message fits?",
    "choices": [
      {
        "id": "care",
        "text": "May God help you keep your marriage promises."
      },
      {
        "id": "other-a",
        "text": "Trade your spouse for someone more exciting."
      },
      {
        "id": "other-b",
        "text": "Your promises end whenever you are bored."
      }
    ],
    "correctId": "care",
    "feedback": "Marriage promises call for enduring faithful love."
  },
  {
    "id": "church-28",
    "location": "church",
    "commandment": 6,
    "prompt": "In marriage preparation photos, you see a husband supporting his wife through illness. What does it show?",
    "choices": [
      {
        "id": "care",
        "text": "Faithful care in marriage can continue through hard times."
      },
      {
        "id": "other-a",
        "text": "Marriage matters only when everyone is cheerful."
      },
      {
        "id": "other-b",
        "text": "An illness makes promises worthless."
      }
    ],
    "correctId": "care",
    "feedback": "Care through difficulty is one way married people live faithfulness."
  },
  {
    "id": "church-29",
    "location": "church",
    "commandment": 6,
    "prompt": "A parish lesson asks why wedding promises are serious. What is the best answer?",
    "choices": [
      {
        "id": "care",
        "text": "Spouses give a lasting promise of faithful love."
      },
      {
        "id": "other-a",
        "text": "Promises only make the ceremony longer."
      },
      {
        "id": "other-b",
        "text": "Marriage is a contest to win attention."
      }
    ],
    "correctId": "care",
    "feedback": "The sixth commandment helps us respect marriage rather than treat people as replaceable."
  },
  {
    "id": "church-30",
    "location": "church",
    "commandment": 6,
    "prompt": "A friend jokes that married people should secretly date others. What could you say?",
    "choices": [
      {
        "id": "care",
        "text": "Marriage deserves faithful love, not secret dating."
      },
      {
        "id": "other-a",
        "text": "It is fine if nobody finds out."
      },
      {
        "id": "other-b",
        "text": "A secret always makes it harmless."
      }
    ],
    "correctId": "care",
    "feedback": "Faithfulness matters even when no one is watching."
  },
  {
    "id": "church-31",
    "location": "church",
    "commandment": 7,
    "prompt": "You find a purse under a pew. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Give it to a trusted parish adult to find its owner."
      },
      {
        "id": "other-a",
        "text": "Take the money as a reward."
      },
      {
        "id": "other-b",
        "text": "Hide it until someone offers a prize."
      }
    ],
    "correctId": "care",
    "feedback": "Lost property still belongs to its owner."
  },
  {
    "id": "church-32",
    "location": "church",
    "commandment": 7,
    "prompt": "The craft scissors belong to the parish. What should happen after class?",
    "choices": [
      {
        "id": "care",
        "text": "Return them to the supply box."
      },
      {
        "id": "other-a",
        "text": "Keep them because you used them."
      },
      {
        "id": "other-b",
        "text": "Leave them outside in the rain."
      }
    ],
    "correctId": "care",
    "feedback": "Respecting property includes returning and caring for shared supplies."
  },
  {
    "id": "church-33",
    "location": "church",
    "commandment": 7,
    "prompt": "You accidentally tear a borrowed missal. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Tell the person in charge and offer to help repair it."
      },
      {
        "id": "other-a",
        "text": "Hide it behind other books."
      },
      {
        "id": "other-b",
        "text": "Blame the next reader."
      }
    ],
    "correctId": "care",
    "feedback": "We take responsibility for damage to another's belongings."
  },
  {
    "id": "church-34",
    "location": "church",
    "commandment": 7,
    "prompt": "Donation coins sit beside the collection box. What is right?",
    "choices": [
      {
        "id": "care",
        "text": "Ask an adult to put them safely in the collection."
      },
      {
        "id": "other-a",
        "text": "Take them for a snack."
      },
      {
        "id": "other-b",
        "text": "Lend them to yourself without asking."
      }
    ],
    "correctId": "care",
    "feedback": "Money given for others is not ours to take."
  },
  {
    "id": "church-35",
    "location": "church",
    "commandment": 7,
    "prompt": "Someone left a jacket after parish club. You like it. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Bring it to lost property."
      },
      {
        "id": "other-a",
        "text": "Wear it home and hope nobody asks."
      },
      {
        "id": "other-b",
        "text": "Remove the name label."
      }
    ],
    "correctId": "care",
    "feedback": "Finding something does not make it ours."
  },
  {
    "id": "church-36",
    "location": "church",
    "commandment": 8,
    "prompt": "You forgot your reader practice. What should you tell the leader?",
    "choices": [
      {
        "id": "care",
        "text": "I forgot; can you help me prepare now?"
      },
      {
        "id": "other-a",
        "text": "My parent stopped me, even though that is untrue."
      },
      {
        "id": "other-b",
        "text": "I practiced perfectly when I did not."
      }
    ],
    "correctId": "care",
    "feedback": "Honesty lets others give real help."
  },
  {
    "id": "church-37",
    "location": "church",
    "commandment": 8,
    "prompt": "You hear an unverified story about a parish volunteer. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Do not spread it; ask a responsible adult if help is needed."
      },
      {
        "id": "other-a",
        "text": "Repeat it to everyone as fact."
      },
      {
        "id": "other-b",
        "text": "Add exciting details."
      }
    ],
    "correctId": "care",
    "feedback": "Truthfulness includes protecting others from rumors."
  },
  {
    "id": "church-38",
    "location": "church",
    "commandment": 8,
    "prompt": "You broke a cup in the hall. What is a truthful response?",
    "choices": [
      {
        "id": "care",
        "text": "Tell the adult what happened."
      },
      {
        "id": "other-a",
        "text": "Say a child who was absent did it."
      },
      {
        "id": "other-b",
        "text": "Move the pieces and deny knowing."
      }
    ],
    "correctId": "care",
    "feedback": "We can admit mistakes without inventing blame."
  },
  {
    "id": "church-39",
    "location": "church",
    "commandment": 8,
    "prompt": "A friend asks why another child missed class. You do not know. What can you say?",
    "choices": [
      {
        "id": "care",
        "text": "I do not know."
      },
      {
        "id": "other-a",
        "text": "Make up an interesting reason."
      },
      {
        "id": "other-b",
        "text": "Say they were punished without evidence."
      }
    ],
    "correctId": "care",
    "feedback": "Admitting what we do not know is honest."
  },
  {
    "id": "church-40",
    "location": "church",
    "commandment": 8,
    "prompt": "You promise to help set chairs but cannot come. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Tell the organizer promptly and apologize."
      },
      {
        "id": "other-a",
        "text": "Let them wait without a message."
      },
      {
        "id": "other-b",
        "text": "Say you helped when you did not."
      }
    ],
    "correctId": "care",
    "feedback": "Truthfulness includes clear communication about our commitments."
  },
  {
    "id": "church-41",
    "location": "church",
    "commandment": 9,
    "prompt": "At a marriage lesson, which thought respects another person's marriage?",
    "choices": [
      {
        "id": "care",
        "text": "I can wish this couple well instead of wanting to take someone's spouse."
      },
      {
        "id": "other-a",
        "text": "I should plan how to split this couple apart."
      },
      {
        "id": "other-b",
        "text": "I should think of a spouse as a prize to win."
      }
    ],
    "correctId": "care",
    "feedback": "The ninth commandment concerns desires in the heart, especially respecting marriage."
  },
  {
    "id": "church-42",
    "location": "church",
    "commandment": 9,
    "prompt": "A story character keeps wishing someone else's spouse would belong to them. What can you suggest?",
    "choices": [
      {
        "id": "care",
        "text": "Ask God for a heart that respects the couple's marriage."
      },
      {
        "id": "other-a",
        "text": "Keep feeding the wish until it becomes a plan."
      },
      {
        "id": "other-b",
        "text": "Pretend people can be owned like toys."
      }
    ],
    "correctId": "care",
    "feedback": "We can turn our desires toward respect for persons and marriage."
  },
  {
    "id": "church-43",
    "location": "church",
    "commandment": 9,
    "prompt": "You learn that a sudden unwanted thought is different from a chosen plan. What helps?",
    "choices": [
      {
        "id": "care",
        "text": "Let it pass and ask God for loving thoughts if needed."
      },
      {
        "id": "other-a",
        "text": "Believe every passing thought defines you."
      },
      {
        "id": "other-b",
        "text": "Keep repeating an unkind fantasy on purpose."
      }
    ],
    "correctId": "care",
    "feedback": "Purity of heart is about learning loving choices, not panicking over unwanted thoughts."
  },
  {
    "id": "church-44",
    "location": "church",
    "commandment": 9,
    "prompt": "Your catechist asks how to grow in purity of heart. What fits this lesson?",
    "choices": [
      {
        "id": "care",
        "text": "Ask God to help you see people with dignity, not as prizes."
      },
      {
        "id": "other-a",
        "text": "Collect wishes to take someone's spouse."
      },
      {
        "id": "other-b",
        "text": "Think people's value is only in their looks."
      }
    ],
    "correctId": "care",
    "feedback": "The ninth commandment teaches respect in our desires, not possession of people."
  },
  {
    "id": "church-45",
    "location": "church",
    "commandment": 9,
    "prompt": "A class story treats breaking a marriage as a happy prize. What can you discuss?",
    "choices": [
      {
        "id": "care",
        "text": "Why loving thoughts respect marriage rather than wish to undo it."
      },
      {
        "id": "other-a",
        "text": "Why other people's promises do not matter."
      },
      {
        "id": "other-b",
        "text": "Why wanting something always makes it right."
      }
    ],
    "correctId": "care",
    "feedback": "We can examine stories and choose desires that honor faithful love."
  },
  {
    "id": "church-46",
    "location": "church",
    "commandment": 10,
    "prompt": "Another child receives a beautiful rosary. What can you do with your jealous feeling?",
    "choices": [
      {
        "id": "care",
        "text": "Notice it, congratulate them, and thank God for your own gifts."
      },
      {
        "id": "other-a",
        "text": "Wish their rosary would break."
      },
      {
        "id": "other-b",
        "text": "Decide you deserve it more."
      }
    ],
    "correctId": "care",
    "feedback": "The tenth commandment helps us resist coveting possessions."
  },
  {
    "id": "church-47",
    "location": "church",
    "commandment": 10,
    "prompt": "A donor's name is on a plaque and you want the attention. What helps?",
    "choices": [
      {
        "id": "care",
        "text": "Remember generosity is not a competition for possessions or status."
      },
      {
        "id": "other-a",
        "text": "Wish the donor would lose everything."
      },
      {
        "id": "other-b",
        "text": "Refuse to help unless your name is bigger."
      }
    ],
    "correctId": "care",
    "feedback": "Gratitude and generosity can loosen our grip on wanting more."
  },
  {
    "id": "church-48",
    "location": "church",
    "commandment": 10,
    "prompt": "The parish raffle prize goes to someone else. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Be disappointed without wishing them harm or loss."
      },
      {
        "id": "other-a",
        "text": "Hope their prize is ruined."
      },
      {
        "id": "other-b",
        "text": "Say their happiness takes yours away."
      }
    ],
    "correctId": "care",
    "feedback": "We can enjoy others' good fortune without coveting their things."
  },
  {
    "id": "church-49",
    "location": "church",
    "commandment": 10,
    "prompt": "Your friend has a newer Bible bag. What thought can you practice?",
    "choices": [
      {
        "id": "care",
        "text": "Their bag can be nice without making mine worthless."
      },
      {
        "id": "other-a",
        "text": "I cannot be happy unless I own theirs."
      },
      {
        "id": "other-b",
        "text": "They should feel guilty for having it."
      }
    ],
    "correctId": "care",
    "feedback": "Contentment leaves room to appreciate someone else's belongings."
  },
  {
    "id": "church-50",
    "location": "church",
    "commandment": 10,
    "prompt": "A classmate has more craft supplies than you. What is a good next step?",
    "choices": [
      {
        "id": "care",
        "text": "Use what is available and ask fairly for what you need."
      },
      {
        "id": "other-a",
        "text": "Keep wishing the classmate loses theirs."
      },
      {
        "id": "other-b",
        "text": "Make owning the most supplies your only goal."
      }
    ],
    "correctId": "care",
    "feedback": "Gratitude does not prevent asking for needs; it helps us avoid resentful craving."
  },
  {
    "id": "home-01",
    "location": "home",
    "commandment": 1,
    "prompt": "You wake up worried about a test. What can begin your day with God?",
    "choices": [
      {
        "id": "care",
        "text": "Tell God your worries and ask for help to do your best."
      },
      {
        "id": "other-a",
        "text": "Treat a lucky sock as more powerful than God."
      },
      {
        "id": "other-b",
        "text": "Think prayer guarantees the highest mark."
      }
    ],
    "correctId": "care",
    "feedback": "Trust in God is not a bargain for perfect results."
  },
  {
    "id": "home-02",
    "location": "home",
    "commandment": 1,
    "prompt": "Your family sets aside a little prayer corner. What could you bring?",
    "choices": [
      {
        "id": "care",
        "text": "A picture that helps the family remember Jesus."
      },
      {
        "id": "other-a",
        "text": "A list of demands God must obey."
      },
      {
        "id": "other-b",
        "text": "A sign saying only perfect people may pray."
      }
    ],
    "correctId": "care",
    "feedback": "Prayer welcomes us into friendship with God, not control over him."
  },
  {
    "id": "home-03",
    "location": "home",
    "commandment": 1,
    "prompt": "A game keeps interrupting the family prayer time you agreed to. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Pause it and join the prayer."
      },
      {
        "id": "other-a",
        "text": "Say the game deserves all your attention forever."
      },
      {
        "id": "other-b",
        "text": "Pretend you are praying while secretly playing."
      }
    ],
    "correctId": "care",
    "feedback": "Putting God first can include giving prayer our attention."
  },
  {
    "id": "home-04",
    "location": "home",
    "commandment": 1,
    "prompt": "You have a difficult question about God. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask a trusted adult and keep learning."
      },
      {
        "id": "other-a",
        "text": "Decide questions mean you may never pray."
      },
      {
        "id": "other-b",
        "text": "Mock anyone who believes."
      }
    ],
    "correctId": "care",
    "feedback": "Faith can grow through sincere questions."
  },
  {
    "id": "home-05",
    "location": "home",
    "commandment": 1,
    "prompt": "Before dinner, your family gives thanks. What are you doing?",
    "choices": [
      {
        "id": "care",
        "text": "Recognizing God's gifts with gratitude."
      },
      {
        "id": "other-a",
        "text": "Paying God so no one gets sick."
      },
      {
        "id": "other-b",
        "text": "Proving your family is better than others."
      }
    ],
    "correctId": "care",
    "feedback": "Thanksgiving is a way of loving and worshiping God."
  },
  {
    "id": "home-06",
    "location": "home",
    "commandment": 2,
    "prompt": "You hear God's name used carelessly in a show. What can you choose?",
    "choices": [
      {
        "id": "care",
        "text": "Use respectful words yourself and discuss it with an adult."
      },
      {
        "id": "other-a",
        "text": "Copy it to sound older."
      },
      {
        "id": "other-b",
        "text": "Use it whenever you are annoyed."
      }
    ],
    "correctId": "care",
    "feedback": "Our own speech can honor God's holy name."
  },
  {
    "id": "home-07",
    "location": "home",
    "commandment": 2,
    "prompt": "You are angry when a tower falls. What could you say?",
    "choices": [
      {
        "id": "care",
        "text": "I am frustrated; I need a break."
      },
      {
        "id": "other-a",
        "text": "Use God's name as an angry shout."
      },
      {
        "id": "other-b",
        "text": "Make a joke insulting Jesus."
      }
    ],
    "correctId": "care",
    "feedback": "We can express strong feelings without misusing God's name."
  },
  {
    "id": "home-08",
    "location": "home",
    "commandment": 2,
    "prompt": "A sibling asks why your family says Jesus' name in prayer. What can you explain?",
    "choices": [
      {
        "id": "care",
        "text": "We speak to him with love and respect."
      },
      {
        "id": "other-a",
        "text": "His name is just a magic sound."
      },
      {
        "id": "other-b",
        "text": "We say it to win arguments."
      }
    ],
    "correctId": "care",
    "feedback": "Jesus' name belongs in reverent prayer, not magic or insults."
  },
  {
    "id": "home-09",
    "location": "home",
    "commandment": 2,
    "prompt": "Someone asks you to invent a message and say God told you. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Decline; I should not pretend my words came from God."
      },
      {
        "id": "other-a",
        "text": "Invent whatever gets attention."
      },
      {
        "id": "other-b",
        "text": "Use God's name to make people agree."
      }
    ],
    "correctId": "care",
    "feedback": "Respect for God's name includes not falsely claiming his authority."
  },
  {
    "id": "home-10",
    "location": "home",
    "commandment": 2,
    "prompt": "Your family learns the Sign of the Cross. What helps?",
    "choices": [
      {
        "id": "care",
        "text": "Say the words thoughtfully as you learn."
      },
      {
        "id": "other-a",
        "text": "Replace the sacred names with insults."
      },
      {
        "id": "other-b",
        "text": "Use the prayer to tease a sibling."
      }
    ],
    "correctId": "care",
    "feedback": "Prayer words name God with love and care."
  },
  {
    "id": "home-11",
    "location": "home",
    "commandment": 3,
    "prompt": "Saturday evening arrives and Sunday is crowded. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask your family to plan worship and some rest."
      },
      {
        "id": "other-a",
        "text": "Decide Sunday has no place for God."
      },
      {
        "id": "other-b",
        "text": "Hide the family calendar."
      }
    ],
    "correctId": "care",
    "feedback": "Planning helps Sunday remain a day for the Lord."
  },
  {
    "id": "home-12",
    "location": "home",
    "commandment": 3,
    "prompt": "Your parent must work a necessary Sunday shift. What is a kind response?",
    "choices": [
      {
        "id": "care",
        "text": "Help the family plan worship as they can and avoid judging."
      },
      {
        "id": "other-a",
        "text": "Say God no longer loves your parent."
      },
      {
        "id": "other-b",
        "text": "Demand they abandon people who need care."
      }
    ],
    "correctId": "care",
    "feedback": "Necessary work can limit rest; families can still seek ways to honor Sunday."
  },
  {
    "id": "home-13",
    "location": "home",
    "commandment": 3,
    "prompt": "On Sunday afternoon you have finished your needed chores. What could fit the day?",
    "choices": [
      {
        "id": "care",
        "text": "Enjoy a restful walk with family."
      },
      {
        "id": "other-a",
        "text": "Insist everyone must shop all afternoon."
      },
      {
        "id": "other-b",
        "text": "Say only sleeping all day counts as worship."
      }
    ],
    "correctId": "care",
    "feedback": "Rest and family joy accompany Sunday worship."
  },
  {
    "id": "home-14",
    "location": "home",
    "commandment": 3,
    "prompt": "You are recovering in bed on Sunday. What can you do if able?",
    "choices": [
      {
        "id": "care",
        "text": "Join a short prayer with your family."
      },
      {
        "id": "other-a",
        "text": "Blame yourself for being sick."
      },
      {
        "id": "other-b",
        "text": "Believe you must risk your health to prove faith."
      }
    ],
    "correctId": "care",
    "feedback": "Illness is not a failure of faith or a reason for shame."
  },
  {
    "id": "home-15",
    "location": "home",
    "commandment": 3,
    "prompt": "Your family wants to visit an isolated relative on Sunday. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Help make a kind visit after planning Mass."
      },
      {
        "id": "other-a",
        "text": "Say acts of care are forbidden on Sunday."
      },
      {
        "id": "other-b",
        "text": "Tell the relative they do not deserve company."
      }
    ],
    "correctId": "care",
    "feedback": "The Lord's Day can include works of mercy."
  },
  {
    "id": "home-16",
    "location": "home",
    "commandment": 4,
    "prompt": "A parent asks you to put away your toys before dinner. What is helpful?",
    "choices": [
      {
        "id": "care",
        "text": "Start tidying and ask for help if needed."
      },
      {
        "id": "other-a",
        "text": "Throw the toys to show anger."
      },
      {
        "id": "other-b",
        "text": "Pretend not to hear every reminder."
      }
    ],
    "correctId": "care",
    "feedback": "Reasonable family responsibilities are a way to honor parents."
  },
  {
    "id": "home-17",
    "location": "home",
    "commandment": 4,
    "prompt": "A caregiver gives a rule you do not understand. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask calmly for an explanation."
      },
      {
        "id": "other-a",
        "text": "Insult them before listening."
      },
      {
        "id": "other-b",
        "text": "Break it secretly just to prove a point."
      }
    ],
    "correctId": "care",
    "feedback": "Respectful questions help families understand each other."
  },
  {
    "id": "home-18",
    "location": "home",
    "commandment": 4,
    "prompt": "An adult tells you to keep a frightening touch secret. What should you do?",
    "choices": [
      {
        "id": "care",
        "text": "Get away if possible and tell a safe trusted adult."
      },
      {
        "id": "other-a",
        "text": "Stay silent because all adults must be obeyed."
      },
      {
        "id": "other-b",
        "text": "Believe you caused it."
      }
    ],
    "correctId": "care",
    "feedback": "No child owes obedience to abuse or secrecy about harm."
  },
  {
    "id": "home-19",
    "location": "home",
    "commandment": 4,
    "prompt": "Your parents disagree loudly and you feel afraid. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Go somewhere safe and seek a trusted adult's support."
      },
      {
        "id": "other-a",
        "text": "Believe it is your job to fix their marriage."
      },
      {
        "id": "other-b",
        "text": "Think their argument is your fault."
      }
    ],
    "correctId": "care",
    "feedback": "Children are not responsible for adults' relationship problems."
  },
  {
    "id": "home-20",
    "location": "home",
    "commandment": 4,
    "prompt": "Your grandparent repeats a story. What can show respect?",
    "choices": [
      {
        "id": "care",
        "text": "Listen kindly or politely explain if you need a break."
      },
      {
        "id": "other-a",
        "text": "Call them useless."
      },
      {
        "id": "other-b",
        "text": "Mock them with your siblings."
      }
    ],
    "correctId": "care",
    "feedback": "Respect includes patience and gentle honesty."
  },
  {
    "id": "home-21",
    "location": "home",
    "commandment": 5,
    "prompt": "Your sibling reaches for a hot pan. What can you do safely?",
    "choices": [
      {
        "id": "care",
        "text": "Warn them and get an adult quickly."
      },
      {
        "id": "other-a",
        "text": "Dare them to touch it."
      },
      {
        "id": "other-b",
        "text": "Wait to see if they get hurt."
      }
    ],
    "correctId": "care",
    "feedback": "Care for life includes preventing danger safely."
  },
  {
    "id": "home-22",
    "location": "home",
    "commandment": 5,
    "prompt": "You feel like hitting after an argument. What is a better choice?",
    "choices": [
      {
        "id": "care",
        "text": "Move back, breathe, and ask for help."
      },
      {
        "id": "other-a",
        "text": "Hit first so you win."
      },
      {
        "id": "other-b",
        "text": "Throw something near their head."
      }
    ],
    "correctId": "care",
    "feedback": "Anger does not require violence; help is available."
  },
  {
    "id": "home-23",
    "location": "home",
    "commandment": 7,
    "prompt": "A pet needs clean water. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Tell the responsible adult and help fill its bowl safely."
      },
      {
        "id": "other-a",
        "text": "Ignore it as a joke."
      },
      {
        "id": "other-b",
        "text": "Hide the bowl to punish it."
      }
    ],
    "correctId": "care",
    "feedback": "We practice responsible care for living creatures."
  },
  {
    "id": "home-24",
    "location": "home",
    "commandment": 5,
    "prompt": "You see a message telling someone to hurt themselves. What should you do?",
    "choices": [
      {
        "id": "care",
        "text": "Tell a trusted adult right away."
      },
      {
        "id": "other-a",
        "text": "Forward it for fun."
      },
      {
        "id": "other-b",
        "text": "Tell the person they are too sensitive."
      }
    ],
    "correctId": "care",
    "feedback": "Threats to life need caring adult help, not secrecy or blame."
  },
  {
    "id": "home-25",
    "location": "home",
    "commandment": 5,
    "prompt": "A family member needs quiet while ill. What helps?",
    "choices": [
      {
        "id": "care",
        "text": "Lower the volume and ask how you can help."
      },
      {
        "id": "other-a",
        "text": "Make noise to test their patience."
      },
      {
        "id": "other-b",
        "text": "Laugh at their pain."
      }
    ],
    "correctId": "care",
    "feedback": "Respect for life includes gentle care for people who are suffering."
  },
  {
    "id": "home-26",
    "location": "home",
    "commandment": 6,
    "prompt": "Your parents celebrate a wedding anniversary. What does it remember?",
    "choices": [
      {
        "id": "care",
        "text": "Their promise of faithful married love."
      },
      {
        "id": "other-a",
        "text": "A promise that ends when presents run out."
      },
      {
        "id": "other-b",
        "text": "A contest against other families."
      }
    ],
    "correctId": "care",
    "feedback": "The sixth commandment protects faithful marriage promises."
  },
  {
    "id": "home-27",
    "location": "home",
    "commandment": 6,
    "prompt": "A storybook spouse hides a second romantic relationship. What is the honest lesson?",
    "choices": [
      {
        "id": "care",
        "text": "Faithfulness means respecting the marriage promise."
      },
      {
        "id": "other-a",
        "text": "Secrecy makes any choice loving."
      },
      {
        "id": "other-b",
        "text": "A spouse is replaceable whenever someone is bored."
      }
    ],
    "correctId": "care",
    "feedback": "Marriage calls spouses to faithful love, not hidden relationships."
  },
  {
    "id": "home-28",
    "location": "home",
    "commandment": 6,
    "prompt": "You find an old wedding photo of grandparents. What could you ask about?",
    "choices": [
      {
        "id": "care",
        "text": "How they learned to care faithfully for one another."
      },
      {
        "id": "other-a",
        "text": "Which spouse won the marriage."
      },
      {
        "id": "other-b",
        "text": "Why wedding promises never matter later."
      }
    ],
    "correctId": "care",
    "feedback": "Stories of married love can teach us about faithfulness."
  },
  {
    "id": "home-29",
    "location": "home",
    "commandment": 6,
    "prompt": "A family friend says illness makes a spouse less worthy of love. What can you remember?",
    "choices": [
      {
        "id": "care",
        "text": "A person's worth does not disappear in illness."
      },
      {
        "id": "other-a",
        "text": "Only healthy people deserve faithful love."
      },
      {
        "id": "other-b",
        "text": "Promises are only for easy days."
      }
    ],
    "correctId": "care",
    "feedback": "Faithful married love honors a person's lasting dignity."
  },
  {
    "id": "home-30",
    "location": "home",
    "commandment": 6,
    "prompt": "A child says their parents' separation is their own fault. What is a caring response?",
    "choices": [
      {
        "id": "care",
        "text": "Children are not responsible for adults' marriage choices."
      },
      {
        "id": "other-a",
        "text": "Tell them to repair the marriage alone."
      },
      {
        "id": "other-b",
        "text": "Say they must have caused it."
      }
    ],
    "correctId": "care",
    "feedback": "Marriage is an adult responsibility; children deserve care and safety in every family."
  },
  {
    "id": "home-31",
    "location": "home",
    "commandment": 7,
    "prompt": "You borrow your sibling's charger. What should you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask first and return it as agreed."
      },
      {
        "id": "other-a",
        "text": "Keep it because yours is missing."
      },
      {
        "id": "other-b",
        "text": "Deny borrowing it."
      }
    ],
    "correctId": "care",
    "feedback": "Borrowing is different from taking without permission."
  },
  {
    "id": "home-32",
    "location": "home",
    "commandment": 7,
    "prompt": "A delivery arrives for a neighbor. What can your family do?",
    "choices": [
      {
        "id": "care",
        "text": "Keep it safe and tell the neighbor or delivery service."
      },
      {
        "id": "other-a",
        "text": "Open it to see if it is useful."
      },
      {
        "id": "other-b",
        "text": "Remove the label and keep it."
      }
    ],
    "correctId": "care",
    "feedback": "A mistaken delivery still belongs to someone else."
  },
  {
    "id": "home-33",
    "location": "home",
    "commandment": 7,
    "prompt": "You break a borrowed puzzle piece. What is fair?",
    "choices": [
      {
        "id": "care",
        "text": "Tell its owner and offer help making it right."
      },
      {
        "id": "other-a",
        "text": "Hide it in the box."
      },
      {
        "id": "other-b",
        "text": "Say it was broken already when it was not."
      }
    ],
    "correctId": "care",
    "feedback": "Respecting property includes responsibility for damage."
  },
  {
    "id": "home-34",
    "location": "home",
    "commandment": 7,
    "prompt": "A sibling has saved money in a jar. You want a snack. What is right?",
    "choices": [
      {
        "id": "care",
        "text": "Ask about sharing or use your own money."
      },
      {
        "id": "other-a",
        "text": "Take a little because they will not notice."
      },
      {
        "id": "other-b",
        "text": "Call it borrowing without telling them."
      }
    ],
    "correctId": "care",
    "feedback": "We need permission before using another person's money."
  },
  {
    "id": "home-35",
    "location": "home",
    "commandment": 7,
    "prompt": "Your family sorts things to donate. What should you choose?",
    "choices": [
      {
        "id": "care",
        "text": "Offer your own things with an adult's guidance."
      },
      {
        "id": "other-a",
        "text": "Give away your sibling's favorites secretly."
      },
      {
        "id": "other-b",
        "text": "Take back donations meant for another family."
      }
    ],
    "correctId": "care",
    "feedback": "Generosity must respect who owns the things we give."
  },
  {
    "id": "home-36",
    "location": "home",
    "commandment": 8,
    "prompt": "You spill juice on a book. What can you say?",
    "choices": [
      {
        "id": "care",
        "text": "I spilled it; can we dry it together?"
      },
      {
        "id": "other-a",
        "text": "The dog did it, though it did not."
      },
      {
        "id": "other-b",
        "text": "Nothing happened while hiding the stain."
      }
    ],
    "correctId": "care",
    "feedback": "The truth allows repair and support."
  },
  {
    "id": "home-37",
    "location": "home",
    "commandment": 8,
    "prompt": "A sibling asks you to back up a false story. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Decline to lie and encourage telling the truth."
      },
      {
        "id": "other-a",
        "text": "Agree so nobody is upset."
      },
      {
        "id": "other-b",
        "text": "Invent more details for them."
      }
    ],
    "correctId": "care",
    "feedback": "Loyalty does not require dishonest words."
  },
  {
    "id": "home-38",
    "location": "home",
    "commandment": 8,
    "prompt": "You accidentally open a private letter. What is respectful?",
    "choices": [
      {
        "id": "care",
        "text": "Close it and tell the owner honestly."
      },
      {
        "id": "other-a",
        "text": "Read it aloud to everyone."
      },
      {
        "id": "other-b",
        "text": "Make up a rumor from what you saw."
      }
    ],
    "correctId": "care",
    "feedback": "Truthfulness and respect for privacy belong together."
  },
  {
    "id": "home-39",
    "location": "home",
    "commandment": 8,
    "prompt": "You did not finish a chore. What should you tell your parent?",
    "choices": [
      {
        "id": "care",
        "text": "It is not done yet; I will start now."
      },
      {
        "id": "other-a",
        "text": "I finished it perfectly."
      },
      {
        "id": "other-b",
        "text": "Another child stopped me when they did not."
      }
    ],
    "correctId": "care",
    "feedback": "An honest answer is better than an excuse built on a lie."
  },
  {
    "id": "home-40",
    "location": "home",
    "commandment": 8,
    "prompt": "You are asked to tell a family member's medical news to visitors. You lack permission. What can you say?",
    "choices": [
      {
        "id": "care",
        "text": "Please ask them what they want to share."
      },
      {
        "id": "other-a",
        "text": "Reveal everything to seem informed."
      },
      {
        "id": "other-b",
        "text": "Invent a different diagnosis."
      }
    ],
    "correctId": "care",
    "feedback": "Truth does not require sharing private information with everyone."
  },
  {
    "id": "home-41",
    "location": "home",
    "commandment": 9,
    "prompt": "In a family story, a character wishes to take someone else's spouse. What thought would be better?",
    "choices": [
      {
        "id": "care",
        "text": "Respect their marriage and pray for a loving heart."
      },
      {
        "id": "other-a",
        "text": "Plan ways to break their promise apart."
      },
      {
        "id": "other-b",
        "text": "Treat the spouse as something to collect."
      }
    ],
    "correctId": "care",
    "feedback": "The ninth commandment concerns our chosen desires, especially about marriage."
  },
  {
    "id": "home-42",
    "location": "home",
    "commandment": 9,
    "prompt": "You hear that purity of heart means loving people as people. What fits?",
    "choices": [
      {
        "id": "care",
        "text": "Respect a married person's commitment instead of wishing to possess them."
      },
      {
        "id": "other-a",
        "text": "Think a spouse is a prize you deserve."
      },
      {
        "id": "other-b",
        "text": "Feed a wish to replace someone else's spouse."
      }
    ],
    "correctId": "care",
    "feedback": "People and marriages are not possessions for us to covet."
  },
  {
    "id": "home-43",
    "location": "home",
    "commandment": 9,
    "prompt": "An unwanted upsetting thought pops into your mind. What helps?",
    "choices": [
      {
        "id": "care",
        "text": "Let it pass and talk with a trusted adult if worried."
      },
      {
        "id": "other-a",
        "text": "Think one passing thought makes you bad."
      },
      {
        "id": "other-b",
        "text": "Choose to rehearse it until it controls your choices."
      }
    ],
    "correctId": "care",
    "feedback": "Unwanted thoughts are not the same as chosen desires or actions."
  },
  {
    "id": "home-44",
    "location": "home",
    "commandment": 9,
    "prompt": "A TV story praises wanting another person's spouse. What could your family discuss?",
    "choices": [
      {
        "id": "care",
        "text": "How a pure heart can wish the couple well rather than desire their breakup."
      },
      {
        "id": "other-a",
        "text": "How wanting something always makes it right."
      },
      {
        "id": "other-b",
        "text": "How promises only matter if someone is watching."
      }
    ],
    "correctId": "care",
    "feedback": "We can learn to shape our desires toward faithful love."
  },
  {
    "id": "home-45",
    "location": "home",
    "commandment": 9,
    "prompt": "A child confuses wanting a neighbor's bike with wanting a neighbor's spouse. What can you clarify?",
    "choices": [
      {
        "id": "care",
        "text": "Possessions relate to the tenth; the ninth especially respects marriage in our hearts."
      },
      {
        "id": "other-a",
        "text": "Every kind of envy is only the ninth."
      },
      {
        "id": "other-b",
        "text": "The ninth says bikes are more important than people."
      }
    ],
    "correctId": "care",
    "feedback": "Catholic numbering distinguishes coveting possessions from coveting a spouse."
  },
  {
    "id": "home-46",
    "location": "home",
    "commandment": 10,
    "prompt": "A cousin gets a bigger birthday gift. What can you practice?",
    "choices": [
      {
        "id": "care",
        "text": "Be glad for them and notice good things in your own life."
      },
      {
        "id": "other-a",
        "text": "Wish their gift would disappear."
      },
      {
        "id": "other-b",
        "text": "Say you cannot love them until gifts are equal."
      }
    ],
    "correctId": "care",
    "feedback": "Jealous feelings can pass without becoming resentful wishes."
  },
  {
    "id": "home-47",
    "location": "home",
    "commandment": 10,
    "prompt": "Your friend has a huge bedroom. What thought is healthier?",
    "choices": [
      {
        "id": "care",
        "text": "I can admire it without resenting my own home."
      },
      {
        "id": "other-a",
        "text": "Their happiness steals mine."
      },
      {
        "id": "other-b",
        "text": "I need their room before I can be kind."
      }
    ],
    "correctId": "care",
    "feedback": "Contentment helps us avoid coveting others' possessions."
  },
  {
    "id": "home-48",
    "location": "home",
    "commandment": 10,
    "prompt": "An advertisement makes you feel your toys are worthless. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Pause and remember what you already enjoy."
      },
      {
        "id": "other-a",
        "text": "Demand every advertised item."
      },
      {
        "id": "other-b",
        "text": "Decide people with more things matter more."
      }
    ],
    "correctId": "care",
    "feedback": "A person's worth is not measured by belongings."
  },
  {
    "id": "home-49",
    "location": "home",
    "commandment": 10,
    "prompt": "You wish your sibling's prize were yours. What helps?",
    "choices": [
      {
        "id": "care",
        "text": "Name the feeling and congratulate them anyway."
      },
      {
        "id": "other-a",
        "text": "Hope they lose it."
      },
      {
        "id": "other-b",
        "text": "Try to make them feel guilty for winning."
      }
    ],
    "correctId": "care",
    "feedback": "The tenth commandment invites gratitude rather than resentful craving."
  },
  {
    "id": "home-50",
    "location": "home",
    "commandment": 10,
    "prompt": "A neighbor's new tablet makes you jealous. What is a good response?",
    "choices": [
      {
        "id": "care",
        "text": "Ask for what you need without wishing to take their good things."
      },
      {
        "id": "other-a",
        "text": "Spend the day wishing it breaks."
      },
      {
        "id": "other-b",
        "text": "Decide fairness means nobody can own anything nice."
      }
    ],
    "correctId": "care",
    "feedback": "We can express needs without coveting another person's possessions."
  },
  {
    "id": "school-01",
    "location": "school",
    "commandment": 1,
    "prompt": "Your Catholic class begins with prayer. How can you join thoughtfully?",
    "choices": [
      {
        "id": "care",
        "text": "Listen and offer a simple prayer to God."
      },
      {
        "id": "other-a",
        "text": "Treat prayer as a contest for attention."
      },
      {
        "id": "other-b",
        "text": "Assume God only listens to the loudest child."
      }
    ],
    "correctId": "care",
    "feedback": "God welcomes sincere prayer rather than a performance."
  },
  {
    "id": "school-02",
    "location": "school",
    "commandment": 1,
    "prompt": "A school friend says winning marks is more important than anything, even God. What can you remember?",
    "choices": [
      {
        "id": "care",
        "text": "Learning matters, but God is not replaced by grades."
      },
      {
        "id": "other-a",
        "text": "The highest mark makes someone a god."
      },
      {
        "id": "other-b",
        "text": "God only values the top pupil."
      }
    ],
    "correctId": "care",
    "feedback": "Our achievements do not replace worship or determine God's love."
  },
  {
    "id": "school-03",
    "location": "school",
    "commandment": 1,
    "prompt": "You need help understanding a prayer. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask your teacher what the words mean."
      },
      {
        "id": "other-a",
        "text": "Pretend a charm will do the praying for you."
      },
      {
        "id": "other-b",
        "text": "Say learning about God is only for adults."
      }
    ],
    "correctId": "care",
    "feedback": "We can grow in faith through thoughtful learning."
  },
  {
    "id": "school-04",
    "location": "school",
    "commandment": 1,
    "prompt": "A friend calls a classroom mascot the power that controls everyone's future. What can you say?",
    "choices": [
      {
        "id": "care",
        "text": "A mascot can be fun without replacing trust in God."
      },
      {
        "id": "other-a",
        "text": "We must obey the mascot above God."
      },
      {
        "id": "other-b",
        "text": "Anyone without the mascot is hopeless."
      }
    ],
    "correctId": "care",
    "feedback": "Playful objects need not become things we treat as gods."
  },
  {
    "id": "school-05",
    "location": "school",
    "commandment": 2,
    "prompt": "A friend writes God's name inside a mean joke. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask them kindly not to use his name that way."
      },
      {
        "id": "other-a",
        "text": "Add a more insulting line."
      },
      {
        "id": "other-b",
        "text": "Use God's name to threaten them."
      }
    ],
    "correctId": "care",
    "feedback": "Reverence can be expressed calmly and kindly."
  },
  {
    "id": "school-06",
    "location": "school",
    "commandment": 2,
    "prompt": "Your group is making a prayer poster. What should you check?",
    "choices": [
      {
        "id": "care",
        "text": "That the sacred words are written respectfully."
      },
      {
        "id": "other-a",
        "text": "That God's name is made into a rude slogan."
      },
      {
        "id": "other-b",
        "text": "That your poster claims God favors your group alone."
      }
    ],
    "correctId": "care",
    "feedback": "Respecting God's name includes how we write it."
  },
  {
    "id": "school-07",
    "location": "school",
    "commandment": 2,
    "prompt": "A student says God told them everyone must give them prizes. What is wise?",
    "choices": [
      {
        "id": "care",
        "text": "Ask a teacher for help instead of accepting that claim."
      },
      {
        "id": "other-a",
        "text": "Hand over everything because they used God's name."
      },
      {
        "id": "other-b",
        "text": "Repeat the claim to frighten younger pupils."
      }
    ],
    "correctId": "care",
    "feedback": "We should not use claims about God to manipulate others."
  },
  {
    "id": "school-08",
    "location": "school",
    "commandment": 2,
    "prompt": "A school skit includes a careless oath in God's name. What could you suggest?",
    "choices": [
      {
        "id": "care",
        "text": "Use an honest ordinary promise instead."
      },
      {
        "id": "other-a",
        "text": "Add God's name to every silly line."
      },
      {
        "id": "other-b",
        "text": "Say an oath makes any lie true."
      }
    ],
    "correctId": "care",
    "feedback": "Ordinary truthful words do not need careless sacred oaths."
  },
  {
    "id": "school-09",
    "location": "school",
    "commandment": 3,
    "prompt": "A homework project fills your weekend. What can help before Sunday?",
    "choices": [
      {
        "id": "care",
        "text": "Make a plan with your family that includes Mass and rest."
      },
      {
        "id": "other-a",
        "text": "Secretly decide worship never matters."
      },
      {
        "id": "other-b",
        "text": "Insist nobody may rest until your project is perfect."
      }
    ],
    "correctId": "care",
    "feedback": "Wise planning makes space for the Lord's Day."
  },
  {
    "id": "school-10",
    "location": "school",
    "commandment": 3,
    "prompt": "Your Catholic class discusses Sunday. Which answer fits?",
    "choices": [
      {
        "id": "care",
        "text": "It is a day for worship, appropriate rest, and loving care."
      },
      {
        "id": "other-a",
        "text": "It is only a day to buy as much as possible."
      },
      {
        "id": "other-b",
        "text": "It forbids every act of helping."
      }
    ],
    "correctId": "care",
    "feedback": "Sunday includes joy and mercy as well as worship."
  },
  {
    "id": "school-11",
    "location": "school",
    "commandment": 3,
    "prompt": "A friend misses Sunday Mass because they are seriously ill. What is a kind thought?",
    "choices": [
      {
        "id": "care",
        "text": "Illness can excuse attendance; do not judge them."
      },
      {
        "id": "other-a",
        "text": "They must be worse than everyone else."
      },
      {
        "id": "other-b",
        "text": "God cannot love anyone in bed."
      }
    ],
    "correctId": "care",
    "feedback": "We should not shame people whose illness prevents attendance."
  },
  {
    "id": "school-12",
    "location": "school",
    "commandment": 3,
    "prompt": "A group project meeting conflicts with your family's Sunday worship. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask the group and an adult about another workable time."
      },
      {
        "id": "other-a",
        "text": "Lie that you finished the whole project."
      },
      {
        "id": "other-b",
        "text": "Say your needs mean everyone else is bad."
      }
    ],
    "correctId": "care",
    "feedback": "Respectful planning can protect time for worship without judging others."
  },
  {
    "id": "school-13",
    "location": "school",
    "commandment": 4,
    "prompt": "Your parent asks to see a school notice. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Bring it home and explain what it says."
      },
      {
        "id": "other-a",
        "text": "Hide it because it is inconvenient."
      },
      {
        "id": "other-b",
        "text": "Say there was no notice."
      }
    ],
    "correctId": "care",
    "feedback": "Honoring parents includes helping them care for your needs."
  },
  {
    "id": "school-14",
    "location": "school",
    "commandment": 4,
    "prompt": "Your teacher gives a safety instruction during a drill. What is right?",
    "choices": [
      {
        "id": "care",
        "text": "Follow the safe direction calmly."
      },
      {
        "id": "other-a",
        "text": "Push ahead to be first."
      },
      {
        "id": "other-b",
        "text": "Treat the drill as a chance to frighten others."
      }
    ],
    "correctId": "care",
    "feedback": "We respect legitimate authority that protects people."
  },
  {
    "id": "school-15",
    "location": "school",
    "commandment": 4,
    "prompt": "You disagree with a classroom rule. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask politely at an appropriate time."
      },
      {
        "id": "other-a",
        "text": "Call the teacher names."
      },
      {
        "id": "other-b",
        "text": "Encourage everyone to break it secretly."
      }
    ],
    "correctId": "care",
    "feedback": "Respectful disagreement is different from contempt."
  },
  {
    "id": "school-16",
    "location": "school",
    "commandment": 4,
    "prompt": "Someone says adults must always be obeyed, even in harm. What should you know?",
    "choices": [
      {
        "id": "care",
        "text": "You can refuse harm and tell a safe trusted adult."
      },
      {
        "id": "other-a",
        "text": "Harm must be accepted silently."
      },
      {
        "id": "other-b",
        "text": "A child's safety matters less than keeping secrets."
      }
    ],
    "correctId": "care",
    "feedback": "Legitimate authority never requires a child to accept abuse."
  },
  {
    "id": "school-17",
    "location": "school",
    "commandment": 4,
    "prompt": "Your caregiver cannot attend a school event. What can help?",
    "choices": [
      {
        "id": "care",
        "text": "Ask if you can share what happened later."
      },
      {
        "id": "other-a",
        "text": "Say their absence proves they do not love you."
      },
      {
        "id": "other-b",
        "text": "Try to punish them with cruel words."
      }
    ],
    "correctId": "care",
    "feedback": "Respect can include expressing disappointment without assuming the worst."
  },
  {
    "id": "school-18",
    "location": "school",
    "commandment": 4,
    "prompt": "A classmate lives with a grandparent. What is respectful?",
    "choices": [
      {
        "id": "care",
        "text": "Include their caregiver when speaking about families."
      },
      {
        "id": "other-a",
        "text": "Say only one kind of household deserves respect."
      },
      {
        "id": "other-b",
        "text": "Make fun of who signs their forms."
      }
    ],
    "correctId": "care",
    "feedback": "We honor the people who responsibly care for children."
  },
  {
    "id": "school-19",
    "location": "school",
    "commandment": 5,
    "prompt": "A pupil is shoved near the stairs. What can you do safely?",
    "choices": [
      {
        "id": "care",
        "text": "Get a teacher's help and check whether they need support."
      },
      {
        "id": "other-a",
        "text": "Shove the other pupil harder."
      },
      {
        "id": "other-b",
        "text": "Film it for laughs."
      }
    ],
    "correctId": "care",
    "feedback": "Protection from violence matters more than revenge or entertainment."
  },
  {
    "id": "school-20",
    "location": "school",
    "commandment": 5,
    "prompt": "You see a classmate being bullied every day. What is helpful?",
    "choices": [
      {
        "id": "care",
        "text": "Tell a trusted adult and stand with them safely."
      },
      {
        "id": "other-a",
        "text": "Tell them it is their fault."
      },
      {
        "id": "other-b",
        "text": "Join the teasing to avoid becoming a target."
      }
    ],
    "correctId": "care",
    "feedback": "Everyone deserves dignity and protection from bullying."
  },
  {
    "id": "school-21",
    "location": "school",
    "commandment": 5,
    "prompt": "You are very upset after a test. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask for support and take a calming pause."
      },
      {
        "id": "other-a",
        "text": "Hit your desk mate."
      },
      {
        "id": "other-b",
        "text": "Decide a mark makes your life worthless."
      }
    ],
    "correctId": "care",
    "feedback": "Your life and dignity are greater than any school result."
  },
  {
    "id": "school-22",
    "location": "school",
    "commandment": 5,
    "prompt": "A classmate has a serious food allergy. What helps at lunch?",
    "choices": [
      {
        "id": "care",
        "text": "Follow the school safety plan and get help if needed."
      },
      {
        "id": "other-a",
        "text": "Offer the food as a dare."
      },
      {
        "id": "other-b",
        "text": "Say allergies are just attention seeking."
      }
    ],
    "correctId": "care",
    "feedback": "Respect for life includes taking health needs seriously."
  },
  {
    "id": "school-23",
    "location": "school",
    "commandment": 5,
    "prompt": "A student feels left out because of a disability. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask how to make the activity accessible with the teacher."
      },
      {
        "id": "other-a",
        "text": "Say they should watch forever."
      },
      {
        "id": "other-b",
        "text": "Move their equipment without asking."
      }
    ],
    "correctId": "care",
    "feedback": "Inclusion respects dignity and listens to what people need."
  },
  {
    "id": "school-24",
    "location": "school",
    "commandment": 5,
    "prompt": "Someone writes a threatening message on a desk. What should you do?",
    "choices": [
      {
        "id": "care",
        "text": "Tell a trusted school adult promptly."
      },
      {
        "id": "other-a",
        "text": "Copy it onto someone else's desk."
      },
      {
        "id": "other-b",
        "text": "Treat every threat as harmless fun."
      }
    ],
    "correctId": "care",
    "feedback": "Threats should be taken to responsible adults for safety."
  },
  {
    "id": "school-25",
    "location": "school",
    "commandment": 7,
    "prompt": "A class pet looks unwell. What is responsible?",
    "choices": [
      {
        "id": "care",
        "text": "Tell the teacher and follow care instructions."
      },
      {
        "id": "other-a",
        "text": "Shake its cage to wake it."
      },
      {
        "id": "other-b",
        "text": "Hide the problem to avoid work."
      }
    ],
    "correctId": "care",
    "feedback": "Living creatures need careful, responsible care."
  },
  {
    "id": "school-26",
    "location": "school",
    "commandment": 6,
    "prompt": "Your religion class learns about wedding vows. What do the vows mean?",
    "choices": [
      {
        "id": "care",
        "text": "Spouses promise faithful love to one another."
      },
      {
        "id": "other-a",
        "text": "Spouses promise only to keep receiving gifts."
      },
      {
        "id": "other-b",
        "text": "Spouses promise to agree on every tiny opinion."
      }
    ],
    "correctId": "care",
    "feedback": "Marriage faithfulness is deeper than gifts or identical opinions."
  },
  {
    "id": "school-27",
    "location": "school",
    "commandment": 6,
    "prompt": "A class story says marriage is disposable whenever someone gets bored. What could you discuss?",
    "choices": [
      {
        "id": "care",
        "text": "Why marriage promises deserve faithful care."
      },
      {
        "id": "other-a",
        "text": "Why boredom cancels every promise."
      },
      {
        "id": "other-b",
        "text": "Why a spouse is like a toy to replace."
      }
    ],
    "correctId": "care",
    "feedback": "The sixth commandment protects marriage and faithful love."
  },
  {
    "id": "school-28",
    "location": "school",
    "commandment": 7,
    "prompt": "You find a friend's pencil case after class. What is right?",
    "choices": [
      {
        "id": "care",
        "text": "Return it to the friend or teacher."
      },
      {
        "id": "other-a",
        "text": "Keep it until they buy you a treat."
      },
      {
        "id": "other-b",
        "text": "Remove the name sticker."
      }
    ],
    "correctId": "care",
    "feedback": "The case still belongs to your friend."
  },
  {
    "id": "school-29",
    "location": "school",
    "commandment": 7,
    "prompt": "You borrow a library book. How do you care for it?",
    "choices": [
      {
        "id": "care",
        "text": "Keep it safe and return it on time."
      },
      {
        "id": "other-a",
        "text": "Cut out the pictures you like."
      },
      {
        "id": "other-b",
        "text": "Lend it away without tracking it."
      }
    ],
    "correctId": "care",
    "feedback": "Shared resources need thoughtful care so others can use them."
  },
  {
    "id": "school-30",
    "location": "school",
    "commandment": 7,
    "prompt": "You want to use a classmate's art markers. What should you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask permission and accept their answer."
      },
      {
        "id": "other-a",
        "text": "Take them while they are away."
      },
      {
        "id": "other-b",
        "text": "Say friendship means they cannot refuse."
      }
    ],
    "correctId": "care",
    "feedback": "Respect for property includes permission, even among friends."
  },
  {
    "id": "school-31",
    "location": "school",
    "commandment": 7,
    "prompt": "A school tablet screen cracks while you use it. What is right?",
    "choices": [
      {
        "id": "care",
        "text": "Tell the teacher accurately what happened."
      },
      {
        "id": "other-a",
        "text": "Hide it in another student's desk."
      },
      {
        "id": "other-b",
        "text": "Scratch another tablet so nobody notices."
      }
    ],
    "correctId": "care",
    "feedback": "Taking responsibility protects shared property and other pupils."
  },
  {
    "id": "school-32",
    "location": "school",
    "commandment": 7,
    "prompt": "The shop gives you too much change on a class trip. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Tell the adult and return the extra money."
      },
      {
        "id": "other-a",
        "text": "Keep it because it was their mistake."
      },
      {
        "id": "other-b",
        "text": "Give it to a friend to hide."
      }
    ],
    "correctId": "care",
    "feedback": "A mistake does not turn another person's money into ours."
  },
  {
    "id": "school-33",
    "location": "school",
    "commandment": 7,
    "prompt": "Your group has one glue stick left. What is fair?",
    "choices": [
      {
        "id": "care",
        "text": "Share it according to the group's plan."
      },
      {
        "id": "other-a",
        "text": "Hide it so only you can finish."
      },
      {
        "id": "other-b",
        "text": "Claim it belongs to you because you saw it first."
      }
    ],
    "correctId": "care",
    "feedback": "Shared property should serve the group fairly."
  },
  {
    "id": "school-34",
    "location": "school",
    "commandment": 7,
    "prompt": "You download a classmate's drawing for your project. What is respectful?",
    "choices": [
      {
        "id": "care",
        "text": "Ask permission and give credit as the teacher directs."
      },
      {
        "id": "other-a",
        "text": "Put your name on it as your own drawing."
      },
      {
        "id": "other-b",
        "text": "Sell copies without asking."
      }
    ],
    "correctId": "care",
    "feedback": "Respecting another's work is also respect for what belongs to them."
  },
  {
    "id": "school-35",
    "location": "school",
    "commandment": 8,
    "prompt": "You forgot to study and someone offers exam answers. What should you do?",
    "choices": [
      {
        "id": "care",
        "text": "Do your own work and ask for help learning afterward."
      },
      {
        "id": "other-a",
        "text": "Copy them and claim the work is yours."
      },
      {
        "id": "other-b",
        "text": "Hide a second answer sheet."
      }
    ],
    "correctId": "care",
    "feedback": "Honest learning matters more than a dishonest mark."
  },
  {
    "id": "school-36",
    "location": "school",
    "commandment": 8,
    "prompt": "You hear a rumor that a pupil cheated. What is right?",
    "choices": [
      {
        "id": "care",
        "text": "Do not spread it; let a responsible teacher handle concerns."
      },
      {
        "id": "other-a",
        "text": "Tell the class it is proven."
      },
      {
        "id": "other-b",
        "text": "Invent a witness."
      }
    ],
    "correctId": "care",
    "feedback": "We must not damage a person's name with unverified accusations."
  },
  {
    "id": "school-37",
    "location": "school",
    "commandment": 8,
    "prompt": "Your experiment has an unexpected result. What should you record?",
    "choices": [
      {
        "id": "care",
        "text": "What actually happened."
      },
      {
        "id": "other-a",
        "text": "Change the numbers to match your hope."
      },
      {
        "id": "other-b",
        "text": "Copy another group's result as yours."
      }
    ],
    "correctId": "care",
    "feedback": "Truthfulness includes accurate work, not just convenient answers."
  },
  {
    "id": "school-38",
    "location": "school",
    "commandment": 8,
    "prompt": "A teacher asks who knocked over a plant and you know you did. What can you say?",
    "choices": [
      {
        "id": "care",
        "text": "I did it by accident; may I help clean up?"
      },
      {
        "id": "other-a",
        "text": "Name a pupil who was outside."
      },
      {
        "id": "other-b",
        "text": "Say nobody could ever know."
      }
    ],
    "correctId": "care",
    "feedback": "Honest responsibility makes repair possible."
  },
  {
    "id": "school-39",
    "location": "school",
    "commandment": 8,
    "prompt": "Your friend shares a private worry. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Keep it private unless safety needs a trusted adult's help."
      },
      {
        "id": "other-a",
        "text": "Tell the whole class for attention."
      },
      {
        "id": "other-b",
        "text": "Promise secrecy even if someone is in danger."
      }
    ],
    "correctId": "care",
    "feedback": "Respect for truth includes discretion, but danger should not stay secret."
  },
  {
    "id": "school-40",
    "location": "school",
    "commandment": 8,
    "prompt": "A teammate did most of the project research. What should you say in the presentation?",
    "choices": [
      {
        "id": "care",
        "text": "Credit their contribution honestly."
      },
      {
        "id": "other-a",
        "text": "Claim you did everything alone."
      },
      {
        "id": "other-b",
        "text": "Leave their name off to get more praise."
      }
    ],
    "correctId": "care",
    "feedback": "Truth gives fair recognition to others' work."
  },
  {
    "id": "school-41",
    "location": "school",
    "commandment": 8,
    "prompt": "You are unsure of an answer in discussion. What can you say?",
    "choices": [
      {
        "id": "care",
        "text": "I am not sure; can we check a reliable source?"
      },
      {
        "id": "other-a",
        "text": "State a guess as proven fact."
      },
      {
        "id": "other-b",
        "text": "Invent a quotation from a book."
      }
    ],
    "correctId": "care",
    "feedback": "Honesty can begin with admitting uncertainty."
  },
  {
    "id": "school-42",
    "location": "school",
    "commandment": 9,
    "prompt": "A lesson contrasts envy of a toy with coveting a spouse. Which is correct?",
    "choices": [
      {
        "id": "care",
        "text": "Toys concern the tenth; the ninth especially concerns desires respecting marriage."
      },
      {
        "id": "other-a",
        "text": "Both are always only the ninth."
      },
      {
        "id": "other-b",
        "text": "A spouse is a type of property."
      }
    ],
    "correctId": "care",
    "feedback": "Catholic teaching distinguishes possessions from persons and marriage."
  },
  {
    "id": "school-43",
    "location": "school",
    "commandment": 9,
    "prompt": "In a story, a character keeps wishing to take someone else's spouse. What is a better inner choice?",
    "choices": [
      {
        "id": "care",
        "text": "Wish the couple well and ask God for a respectful heart."
      },
      {
        "id": "other-a",
        "text": "Keep imagining their breakup as a prize."
      },
      {
        "id": "other-b",
        "text": "Say every desire must be acted out."
      }
    ],
    "correctId": "care",
    "feedback": "The ninth commandment guides the heart toward respect for marriage."
  },
  {
    "id": "school-44",
    "location": "school",
    "commandment": 10,
    "prompt": "A pupil has the newest backpack and you feel jealous. What can you practice?",
    "choices": [
      {
        "id": "care",
        "text": "Admire it without wishing to take it or ruin it."
      },
      {
        "id": "other-a",
        "text": "Hope it tears so you feel better."
      },
      {
        "id": "other-b",
        "text": "Believe the backpack makes them worth more."
      }
    ],
    "correctId": "care",
    "feedback": "The tenth commandment guides us away from coveting possessions."
  },
  {
    "id": "school-45",
    "location": "school",
    "commandment": 10,
    "prompt": "Your friend wins a science kit. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Congratulate them while letting disappointment pass."
      },
      {
        "id": "other-a",
        "text": "Wish their kit would stop working."
      },
      {
        "id": "other-b",
        "text": "Say they must give it to you to be kind."
      }
    ],
    "correctId": "care",
    "feedback": "Another person's gift need not become our resentment."
  },
  {
    "id": "school-46",
    "location": "school",
    "commandment": 10,
    "prompt": "You compare your lunch box with everyone else's. What may help?",
    "choices": [
      {
        "id": "care",
        "text": "Notice what you need and what you can be grateful for."
      },
      {
        "id": "other-a",
        "text": "Rank classmates by how expensive their things are."
      },
      {
        "id": "other-b",
        "text": "Decide only the best box can make lunch good."
      }
    ],
    "correctId": "care",
    "feedback": "Gratitude can help when comparisons make us unhappy."
  },
  {
    "id": "school-47",
    "location": "school",
    "commandment": 10,
    "prompt": "A classmate has more pocket money. What thought is fair?",
    "choices": [
      {
        "id": "care",
        "text": "Their money does not decide either person's worth."
      },
      {
        "id": "other-a",
        "text": "Their money ought to be mine."
      },
      {
        "id": "other-b",
        "text": "They must feel guilty whenever I want something."
      }
    ],
    "correctId": "care",
    "feedback": "People are more important than their possessions."
  },
  {
    "id": "school-48",
    "location": "school",
    "commandment": 10,
    "prompt": "A friend proudly shows a new bicycle photo. What can you choose?",
    "choices": [
      {
        "id": "care",
        "text": "Be happy with them without resenting your own bicycle."
      },
      {
        "id": "other-a",
        "text": "Keep hoping the bicycle is stolen."
      },
      {
        "id": "other-b",
        "text": "Tell yourself you cannot enjoy anything until you own it."
      }
    ],
    "correctId": "care",
    "feedback": "We can enjoy another's good fortune without coveting it."
  },
  {
    "id": "school-49",
    "location": "school",
    "commandment": 10,
    "prompt": "An expensive prize display distracts you all day. What can help?",
    "choices": [
      {
        "id": "care",
        "text": "Turn back to learning and appreciate what is already good."
      },
      {
        "id": "other-a",
        "text": "Make owning it the only reason to be kind."
      },
      {
        "id": "other-b",
        "text": "Wish every winner would lose it."
      }
    ],
    "correctId": "care",
    "feedback": "Our choices need not be ruled by craving more things."
  },
  {
    "id": "school-50",
    "location": "school",
    "commandment": 10,
    "prompt": "You feel envy when another group gets new supplies. What is a good response?",
    "choices": [
      {
        "id": "care",
        "text": "Ask fairly for needed supplies without wishing theirs were taken away."
      },
      {
        "id": "other-a",
        "text": "Refuse all work until their supplies are gone."
      },
      {
        "id": "other-b",
        "text": "Treat the group as enemies because of their equipment."
      }
    ],
    "correctId": "care",
    "feedback": "We can seek fair resources without coveting another's belongings."
  },
  {
    "id": "playground-01",
    "location": "playground",
    "commandment": 1,
    "prompt": "You look at a beautiful sky during play. What can turn wonder toward God?",
    "choices": [
      {
        "id": "care",
        "text": "Offer a quiet thank-you to the Creator."
      },
      {
        "id": "other-a",
        "text": "Treat the sky itself as a god to command."
      },
      {
        "id": "other-b",
        "text": "Say only winning games can matter."
      }
    ],
    "correctId": "care",
    "feedback": "Gratitude for creation can lead us toward God."
  },
  {
    "id": "playground-02",
    "location": "playground",
    "commandment": 1,
    "prompt": "A friend says a lucky bracelet controls whether God loves you. What can you remember?",
    "choices": [
      {
        "id": "care",
        "text": "God's love does not depend on a lucky object."
      },
      {
        "id": "other-a",
        "text": "Only expensive bracelets bring God's love."
      },
      {
        "id": "other-b",
        "text": "Losing the bracelet makes prayer impossible."
      }
    ],
    "correctId": "care",
    "feedback": "Trust belongs in God, not in superstition."
  },
  {
    "id": "playground-03",
    "location": "playground",
    "commandment": 1,
    "prompt": "You lose a game after praying. What is a faithful thought?",
    "choices": [
      {
        "id": "care",
        "text": "God still loves me; prayer is not a way to force a win."
      },
      {
        "id": "other-a",
        "text": "God only loves the winning team."
      },
      {
        "id": "other-b",
        "text": "Prayer is a payment for a trophy."
      }
    ],
    "correctId": "care",
    "feedback": "Faith trusts God beyond the outcome of games."
  },
  {
    "id": "playground-04",
    "location": "playground",
    "commandment": 2,
    "prompt": "Someone shouts God's name as an insult after missing a goal. What can you choose?",
    "choices": [
      {
        "id": "care",
        "text": "Use respectful words for your own disappointment."
      },
      {
        "id": "other-a",
        "text": "Repeat the insult louder."
      },
      {
        "id": "other-b",
        "text": "Use God's name to curse their team."
      }
    ],
    "correctId": "care",
    "feedback": "We can express frustration without disrespecting God's name."
  },
  {
    "id": "playground-05",
    "location": "playground",
    "commandment": 2,
    "prompt": "A team wants a cheer that mocks Jesus. What could you suggest?",
    "choices": [
      {
        "id": "care",
        "text": "Choose a lively cheer without mocking sacred names."
      },
      {
        "id": "other-a",
        "text": "Make the mockery meaner."
      },
      {
        "id": "other-b",
        "text": "Tell them God's name is only a joke."
      }
    ],
    "correctId": "care",
    "feedback": "Joy and respect can belong together."
  },
  {
    "id": "playground-06",
    "location": "playground",
    "commandment": 2,
    "prompt": "A player says God promised their team will win. What is wise?",
    "choices": [
      {
        "id": "care",
        "text": "Do not pretend a game prediction speaks for God."
      },
      {
        "id": "other-a",
        "text": "Believe the other team must be hated by God."
      },
      {
        "id": "other-b",
        "text": "Use God's name to demand the score change."
      }
    ],
    "correctId": "care",
    "feedback": "God's name is not a tool for claiming special control over a game."
  },
  {
    "id": "playground-07",
    "location": "playground",
    "commandment": 2,
    "prompt": "Your friend dares you to swear by God over who touched the ball. What can you say?",
    "choices": [
      {
        "id": "care",
        "text": "I can tell the truth without a sacred oath."
      },
      {
        "id": "other-a",
        "text": "A careless oath makes any story true."
      },
      {
        "id": "other-b",
        "text": "Use God's name to intimidate them."
      }
    ],
    "correctId": "care",
    "feedback": "Simple honest speech does not need God's name as a dare."
  },
  {
    "id": "playground-08",
    "location": "playground",
    "commandment": 3,
    "prompt": "A Sunday outing is being planned. What can you ask your family?",
    "choices": [
      {
        "id": "care",
        "text": "How can we include Mass, rest, and this outing?"
      },
      {
        "id": "other-a",
        "text": "Can we decide worship never matters again?"
      },
      {
        "id": "other-b",
        "text": "Can we keep everyone working without a pause?"
      }
    ],
    "correctId": "care",
    "feedback": "A good Sunday plan makes room for God and healthy rest."
  },
  {
    "id": "playground-09",
    "location": "playground",
    "commandment": 3,
    "prompt": "After Sunday worship you play peacefully with cousins. What can you remember?",
    "choices": [
      {
        "id": "care",
        "text": "Healthy recreation can be part of Sunday joy."
      },
      {
        "id": "other-a",
        "text": "All play is forbidden on Sunday."
      },
      {
        "id": "other-b",
        "text": "Sunday is only for collecting prizes."
      }
    ],
    "correctId": "care",
    "feedback": "The Lord's Day welcomes suitable rest and family recreation."
  },
  {
    "id": "playground-10",
    "location": "playground",
    "commandment": 3,
    "prompt": "A neighbor needs urgent help on Sunday. What is right?",
    "choices": [
      {
        "id": "care",
        "text": "Get a trusted adult; necessary care fits the Lord's Day."
      },
      {
        "id": "other-a",
        "text": "Ignore them because helping is always work."
      },
      {
        "id": "other-b",
        "text": "Tell them needs must wait until Monday."
      }
    ],
    "correctId": "care",
    "feedback": "Mercy and care are not contrary to Sunday worship."
  },
  {
    "id": "playground-11",
    "location": "playground",
    "commandment": 4,
    "prompt": "Your caregiver sets a safe boundary at the park. What should you do?",
    "choices": [
      {
        "id": "care",
        "text": "Stay within it and ask before going elsewhere."
      },
      {
        "id": "other-a",
        "text": "Leave without telling anyone."
      },
      {
        "id": "other-b",
        "text": "Encourage younger children to hide outside it."
      }
    ],
    "correctId": "care",
    "feedback": "Following reasonable safety limits honors responsible caregivers."
  },
  {
    "id": "playground-12",
    "location": "playground",
    "commandment": 4,
    "prompt": "A coach gives an unfair instruction to hurt another player. What is right?",
    "choices": [
      {
        "id": "care",
        "text": "Refuse harm and tell a safe responsible adult."
      },
      {
        "id": "other-a",
        "text": "Hurt them because a coach said so."
      },
      {
        "id": "other-b",
        "text": "Keep the instruction secret."
      }
    ],
    "correctId": "care",
    "feedback": "Respect for authority never requires hurting someone."
  },
  {
    "id": "playground-13",
    "location": "playground",
    "commandment": 4,
    "prompt": "Your parent says it is time to leave and you feel disappointed. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Say how you feel respectfully and start getting ready."
      },
      {
        "id": "other-a",
        "text": "Scream insults at them."
      },
      {
        "id": "other-b",
        "text": "Run away so they cannot find you."
      }
    ],
    "correctId": "care",
    "feedback": "We can feel disappointed and still treat caregivers respectfully."
  },
  {
    "id": "playground-14",
    "location": "playground",
    "commandment": 4,
    "prompt": "A friend says children must keep every adult's secret. What should you know?",
    "choices": [
      {
        "id": "care",
        "text": "Unsafe secrets should be shared with a safe trusted adult."
      },
      {
        "id": "other-a",
        "text": "Any adult's request must stay secret."
      },
      {
        "id": "other-b",
        "text": "You will be bad if you ask for help."
      }
    ],
    "correctId": "care",
    "feedback": "Children have a right to safety and trusted help."
  },
  {
    "id": "playground-15",
    "location": "playground",
    "commandment": 5,
    "prompt": "A child falls from the climbing frame. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Get a trusted adult and avoid moving them roughly."
      },
      {
        "id": "other-a",
        "text": "Dare them to jump again."
      },
      {
        "id": "other-b",
        "text": "Take a close-up video instead of helping."
      }
    ],
    "correctId": "care",
    "feedback": "Protecting life means getting suitable help."
  },
  {
    "id": "playground-16",
    "location": "playground",
    "commandment": 5,
    "prompt": "A ball rolls toward the road. What is safest?",
    "choices": [
      {
        "id": "care",
        "text": "Stop and ask an adult for help."
      },
      {
        "id": "other-a",
        "text": "Run into traffic after it."
      },
      {
        "id": "other-b",
        "text": "Send a younger child after it."
      }
    ],
    "correctId": "care",
    "feedback": "People's lives matter more than retrieving a ball."
  },
  {
    "id": "playground-17",
    "location": "playground",
    "commandment": 5,
    "prompt": "A player is mocked because they run slowly. What helps?",
    "choices": [
      {
        "id": "care",
        "text": "Speak kindly and include them safely."
      },
      {
        "id": "other-a",
        "text": "Give them a cruel nickname."
      },
      {
        "id": "other-b",
        "text": "Say only the fastest children deserve play."
      }
    ],
    "correctId": "care",
    "feedback": "Every person's dignity matters, not just performance."
  },
  {
    "id": "playground-18",
    "location": "playground",
    "commandment": 5,
    "prompt": "You are furious about a foul. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Step away to calm down and ask the adult referee for help."
      },
      {
        "id": "other-a",
        "text": "Hit the player in return."
      },
      {
        "id": "other-b",
        "text": "Kick the ball at their face."
      }
    ],
    "correctId": "care",
    "feedback": "We can seek fairness without choosing violence."
  },
  {
    "id": "playground-19",
    "location": "playground",
    "commandment": 5,
    "prompt": "Someone offers you unknown pills at the park. What should you do?",
    "choices": [
      {
        "id": "care",
        "text": "Do not take them; go to your trusted caregiver."
      },
      {
        "id": "other-a",
        "text": "Try one so nobody laughs."
      },
      {
        "id": "other-b",
        "text": "Give them to a younger child."
      }
    ],
    "correctId": "care",
    "feedback": "Protecting health includes refusing unknown substances and seeking help."
  },
  {
    "id": "playground-20",
    "location": "playground",
    "commandment": 5,
    "prompt": "A swing chain looks broken. What is responsible?",
    "choices": [
      {
        "id": "care",
        "text": "Keep away and tell the responsible adult."
      },
      {
        "id": "other-a",
        "text": "Test it with a hard jump."
      },
      {
        "id": "other-b",
        "text": "Hide the damage from others."
      }
    ],
    "correctId": "care",
    "feedback": "Warning others about hazards protects life."
  },
  {
    "id": "playground-21",
    "location": "playground",
    "commandment": 5,
    "prompt": "A child cannot use the steps to join a game. What can your group do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask how to adapt the game and get adult support."
      },
      {
        "id": "other-a",
        "text": "Say they never belong."
      },
      {
        "id": "other-b",
        "text": "Move their chair without permission."
      }
    ],
    "correctId": "care",
    "feedback": "Inclusion listens to the person and seeks safe access."
  },
  {
    "id": "playground-22",
    "location": "playground",
    "commandment": 7,
    "prompt": "You see a trapped bird near the fence. What is wise?",
    "choices": [
      {
        "id": "care",
        "text": "Tell an adult who can arrange safe help."
      },
      {
        "id": "other-a",
        "text": "Pull its wings to free it."
      },
      {
        "id": "other-b",
        "text": "Throw stones to make it move."
      }
    ],
    "correctId": "care",
    "feedback": "Care for living creatures includes knowing when expert help is needed."
  },
  {
    "id": "playground-23",
    "location": "playground",
    "commandment": 5,
    "prompt": "A group pressures a child to do a dangerous stunt. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Say no and bring a trusted adult."
      },
      {
        "id": "other-a",
        "text": "Join the pressure to make it exciting."
      },
      {
        "id": "other-b",
        "text": "Tell the child fear is shameful."
      }
    ],
    "correctId": "care",
    "feedback": "Courage can mean refusing pressure and protecting someone."
  },
  {
    "id": "playground-24",
    "location": "playground",
    "commandment": 5,
    "prompt": "A player says they feel unsafe with the teasing. What should you do?",
    "choices": [
      {
        "id": "care",
        "text": "Take it seriously and involve a trusted adult."
      },
      {
        "id": "other-a",
        "text": "Say it only counts if they are injured."
      },
      {
        "id": "other-b",
        "text": "Tell everyone to tease louder."
      }
    ],
    "correctId": "care",
    "feedback": "Emotional safety and dignity also deserve protection."
  },
  {
    "id": "playground-25",
    "location": "playground",
    "commandment": 6,
    "prompt": "At a park wedding picnic, you hear the couple's promises explained. What do they mean?",
    "choices": [
      {
        "id": "care",
        "text": "The spouses promise faithful married love."
      },
      {
        "id": "other-a",
        "text": "They promise only to share cake today."
      },
      {
        "id": "other-b",
        "text": "They promise to trade partners when bored."
      }
    ],
    "correctId": "care",
    "feedback": "The sixth commandment honors lasting faithfulness in marriage."
  },
  {
    "id": "playground-26",
    "location": "playground",
    "commandment": 7,
    "prompt": "You find a scooter beside a bench. What should you do?",
    "choices": [
      {
        "id": "care",
        "text": "Leave it safe and tell a responsible adult it may be lost."
      },
      {
        "id": "other-a",
        "text": "Ride it home because nobody is there."
      },
      {
        "id": "other-b",
        "text": "Change its name label."
      }
    ],
    "correctId": "care",
    "feedback": "An unattended scooter is not free to take."
  },
  {
    "id": "playground-27",
    "location": "playground",
    "commandment": 7,
    "prompt": "You want a turn with a friend's ball. What is right?",
    "choices": [
      {
        "id": "care",
        "text": "Ask permission and respect their answer."
      },
      {
        "id": "other-a",
        "text": "Take it while they drink water."
      },
      {
        "id": "other-b",
        "text": "Claim wanting it makes it yours."
      }
    ],
    "correctId": "care",
    "feedback": "Friendship does not remove the need for permission."
  },
  {
    "id": "playground-28",
    "location": "playground",
    "commandment": 7,
    "prompt": "You accidentally break a borrowed skipping rope. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Tell the owner and ask an adult to help make it right."
      },
      {
        "id": "other-a",
        "text": "Hide the broken ends."
      },
      {
        "id": "other-b",
        "text": "Blame a child who was not there."
      }
    ],
    "correctId": "care",
    "feedback": "Respect for property includes honest repair where possible."
  },
  {
    "id": "playground-29",
    "location": "playground",
    "commandment": 7,
    "prompt": "A public garden sign asks people not to pick flowers. What is respectful?",
    "choices": [
      {
        "id": "care",
        "text": "Enjoy looking and leave the flowers for everyone."
      },
      {
        "id": "other-a",
        "text": "Pick all the best flowers."
      },
      {
        "id": "other-b",
        "text": "Tell friends public things belong only to you."
      }
    ],
    "correctId": "care",
    "feedback": "Shared places should remain available for others too."
  },
  {
    "id": "playground-30",
    "location": "playground",
    "commandment": 7,
    "prompt": "Someone left a snack bag with their name on it. You are hungry. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask your caregiver for food instead of taking it."
      },
      {
        "id": "other-a",
        "text": "Eat it secretly."
      },
      {
        "id": "other-b",
        "text": "Say hunger makes the name unimportant."
      }
    ],
    "correctId": "care",
    "feedback": "We can ask for help meeting needs while respecting another's belongings."
  },
  {
    "id": "playground-31",
    "location": "playground",
    "commandment": 7,
    "prompt": "Your team uses equipment from a community box. What should happen afterward?",
    "choices": [
      {
        "id": "care",
        "text": "Return it so another group can play."
      },
      {
        "id": "other-a",
        "text": "Hide it for next time."
      },
      {
        "id": "other-b",
        "text": "Leave it in puddles."
      }
    ],
    "correctId": "care",
    "feedback": "Shared equipment needs care and return."
  },
  {
    "id": "playground-32",
    "location": "playground",
    "commandment": 7,
    "prompt": "You find money near the playground gate. What is right?",
    "choices": [
      {
        "id": "care",
        "text": "Tell your caregiver and follow the park's lost-property process."
      },
      {
        "id": "other-a",
        "text": "Quickly spend it before anyone asks."
      },
      {
        "id": "other-b",
        "text": "Offer to return it only for a reward."
      }
    ],
    "correctId": "care",
    "feedback": "Finding money does not erase the owner's claim."
  },
  {
    "id": "playground-33",
    "location": "playground",
    "commandment": 7,
    "prompt": "You want to decorate the slide with permanent marker. What should you do?",
    "choices": [
      {
        "id": "care",
        "text": "Use paper for art and protect the shared slide."
      },
      {
        "id": "other-a",
        "text": "Write on it because everyone uses it."
      },
      {
        "id": "other-b",
        "text": "Scratch your initials into the paint."
      }
    ],
    "correctId": "care",
    "feedback": "Public property deserves care rather than damage."
  },
  {
    "id": "playground-34",
    "location": "playground",
    "commandment": 8,
    "prompt": "You touch the ball last before it goes out. What should you say?",
    "choices": [
      {
        "id": "care",
        "text": "It touched me last."
      },
      {
        "id": "other-a",
        "text": "Blame the other player although you know."
      },
      {
        "id": "other-b",
        "text": "Pretend you did not see your own hand."
      }
    ],
    "correctId": "care",
    "feedback": "Honest play matters more than getting an extra turn."
  },
  {
    "id": "playground-35",
    "location": "playground",
    "commandment": 8,
    "prompt": "A friend is blamed for litter you dropped. What should you do?",
    "choices": [
      {
        "id": "care",
        "text": "Explain that it was yours and pick it up."
      },
      {
        "id": "other-a",
        "text": "Let the friend take the blame."
      },
      {
        "id": "other-b",
        "text": "Say another person dropped it."
      }
    ],
    "correctId": "care",
    "feedback": "The truth protects others from unfair blame."
  },
  {
    "id": "playground-36",
    "location": "playground",
    "commandment": 8,
    "prompt": "A player exaggerates a score to win. What can you suggest?",
    "choices": [
      {
        "id": "care",
        "text": "Check the score together honestly."
      },
      {
        "id": "other-a",
        "text": "Make up an even bigger score."
      },
      {
        "id": "other-b",
        "text": "Decide the loudest voice must be right."
      }
    ],
    "correctId": "care",
    "feedback": "Fair play needs truthful words and a fair check."
  },
  {
    "id": "playground-37",
    "location": "playground",
    "commandment": 8,
    "prompt": "You hear a rumor that someone stole a toy. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Avoid spreading it and tell a trusted adult any facts you know."
      },
      {
        "id": "other-a",
        "text": "Announce they are guilty to everyone."
      },
      {
        "id": "other-b",
        "text": "Add a made-up detail."
      }
    ],
    "correctId": "care",
    "feedback": "A rumor is not proof, and reputations deserve care."
  },
  {
    "id": "playground-38",
    "location": "playground",
    "commandment": 8,
    "prompt": "Your friend asks whether you lost their frisbee. You did. What is right?",
    "choices": [
      {
        "id": "care",
        "text": "Admit it and ask an adult to help look."
      },
      {
        "id": "other-a",
        "text": "Say you never borrowed it."
      },
      {
        "id": "other-b",
        "text": "Blame the wind for taking it from someone else."
      }
    ],
    "correctId": "care",
    "feedback": "Honesty is the beginning of putting things right."
  },
  {
    "id": "playground-39",
    "location": "playground",
    "commandment": 8,
    "prompt": "Someone wants you to say you witnessed a foul you did not see. What can you say?",
    "choices": [
      {
        "id": "care",
        "text": "I did not see it, so I cannot say."
      },
      {
        "id": "other-a",
        "text": "Pretend to have seen it for your team."
      },
      {
        "id": "other-b",
        "text": "Invent a detailed description."
      }
    ],
    "correctId": "care",
    "feedback": "Truthful testimony includes the limits of what we saw."
  },
  {
    "id": "playground-40",
    "location": "playground",
    "commandment": 8,
    "prompt": "A child tells you about a safety worry in confidence. What should you do?",
    "choices": [
      {
        "id": "care",
        "text": "Tell a safe trusted adult who can help."
      },
      {
        "id": "other-a",
        "text": "Share it as playground gossip."
      },
      {
        "id": "other-b",
        "text": "Promise to hide danger forever."
      }
    ],
    "correctId": "care",
    "feedback": "Privacy matters, but protecting someone can require adult help."
  },
  {
    "id": "playground-41",
    "location": "playground",
    "commandment": 8,
    "prompt": "You post a picture of a game with a false caption mocking someone. What should you do next?",
    "choices": [
      {
        "id": "care",
        "text": "Remove the false claim with an adult's help and apologize."
      },
      {
        "id": "other-a",
        "text": "Add more false claims to defend yourself."
      },
      {
        "id": "other-b",
        "text": "Say online words cannot hurt."
      }
    ],
    "correctId": "care",
    "feedback": "Truthfulness matters online as well as face to face."
  },
  {
    "id": "playground-42",
    "location": "playground",
    "commandment": 9,
    "prompt": "During a park story activity, a character wants another person's spouse. Which thought is better?",
    "choices": [
      {
        "id": "care",
        "text": "Respect their marriage and wish the couple well."
      },
      {
        "id": "other-a",
        "text": "Keep planning their breakup."
      },
      {
        "id": "other-b",
        "text": "Treat the spouse as a prize to be owned."
      }
    ],
    "correctId": "care",
    "feedback": "The ninth commandment concerns chosen desires that respect persons and marriage."
  },
  {
    "id": "playground-43",
    "location": "playground",
    "commandment": 10,
    "prompt": "Another player has a sparkling new helmet. What can you practice?",
    "choices": [
      {
        "id": "care",
        "text": "Appreciate it without wishing it were taken from them."
      },
      {
        "id": "other-a",
        "text": "Hope it gets lost."
      },
      {
        "id": "other-b",
        "text": "Decide your own safe helmet is worthless."
      }
    ],
    "correctId": "care",
    "feedback": "The tenth commandment helps with coveting possessions, not with comparing people's worth."
  },
  {
    "id": "playground-44",
    "location": "playground",
    "commandment": 10,
    "prompt": "Your friend's kite flies higher and you feel envy. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Enjoy their success and ask for flying tips."
      },
      {
        "id": "other-a",
        "text": "Wish the kite would tear."
      },
      {
        "id": "other-b",
        "text": "Say they must stop enjoying it."
      }
    ],
    "correctId": "care",
    "feedback": "Another person's good things need not become our resentment."
  },
  {
    "id": "playground-45",
    "location": "playground",
    "commandment": 10,
    "prompt": "A neighbor brings an expensive remote-control car. What thought helps?",
    "choices": [
      {
        "id": "care",
        "text": "I can enjoy seeing it without needing to own theirs."
      },
      {
        "id": "other-a",
        "text": "I cannot be happy while they own it."
      },
      {
        "id": "other-b",
        "text": "They should lose it because I want it."
      }
    ],
    "correctId": "care",
    "feedback": "Contentment leaves space for another's enjoyment."
  },
  {
    "id": "playground-46",
    "location": "playground",
    "commandment": 10,
    "prompt": "You see a toy advertisement near the park. What can you remember?",
    "choices": [
      {
        "id": "care",
        "text": "Wanting a toy does not mean it must become mine."
      },
      {
        "id": "other-a",
        "text": "I must have everything I see."
      },
      {
        "id": "other-b",
        "text": "People with that toy are worth more."
      }
    ],
    "correctId": "care",
    "feedback": "Not every want needs to become a demand or a resentful craving."
  },
  {
    "id": "playground-47",
    "location": "playground",
    "commandment": 10,
    "prompt": "A child gets the picnic prize you hoped for. What can you choose?",
    "choices": [
      {
        "id": "care",
        "text": "Congratulate them and allow your disappointment to pass."
      },
      {
        "id": "other-a",
        "text": "Hope someone ruins their prize."
      },
      {
        "id": "other-b",
        "text": "Tell them they are wrong to enjoy it."
      }
    ],
    "correctId": "care",
    "feedback": "We can feel disappointed without wishing another person loses their good things."
  },
  {
    "id": "playground-48",
    "location": "playground",
    "commandment": 10,
    "prompt": "You keep comparing your old scooter with a friend's. What may help?",
    "choices": [
      {
        "id": "care",
        "text": "Notice what works well in yours and appreciate theirs too."
      },
      {
        "id": "other-a",
        "text": "Refuse to be their friend until yours is newer."
      },
      {
        "id": "other-b",
        "text": "Hope theirs breaks before tomorrow."
      }
    ],
    "correctId": "care",
    "feedback": "Gratitude can soften envy without denying real needs."
  },
  {
    "id": "playground-49",
    "location": "playground",
    "commandment": 10,
    "prompt": "A friend has a collection you cannot afford. What is a healthy thought?",
    "choices": [
      {
        "id": "care",
        "text": "Their collection is not a measure of my worth."
      },
      {
        "id": "other-a",
        "text": "Their belongings ought to be mine."
      },
      {
        "id": "other-b",
        "text": "I need to make them unhappy to feel better."
      }
    ],
    "correctId": "care",
    "feedback": "Our dignity is not measured by how much we own."
  },
  {
    "id": "playground-50",
    "location": "playground",
    "commandment": 10,
    "prompt": "You feel resentful because a cousin has more sports gear. What can you do?",
    "choices": [
      {
        "id": "care",
        "text": "Ask for what you actually need without wishing their gear away."
      },
      {
        "id": "other-a",
        "text": "Spend the day hoping it is stolen."
      },
      {
        "id": "other-b",
        "text": "Say all their happiness belongs to you."
      }
    ],
    "correctId": "care",
    "feedback": "Seeking what we need is different from coveting another's possessions."
  }
];
