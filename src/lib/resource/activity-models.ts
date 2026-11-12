// Server-only: the editable element model of each activity sheet. Only the Plus-checked
// editor API route imports this, so the model never ships in a page or client bundle.
import HAPPY_NEW_CHURCH_YEAR from "@/data/activities/happy-new-church-year.model.json";
import JESSE_TREE_ORNAMENTS from "@/data/activities/jesse-tree-ornaments.model.json";
import PREPARE_THE_WAY from "@/data/activities/prepare-the-way.model.json";
import YES_WITH_A_SMILE from "@/data/activities/yes-with-a-smile.model.json";
import WHITE_FLOWER_FOR_MARY from "@/data/activities/white-flower-for-mary.model.json";
import COME_LORD_JESUS from "@/data/activities/come-lord-jesus.model.json";
import STRAW_FOR_THE_MANGER from "@/data/activities/straw-for-the-manger.model.json";
import JESSE_TREE_PICTURE_A_DAY from "@/data/activities/jesse-tree-picture-a-day.model.json";
import HELPING_HANDS_LIKE_MARY from "@/data/activities/helping-hands-like-mary.model.json";
import SECRET_KINDNESS_NOTES from "@/data/activities/secret-kindness-notes.model.json";
import ROSES_FOR_MARY from "@/data/activities/roses-for-mary.model.json";
import O_ANTIPHON_ORNAMENTS from "@/data/activities/o-antiphon-ornaments.model.json";
import FAMILY_ADVENT_CALENDAR from "@/data/activities/family-advent-calendar.model.json";
import COLOUR_THE_ADVENT_CANDLES from "@/data/activities/colour-the-advent-candles.model.json";
import PAPER_ADVENT_WREATH from "@/data/activities/paper-advent-wreath.model.json";
import LIGHT_THE_ADVENT_CANDLE from "@/data/activities/light-the-advent-candle.model.json";
import ADVENT_CANDLE_CRAFT from "@/data/activities/advent-candle-craft.model.json";
import type { ActivityDoc } from "@/lib/resource/activity-doc";

const MODELS: Record<string, ActivityDoc> = {
  "happy-new-church-year": HAPPY_NEW_CHURCH_YEAR as unknown as ActivityDoc,
  "jesse-tree-ornaments": JESSE_TREE_ORNAMENTS as unknown as ActivityDoc,
  "prepare-the-way": PREPARE_THE_WAY as unknown as ActivityDoc,
  "yes-with-a-smile": YES_WITH_A_SMILE as unknown as ActivityDoc,
  "white-flower-for-mary": WHITE_FLOWER_FOR_MARY as unknown as ActivityDoc,
  "come-lord-jesus": COME_LORD_JESUS as unknown as ActivityDoc,
  "straw-for-the-manger": STRAW_FOR_THE_MANGER as unknown as ActivityDoc,
  "jesse-tree-picture-a-day": JESSE_TREE_PICTURE_A_DAY as unknown as ActivityDoc,
  "helping-hands-like-mary": HELPING_HANDS_LIKE_MARY as unknown as ActivityDoc,
  "secret-kindness-notes": SECRET_KINDNESS_NOTES as unknown as ActivityDoc,
  "roses-for-mary": ROSES_FOR_MARY as unknown as ActivityDoc,
  "o-antiphon-ornaments": O_ANTIPHON_ORNAMENTS as unknown as ActivityDoc,
  "family-advent-calendar": FAMILY_ADVENT_CALENDAR as unknown as ActivityDoc,
  "colour-the-advent-candles": COLOUR_THE_ADVENT_CANDLES as unknown as ActivityDoc,
  "paper-advent-wreath": PAPER_ADVENT_WREATH as unknown as ActivityDoc,
  "light-the-advent-candle": LIGHT_THE_ADVENT_CANDLE as unknown as ActivityDoc,
  "advent-candle-craft": ADVENT_CANDLE_CRAFT as unknown as ActivityDoc,
};

export function getActivityModel(slug: string): ActivityDoc | null {
  return MODELS[slug] ?? null;
}
