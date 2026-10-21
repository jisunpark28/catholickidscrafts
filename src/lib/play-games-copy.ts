import type { SiteCopyMap } from "@/lib/site-copy-types";
import { copyText } from "@/lib/site-copy";
import type { PlayGame } from "@/lib/play-games";
import { getTinyPriestEmbedPath } from "@/lib/tiny-priest";

export function getPlayGamesFromCopy(copy: SiteCopyMap): PlayGame[] {
  return [
    {
      slug: "church",
      title: copyText(copy, "play.game.church.title", "Come to Mass!"),
      description: copyText(
        copy,
        "play.game.church.description",
        "Welcome to our church!",
      ),
      embedPath: getTinyPriestEmbedPath(),
      ageRange: "All ages",
      duration: "5-10 min",
    },
    {
      slug: "liturgical-vestments",
      title: copyText(copy, "play.game.vestments.title", "Liturgical vestments"),
      description: copyText(
        copy,
        "play.game.vestments.description",
        "What color vestments does Father wear?",
      ),
      embedPath: "/play/liturgical-vestments",
      ageRange: "Grades K-5",
      duration: "2-5 min",
    },
    {
      slug: "typing",
      title: copyText(copy, "play.game.typing.title", "Typing Game"),
      description: copyText(copy, "play.game.typing.description", "Type church words before they land."),
      embedPath: "/play/typing",
      ageRange: "Grades 2+",
      duration: "2-5 min",
    },
    {
      slug: "hangman",
      title: copyText(copy, "play.game.hangman.title", "Hangman"),
      description: copyText(
        copy,
        "play.game.hangman.description",
        "Guess the word before the petals fall.",
      ),
      embedPath: "/games/hangman/index.html",
      ageRange: "Grades 1+",
      duration: "2-5 min",
    },
    {
      slug: "face-to-emoji",
      title: copyText(copy, "play.game.face-to-emoji.title", "Face to Emoji"),
      description: copyText(copy, "play.game.face-to-emoji.description", "Turn faces into emoji fun!"),
      embedPath: "/play/face-to-emoji",
      ageRange: "All ages",
      duration: "2-5 min",
      supervision: true,
    },
    {
      slug: "emoji",
      title: copyText(copy, "play.game.emoji.title", "4-Cut Photo Booth"),
      description: copyText(copy, "play.game.emoji.description", "Make a four-photo strip with stickers!"),
      embedPath: "/play/photo-booth",
      ageRange: "All ages",
      duration: "2-5 min",
      supervision: true,
    },
  ];
}

export function getPlayGameFromCopy(copy: SiteCopyMap, slug: string): PlayGame | undefined {
  return getPlayGamesFromCopy(copy).find((g) => g.slug === slug);
}
