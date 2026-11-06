import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { SITE_COPY_DEFAULTS } from "../prisma/data/site-copy-defaults";
import {
  formatVestmentRoundQuestion, isCorrectVestmentAnswer, LITURGICAL_DRESS_ROUNDS,
  shuffleRounds, VESTMENT_COLORS, VESTMENT_COLOR_ORDER, VESTMENT_ROUND_COPY_KEY,
  VESTMENT_ROUND_QUESTION_KEY, type VestmentColor,
} from "../src/lib/liturgical-vestments-game";
import { VESTMENT_CANVAS, VESTMENT_CHARACTER_ASSETS, VESTMENT_CHARACTER_IMAGES, VESTMENT_DEFAULT_COLOR } from "../src/lib/liturgical-vestments-assets";
import { createVestmentGameState, vestmentGameReducer as reduce } from "../src/lib/liturgical-vestments-state";
import { EXPECTED_VESTMENT_LABELS, EXPECTED_VESTMENT_QUIZ, REVIEWED_VESTMENT_HASHES } from "./vestments-test-fixtures";

async function main() {
  const copy = Object.fromEntries(SITE_COPY_DEFAULTS.map((row) => [row.key, row.value]));
  const ids = LITURGICAL_DRESS_ROUNDS.map((round) => round.id);
  assert.equal(ids.length, 12);
  assert.equal(new Set(ids).size, 12);
  assert.deepEqual([...ids].sort(), Object.keys(EXPECTED_VESTMENT_QUIZ).sort());
  assert.deepEqual(Object.keys(VESTMENT_ROUND_COPY_KEY).sort(), [...ids].sort());
  assert.equal(new Set(Object.values(VESTMENT_ROUND_COPY_KEY)).size, 12);
  assert.deepEqual([...VESTMENT_COLOR_ORDER], Object.keys(EXPECTED_VESTMENT_LABELS));
  assert.deepEqual(Object.keys(VESTMENT_COLORS).sort(), [...VESTMENT_COLOR_ORDER].sort());
  assert.deepEqual(Object.keys(VESTMENT_CHARACTER_ASSETS).sort(), [...VESTMENT_COLOR_ORDER].sort());
  assert.equal(copy["play.vestments.color.lavender"], undefined);
  const normalize = (text: string) => text.replace(/[\u2013\u2014]/g, "-");
  let correctPaths = 0;
  let wrongPaths = 0;
  for (const round of LITURGICAL_DRESS_ROUNDS) {
    const expected = EXPECTED_VESTMENT_QUIZ[round.id as keyof typeof EXPECTED_VESTMENT_QUIZ];
    assert.equal(normalize(round.title), expected.title, round.id + " fallback title");
    const occasion = copy[VESTMENT_ROUND_COPY_KEY[round.id]!];
    assert.equal(normalize(occasion), expected.title, round.id + " copy key");
    assert.deepEqual([round.correctColor, ...(round.alternateColors ?? [])], expected.colors, round.id + " liturgical answers");
    const question = formatVestmentRoundQuestion(occasion, copy[VESTMENT_ROUND_QUESTION_KEY]);
    assert.equal(normalize(question), `${expected.title} - What color vestments does Father wear?`);
    assert.ok(!question.includes("{occasion}"));
    assert.ok(formatVestmentRoundQuestion(occasion).startsWith(occasion));
    assert.equal(formatVestmentRoundQuestion(occasion, "When {occasion}?"), `When ${occasion}?`);
    for (const color of VESTMENT_COLOR_ORDER) {
      const accepted = (expected.colors as readonly string[]).includes(color);
      assert.equal(isCorrectVestmentAnswer(round, color), accepted, `${round.id}/${color}`);
      let state = createVestmentGameState([round]);
      assert.equal(reduce(state, { type: "check" }), state, "no selection cannot score");
      assert.equal(reduce(state, { type: "next" }), state, "unanswered round cannot advance");
      state = reduce(state, { type: "select", color });
      assert.equal(state.selected, color);
      state = reduce(state, { type: "check" });
      assert.equal(state.feedback, accepted ? "correct" : "wrong");
      assert.equal(state.score, accepted ? 1 : 0);
      assert.equal(reduce(state, { type: "check" }), state, "no repeat scoring");
      for (const other of VESTMENT_COLOR_ORDER) {
        assert.equal(reduce(state, { type: "select", color: other }), state, "submitted choice locked");
      }
      state = reduce(state, { type: "next" });
      assert.equal(state.done, true);
      assert.equal(state.selected, null);
      assert.equal(state.feedback, "idle");
      for (const action of [{ type: "check" }, { type: "next" }, { type: "select", color }] as const) {
        assert.equal(reduce(state, action), state, "completed game cannot change");
      }
      state = reduce(state, { type: "restart", rounds: [...LITURGICAL_DRESS_ROUNDS].reverse() });
      assert.equal(state.rounds[0]?.id, "lent-5");
      assert.deepEqual([state.index, state.score, state.selected, state.feedback, state.done], [0, 0, null, "idle", false]);
      if (accepted) correctPaths++; else wrongPaths++;
    }
  }
  assert.equal(correctPaths, 14);
  assert.equal(wrongPaths, 46);
  let state = createVestmentGameState();
  assert.deepEqual(state, createVestmentGameState(), "deterministic SSR initializer");
  assert.equal(reduce(state, { type: "select", color: "lavender" as VestmentColor }), state, "removed runtime ID rejected");
  state = reduce(state, { type: "select", color: "red" });
  state = reduce(state, { type: "select", color: "green" });
  assert.equal(state.selected, "green", "choice can change before submitting");
  state = reduce(state, { type: "restart", rounds: LITURGICAL_DRESS_ROUNDS });
  let expectedScore = 0;
  for (let index = 0; index < 12; index++) {
    const round = state.rounds[index]!;
    assert.equal(state.index, index);
    assert.equal(state.selected, null);
    assert.equal(state.feedback, "idle");
    const color = index % 2 === 0 ? round.correctColor : VESTMENT_COLOR_ORDER.find((candidate) => !isCorrectVestmentAnswer(round, candidate))!;
    state = reduce(reduce(state, { type: "select", color }), { type: "check" });
    if (index % 2 === 0) expectedScore++;
    assert.equal(state.score, expectedScore);
    state = reduce(state, { type: "next" });
    assert.equal(state.done, index === 11);
    assert.equal(reduce(state, { type: "next" }), state, "double Next cannot skip a round");
  }
  assert.equal(state.score, 6);
  for (const mode of ["all-correct", "all-wrong", "optional-purple"] as const) {
    let fullGame = createVestmentGameState();
    for (const round of fullGame.rounds) {
      const color = mode === "all-wrong"
        ? VESTMENT_COLOR_ORDER.find((candidate) => !isCorrectVestmentAnswer(round, candidate))!
        : mode === "optional-purple" ? round.alternateColors?.[0] ?? round.correctColor : round.correctColor;
      fullGame = reduce(reduce(fullGame, { type: "select", color }), { type: "check" });
      const reset = reduce(fullGame, { type: "restart", rounds: LITURGICAL_DRESS_ROUNDS });
      assert.deepEqual([reset.index, reset.score, reset.selected, reset.feedback, reset.done], [0, 0, null, "idle", false], "mid-game restart clears answered state");
      fullGame = reduce(fullGame, { type: "next" });
    }
    assert.equal(fullGame.done, true);
    assert.equal(fullGame.score, mode === "all-wrong" ? 0 : 12, mode);
  }
  assert.equal(createVestmentGameState([]).done, true);
  const baseline = JSON.stringify(LITURGICAL_DRESS_ROUNDS);
  const seededRandom = (seed: number) => () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  for (let seed = 0; seed < 100; seed++) {
    const shuffled = shuffleRounds(seededRandom(seed));
    assert.deepEqual(shuffled, shuffleRounds(seededRandom(seed)), "seeded shuffle reproducible");
    assert.deepEqual(shuffled.map((round) => round.id).sort(), [...ids].sort());
    assert.notEqual(shuffled, LITURGICAL_DRESS_ROUNDS);
    assert.ok(shuffled.every((round) => VESTMENT_COLOR_ORDER.includes(round.correctColor)));
  }
  for (const random of [() => 0, () => 0.999999]) {
    assert.deepEqual(shuffleRounds(random).map((round) => round.id).sort(), [...ids].sort());
  }
  assert.equal(JSON.stringify(LITURGICAL_DRESS_ROUNDS), baseline, "shuffle never mutates source");
  assert.equal(VESTMENT_DEFAULT_COLOR, "white");
  for (const color of VESTMENT_COLOR_ORDER) {
    assert.equal(VESTMENT_COLORS[color].label, EXPECTED_VESTMENT_LABELS[color]);
    assert.equal(copy[`play.vestments.color.${color}`], EXPECTED_VESTMENT_LABELS[color]);
    assert.match(VESTMENT_COLORS[color].hex, /^#[0-9a-f]{6}$/i);
    const expectedPath = `/games/liturgical-vestments/character-${color}.png`;
    assert.equal(VESTMENT_CHARACTER_ASSETS[color], expectedPath);
    assert.equal(VESTMENT_CHARACTER_IMAGES.dressed(color), expectedPath);
    const image = readFileSync(path.join(process.cwd(), "public", expectedPath));
    assert.equal(createHash("sha256").update(image).digest("hex"), REVIEWED_VESTMENT_HASHES[color], `${color} artwork changed: visually review before updating hash`);
    const metadata = await sharp(image).metadata();
    assert.equal(metadata.width, VESTMENT_CANVAS.width);
    assert.equal(metadata.height, VESTMENT_CANVAS.height);
  }
  for (const file of ["src/lib/liturgical-vestments-game.ts", "src/lib/liturgical-vestments-assets.ts", "src/lib/liturgical-vestments-state.ts", "src/components/LiturgicalVestmentsGame.tsx", "src/components/liturgical-vestments/PriestVestmentFigure.tsx", "scripts/split-vestment-spritesheet.mjs", "scripts/optimize-vestment-pngs.mjs"]) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /lavender|Light purple|setSelected|setFeedback/);
  }
  console.log(`PASS: ${ids.length} questions; ${VESTMENT_COLOR_ORDER.length} reviewed color/assets; ${correctPaths + wrongPaths} answer paths (${correctPaths} correct, ${wrongPaths} wrong); scoring/advance/restart guards; 102 deterministic shuffles.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
