import type { GospelSheetLevel } from "@/lib/gospel-sheet-schema";
import type { SheetLevelNumber } from "@/lib/gospel-sheet-level";
import type { SheetActivity, SheetActivityType } from "@/lib/sheet-activities/schema";
import { HeartActivity } from "./Heart";
import { MazeActivity } from "./Maze";
import {
  AcrosticActivity,
  BadgeActivity,
  BeadsActivity,
  BingoActivity,
  CandlesActivity,
  ChecklistActivity,
  ClockActivity,
  ColorNumActivity,
  CopyVerseActivity,
  CrosswordActivity,
  FacesActivity,
  FixWordsActivity,
  FoldRevealActivity,
  HandActivity,
  LetterActivity,
  ScaleActivity,
  SpeechActivity,
  SpotDiffActivity,
  SudokuActivity,
  SymmetryActivity,
  TallyActivity,
  ThermometerActivity,
  TrackerActivity,
  TreeActivity,
  TrueFalseActivity,
  WhoAmIActivity,
  WordOrderActivity,
} from "./MoreActivities";

import { SecretCodeActivity, WordFindActivity } from "./Puzzles";
import { DotToDotActivity, ShapeCraftActivity } from "./Shapes";
import {
  DrawSceneActivity,
  FillBlankActivity,
  FindHiddenActivity,
  MatchUpActivity,
  PrayerFrameActivity,
  SequenceActivity,
  SortingActivity,
} from "./TextActivities";

const TITLES: Record<SheetActivityType, [string, string]> = {
  heart: ["", ""],
  maze: ["Find the way", "Find the way"],
  matchup: ["Match them up", "Match the sentence halves"],
  sequence: ["What happened first?", "Put the story in order"],
  wordfind: ["Circle the word", "Word search"],
  fillblank: ["Fill in the missing word", "Complete the verse"],
  drawscene: ["Draw the story", "Draw and write"],
  findhidden: ["Find and color", "Find and count"],
  shapecraft: ["Color and cut", "Make and keep"],
  secretcode: ["Secret message", "Crack the code"],
  sorting: ["Sort it out", "Sort it out"],
  dottodot: ["Connect the dots", "Connect the dots"],
  prayerframe: ["My prayer", "My letter to God"],
  speech: ["Who said it?", "Speech bubbles"],
  faces: ["How do they feel?", "How do they feel?"],
  symmetry: ["Finish the picture", "Mirror drawing"],
  colornum: ["Color by number", "Hidden picture"],
  crossword: ["Little crossword", "Crossword"],
  spotdiff: ["Spot the difference", "Spot the difference"],
  sudoku: ["Picture puzzle", "Picture sudoku"],
  fixwords: ["Oops! Fix the words", "Fix the verse"],
  wordorder: ["Put the words in order", "Put the words in order"],
  truefalse: ["Yes or no?", "True or false?"],
  whoami: ["Who am I?", "Who am I?"],
  bingo: ["Mass bingo", "Mass bingo"],
  tracker: ["My week with Jesus", "My 7-day check"],
  tally: ["Listen and count", "Listen and count"],
  foldreveal: ["Fold and find out", "Fold and reveal"],
  hand: ["Praying hand", "Five-finger prayer"],
  thermometer: ["How warm is my heart?", "Love thermometer"],
  scale: ["Balance it!", "Weigh it up"],
  clock: ["Time to pray", "My prayer clock"],
  beads: ["Prayer beads", "Prayer beads"],
  candles: ["Light the candles", "Candles of faith"],
  badge: ["My faith badge", "Design a badge"],
  tree: ["Thank-you tree", "Thank-you tree"],
  letter: ["Write a note", "Write a note"],
  checklist: ["My mission", "My mission"],
  acrostic: ["Word poem", "Acrostic poem"],
  copyverse: ["Trace the verse", "Copy it beautifully"],
};

