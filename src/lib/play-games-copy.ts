import type { SiteCopyMap } from "@/lib/site-copy-types";
import { copyText } from "@/lib/site-copy";
import type { PlayGame } from "@/lib/play-games";
import { getTinyPriestEmbedPath } from "@/lib/tiny-priest";

export function getPlayGamesFromCopy(copy: SiteCopyMap): PlayGame[] {
  return [
    {
      slug: "church",
      title: copyText(copy, "play.game.church.title", "Tiny Priest"),
      description: copyText(
        copy,
        "play.game.church.description",
        "Welcome to Tiny Church!",
      ),
      embedPath: getTinyPriestEmbedPath(),
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
    },
    {
      slug: "typing",
      title: copyText(copy, "play.game.typing.title", "Typing Game"),
      description: copyText(copy, "play.game.typing.description", "Type church words before they land."),
      embedPath: "/play/typing",
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
    },
    {
      slug: "face-to-emoji",
      title: copyText(copy, "play.game.face-to-emoji.title", "Face to Emoji"),
      description: copyText(copy, "play.game.face-to-emoji.description", "Turn faces into emoji fun!"),
      embedPath: "/play/face-to-emoji",
    },
    {
      slug: "emoji",
      title: copyText(copy, "play.game.emoji.title", "4-Cut Photo Booth"),
      description: copyText(copy, "play.game.emoji.description", "Make a four-photo strip with stickers!"),
      embedPath: "/play/photo-booth",
    },
  ];
}

export function getPlayGameFromCopy(copy: SiteCopyMap, slug: string): PlayGame | undefined {
  return getPlayGamesFromCopy(copy).find((g) => g.slug === slug);
}
