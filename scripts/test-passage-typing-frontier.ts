import { normalizePassageText } from "../src/lib/typing-accuracy";
import {
  tryAppendMatchingFrontier,
  tryConfirmGhostSuffixAtSelection,
} from "../src/lib/passage-typing-frontier";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const target = normalizePassageText(
  "Therefore the Son of man is Lord of the sabbath also.",
);
const typed = target.slice(0, -1);

assert(
  tryAppendMatchingFrontier(typed, target, ".") === target,
  "append final period at frontier",
);

assert(
  tryConfirmGhostSuffixAtSelection(typed, target, typed.length, typed.length) === null,
  "do not auto-advance at frontier without explicit insert",
);

const withTrailingSpace = `${typed} `;
const normLen = normalizePassageText(withTrailingSpace).length;
assert(normLen === typed.length, "trailing space normalizes away");
assert(
  tryAppendMatchingFrontier(normalizePassageText(withTrailingSpace), target, ".") === target,
  "append period using normalized frontier length",
);

console.log("passage-typing-frontier tests passed");