const INTROS: Record<SheetActivityType, [string, string]> = {
  heart: ["Draw inside the heart, then color it!", "Write 3 ways you can do each, then color the border!"],
  maze: ["Draw the path. Then color!", "Find the only path from start to finish."],
  matchup: ["Draw a line from each word to its picture.", "Draw a line to join each beginning to its ending."],
  sequence: ["Number the pictures 1, 2, 3. Draw each one!", "Write 1, 2, 3 (and 4) to show the order."],
  wordfind: ["Find each word in its row and circle it.", "Words go across, down, and diagonally."],
  fillblank: ["Write the missing word from the word bank.", "Use the word bank. One word is extra!"],
  drawscene: ["", ""],
  findhidden: ["Find each thing in the picture and color it.", "How many of each can you find?"],
  shapecraft: ["Color the shape, then cut on the dashed line.", ""],
  secretcode: ["Use the key to find each letter.", "Use the key: write the letter under each number."],
  sorting: ["Draw a line from each card to the right side.", "Write each card in the right column."],
  dottodot: ["Connect 1 to 12. What did you find? Color it!", "Connect 1 to 24, then color the picture."],
  prayerframe: ["Finish each sentence to talk to Jesus.", "Write a short letter to God."],
  speech: ["Draw what each person is saying or feeling.", "Write what each person might say."],
  faces: ["Draw a face for each person.", "Draw each face, then write one word for the feeling."],
  symmetry: ["Trace the dots to finish the other half. Color it!", "Draw the missing half so both sides match."],
  colornum: ["Color the boxes using the key.", "Color the boxes to find the hidden picture."],
  crossword: ["Fill in the words. The first letter is a clue!", "Use the clues to fill in the crossword."],
  spotdiff: ["Circle the changes in picture B.", "Find and circle every change in picture B."],
  sudoku: ["Draw the missing pictures.", "Fill the grid: no picture twice in a row, column or box."],
  fixwords: ["Find the wrong word and write the right one.", "Find the wrong words and write the correct ones."],
  wordorder: ["Number the cards 1, 2, 3 to make the sentence.", "Number the cards, then write the whole sentence."],
  truefalse: ["Circle YES or NO.", "Circle TRUE or FALSE."],
  whoami: ["Listen to the clues. Circle the answer!", "Read the 3 clues and write the answer."],
  bingo: ["Color a box each time you see or hear it at Mass!", "Mark each word you hear at Mass. Can you get a line?"],
  tracker: ["Color a heart each day you do it!", "Tick each day you do it."],
  tally: ["Make a mark each time you hear the word at Mass.", "Make a tally mark for each time you hear the word."],
  foldreveal: ["Say your answer, then fold to see!", "Write your answer, then unfold to check."],
  hand: ["Trace your hand. Pray for each finger!", "Trace your hand and write a prayer on each finger."],
  thermometer: ["Color up to how you feel today.", "Color up to your level, then think how to go higher."],
  scale: ["Draw on each side.", "Write or draw on each side of the scale."],
  clock: ["Draw the hands at your prayer time.", "Draw the hands for each prayer time."],
  beads: ["Color one bead for each prayer you say.", "Pray and color one bead for each prayer."],
  candles: ["Color the flames and candles.", "Color each candle and write what it means."],
  badge: ["Decorate your badge!", "Design your badge: draw a symbol for this virtue."],
  tree: ["Draw something you are thankful for on each leaf.", "Write one thing on each leaf."],
  letter: ["Draw or write your note.", "Write your note in full sentences."],
  checklist: ["Check each one when you do it!", "Check each box when it is done."],
  acrostic: ["Write a word for each letter.", "Write a line that starts with each letter."],
  copyverse: ["Trace the verse and decorate the frame.", "Copy the verse in your best writing and decorate."],
};

/** Legacy DB sheets have only heart fields: treat them as a heart activity. */
export function activityFor(c: GospelSheetLevel): SheetActivity {
  return c.activity ?? { type: "heart", title: c.heartTitle, a: c.heartLabelA, b: c.heartLabelB, intro: c.heartIntro };
}

