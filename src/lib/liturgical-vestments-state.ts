import {
  isCorrectVestmentAnswer,
  LITURGICAL_DRESS_ROUNDS,
  VESTMENT_COLOR_ORDER,
  type LiturgicalDressRound,
  type VestmentColor,
} from "@/lib/liturgical-vestments-game";

export type VestmentGameState = {
  rounds: readonly LiturgicalDressRound[];
  index: number;
  score: number;
  selected: VestmentColor | null;
  feedback: "idle" | "correct" | "wrong";
  done: boolean;
};

export type VestmentGameAction =
  | { type: "select"; color: VestmentColor }
  | { type: "check" }
  | { type: "next" }
  | { type: "restart"; rounds: readonly LiturgicalDressRound[] };

export function createVestmentGameState(
  rounds: readonly LiturgicalDressRound[] = LITURGICAL_DRESS_ROUNDS,
): VestmentGameState {
  return { rounds: [...rounds], index: 0, score: 0, selected: null, feedback: "idle", done: rounds.length === 0 };
}

/** One submitted answer per round; neither changing color nor repeated checks can inflate the score. */
export function vestmentGameReducer(state: VestmentGameState, action: VestmentGameAction): VestmentGameState {
  if (action.type === "restart") return createVestmentGameState(action.rounds);
  if (state.done) return state;
  switch (action.type) {
    case "select":
      if (state.feedback !== "idle" || !VESTMENT_COLOR_ORDER.includes(action.color)) return state;
      return { ...state, selected: action.color };
    case "check": {
      const round = state.rounds[state.index];
      if (!round || !state.selected || state.feedback !== "idle") return state;
      const correct = isCorrectVestmentAnswer(round, state.selected);
      return { ...state, feedback: correct ? "correct" : "wrong", score: state.score + (correct ? 1 : 0) };
    }
    case "next":
      if (state.feedback === "idle") return state;
      return {
        ...state,
        index: Math.min(state.index + 1, state.rounds.length - 1),
        selected: null,
        feedback: "idle",
        done: state.index + 1 >= state.rounds.length,
      };
  }
}
