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
        "A short church walk-through for new helpers and kids.",
      ),
      embedPath: getTinyPriestEmbedPath(),
    },
    {
      slug: "liturgical-vestments",
      title: copyText(copy, "play.game.vestments.title", "Liturgical vestments"),
      description: copyText(
        copy,
        "play.game.vestments.description",
        "Practice Church colors.",
      ),
      embedPath: "/play/liturgical-vestments",
    },
    {
      slug: "typing",
      title: copyText(copy, "play.game.typing.title", "Typing Game"),
      description: copyText(copy, "play.game.typing.description", "Word mode or today's readings."),
      embedPath: "/play/typing",
    },
    {
      slug: "hangman",
      title: copyText(copy, "play.game.hangman.title", "Hangman"),
      description: copyText(copy, "play.game.hangman.description", "Classic hangman with Catholic words."),
      embedPath: "/games/hangman/index.html",
    },
    {
      slug: "emoji",
      title: copyText(copy, "play.game.emoji.title", "4-Cut Photo Booth"),
      description: copyText(copy, "play.game.emoji.description", "Four-photo strip with stickers."),
      embedPath: "/play/photo-booth",
    },
  ];
}

export function getPlayGameFromCopy(copy: SiteCopyMap, slug: string): PlayGame | undefined {
  return getPlayGamesFromCopy(copy).find((g) => g.slug === slug);
}
