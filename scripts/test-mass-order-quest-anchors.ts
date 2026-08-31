import { MASS_PREVIEW_LINES } from "../src/lib/mass-participation/preview-script";
import {
  MASS_ORDER_QUEST_ANCHORS,
  getQuestStepBounds,
  resolveQuestAnchorIndex,
} from "../src/lib/mass-participation/mass-order-quest-anchors";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(MASS_ORDER_QUEST_ANCHORS.length === 24, "expected 24 mass order anchors");

for (const anchorId of MASS_ORDER_QUEST_ANCHORS) {
  assert(
    MASS_PREVIEW_LINES.some((line) => line.id === anchorId),
    `missing participation line for anchor ${anchorId}`,
  );
}

const ordinaryFiltered = MASS_PREVIEW_LINES.slice();
const adventFiltered = MASS_PREVIEW_LINES.filter((line) => line.skipWhen !== "advent-lent");

const kyrieStart = resolveQuestAnchorIndex("intro-11", MASS_PREVIEW_LINES, ordinaryFiltered);
assert(ordinaryFiltered[kyrieStart]?.id === "intro-11", "Kyrie anchor");

const gloriaLent = resolveQuestAnchorIndex("intro-12", MASS_PREVIEW_LINES, adventFiltered);
assert(
  adventFiltered[gloriaLent]?.id === "intro-14b" || adventFiltered[gloriaLent]?.id === "intro-15",
  "Gloria anchor resolves during Advent/Lent",
);

const creedBounds = getQuestStepBounds(12, MASS_PREVIEW_LINES, ordinaryFiltered);
assert(
  ordinaryFiltered[creedBounds.start]?.id === "word-9b2",
  "Apostles' Creed step starts at creed rubric",
);

console.log("test-mass-order-quest-anchors: ok");