function Body({
  activity,
  level,
  seed,
  artFile,
}: {
  activity: SheetActivity;
  level: SheetLevelNumber;
  seed: string;
  artFile: string;
}) {
  switch (activity.type) {
    case "heart":
      return <HeartActivity a={activity.a} b={activity.b} level={level} clipId={`gs-heart-${seed}`} />;
    case "maze":
      return <MazeActivity data={activity} level={level} seed={seed} />;
    case "matchup":
      return <MatchUpActivity data={activity} level={level} seed={seed} />;
    case "sequence":
      return <SequenceActivity data={activity} level={level} seed={seed} />;
    case "wordfind":
      return <WordFindActivity data={activity} level={level} seed={seed} />;
    case "fillblank":
      return <FillBlankActivity data={activity} level={level} seed={seed} />;
    case "drawscene":
      return <DrawSceneActivity data={activity} level={level} />;
    case "findhidden":
      return <FindHiddenActivity data={activity} level={level} artFile={artFile} />;
    case "shapecraft":
      return <ShapeCraftActivity data={activity} level={level} />;
    case "secretcode":
      return <SecretCodeActivity data={activity} level={level} seed={seed} />;
    case "sorting":
      return <SortingActivity data={activity} level={level} seed={seed} />;
    case "dottodot":
      return <DotToDotActivity data={activity} level={level} />;
    case "prayerframe":
      return <PrayerFrameActivity data={activity} level={level} />;
    case "speech":
      return <SpeechActivity data={activity} level={level} />;
    case "faces":
      return <FacesActivity data={activity} level={level} />;
    case "symmetry":
      return <SymmetryActivity data={activity} level={level} seed={seed} />;
    case "colornum":
      return <ColorNumActivity data={activity} level={level} seed={seed} />;
    case "crossword":
      return <CrosswordActivity data={activity} level={level} />;
    case "spotdiff":
      return <SpotDiffActivity data={activity} level={level} artFile={artFile} />;
    case "sudoku":
      return <SudokuActivity data={activity} level={level} seed={seed} />;
    case "fixwords":
      return <FixWordsActivity data={activity} level={level} />;
    case "wordorder":
      return <WordOrderActivity data={activity} level={level} seed={seed} />;
    case "truefalse":
      return <TrueFalseActivity data={activity} level={level} />;
    case "whoami":
      return <WhoAmIActivity data={activity} level={level} />;
    case "bingo":
      return <BingoActivity data={activity} level={level} seed={seed} />;
    case "tracker":
      return <TrackerActivity data={activity} level={level} />;
    case "tally":
      return <TallyActivity data={activity} level={level} />;
    case "foldreveal":
      return <FoldRevealActivity data={activity} level={level} />;
    case "hand":
      return <HandActivity data={activity} level={level} />;
    case "thermometer":
      return <ThermometerActivity data={activity} level={level} />;
    case "scale":
      return <ScaleActivity data={activity} level={level} />;
    case "clock":
      return <ClockActivity data={activity} level={level} />;
    case "beads":
      return <BeadsActivity data={activity} level={level} />;
    case "candles":
      return <CandlesActivity data={activity} level={level} />;
    case "badge":
      return <BadgeActivity data={activity} level={level} />;
    case "tree":
      return <TreeActivity data={activity} level={level} />;
    case "letter":
      return <LetterActivity data={activity} level={level} />;
    case "checklist":
      return <ChecklistActivity data={activity} level={level} />;
    case "acrostic":
      return <AcrosticActivity data={activity} level={level} />;
    case "copyverse":
      return <CopyVerseActivity data={activity} level={level} />;
  }
}

/** The sheet's 3rd section. Same box/size for every activity type. */
export function ActivityBlock({
  activity,
  level,
  seed,
  artFile,
  hideEditableText = false,
}: {
  activity: SheetActivity;
  level: SheetLevelNumber;
  seed: string;
  /** Planned art file name, shown as a placeholder label when art is not ready. */
  artFile?: string;
  /** When true (Fabric base underlay), hide title/intro so overlays can replace them. */
  hideEditableText?: boolean;
}) {
  const idx = level - 1;
  const title = activity.type === "heart" ? activity.title : (activity.title ?? TITLES[activity.type][idx]);
  const intro = activity.intro ?? INTROS[activity.type][idx];
  const hide = hideEditableText ? ({ visibility: "hidden" } as const) : undefined;
  return (
    <div className={`gs-box gs-heart gs-act gs-act-t-${activity.type}`}>
      <h2 data-sheet-field="actTitle" style={hide}>
        {title}
      </h2>
      {artFile && activity.type !== "findhidden" && activity.type !== "spotdiff" ? <div className="gs-ph gs-ph-heart">{artFile}</div> : null}
      {intro ? (
        <div data-sheet-field="actIntro" style={{ fontSize: level === 1 ? 15 : 13, ...hide }}>
          {intro}
        </div>
      ) : null}
      <Body activity={activity} level={level} seed={seed} artFile={artFile ?? "find-art.png"} />
    </div>
  );
}
