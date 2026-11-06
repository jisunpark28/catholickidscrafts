"use client";

import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { PriestVestmentFigure } from "@/components/liturgical-vestments/PriestVestmentFigure";
import {
  formatVestmentRoundQuestion,
  shuffleRounds,
  LITURGICAL_DRESS_ROUNDS,
  VESTMENT_COLOR_ORDER,
  VESTMENT_COLORS,
  VESTMENT_ROUND_COPY_KEY,
  VESTMENT_ROUND_QUESTION_FALLBACK,
  VESTMENT_ROUND_QUESTION_KEY,
} from "@/lib/liturgical-vestments-game";
import { createVestmentGameState, vestmentGameReducer } from "@/lib/liturgical-vestments-state";
import { useEffect, useReducer } from "react";

export function LiturgicalVestmentsGame() {
  const copy = useSiteCopy();
  const t = (key: string, fallback = "") => textFromCopy(copy, key, fallback);
  // Ordered SSR/first client render avoids hydration mismatches; shuffle after mounting.
  const [state, dispatch] = useReducer(vestmentGameReducer, LITURGICAL_DRESS_ROUNDS, createVestmentGameState);
  const { rounds, index, score, selected, feedback, done } = state;
  useEffect(() => {
    dispatch({ type: "restart", rounds: shuffleRounds() });
  }, []);
  const round = rounds[index];
  const progress = { current: Math.min(index + 1, rounds.length), total: rounds.length };
  const colorLabel = (color: keyof typeof VESTMENT_COLORS) =>
    t(`play.vestments.color.${color}`, VESTMENT_COLORS[color].label);

  function restart() {
    dispatch({ type: "restart", rounds: shuffleRounds() });
  }

  if (done) {
    return (
      <div className="border border-[var(--color-border)] bg-white p-8 text-center">
        <p className="text-2xl font-bold text-[var(--color-ink)]">Well done!</p>
        <p className="mt-2 text-lg text-[var(--color-muted)]">
          You dressed Father correctly {score} of {rounds.length} times.
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-6 bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white"
        >
          Play again
        </button>
      </div>
    );
  }

  if (!round) return null;

  const occasion = t(VESTMENT_ROUND_COPY_KEY[round.id] ?? "", round.title);
  const roundQuestion = formatVestmentRoundQuestion(
    occasion,
    t(VESTMENT_ROUND_QUESTION_KEY, VESTMENT_ROUND_QUESTION_FALLBACK),
  );

  return (
    <div className="border border-[var(--color-border)] bg-white" data-vestment-round={round.id}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm">
        <span className="font-semibold">
          Round {progress.current} / {progress.total}
        </span>
        <span className="font-semibold">Score: {score}</span>
      </div>

      <div className="grid gap-6 p-4 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-ink)]">{roundQuestion}</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Choose the usual color for this season or Sunday. Special feast days can have their own colors.
          </p>

          <div className="mt-4 flex justify-center overflow-visible pt-1">
            <PriestVestmentFigure chasubleColor={selected} />
          </div>
        </div>

        <aside className="space-y-4">
          <div>
            <p className="text-sm font-bold text-[var(--color-ink)]">Liturgical colors</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {VESTMENT_COLOR_ORDER.map((key) => {
                const c = VESTMENT_COLORS[key];
                const active = selected === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => dispatch({ type: "select", color: key })}
                    disabled={feedback !== "idle"}
                    aria-pressed={active}
                    className={`flex items-center gap-2 border px-3 py-2 text-left text-sm font-semibold transition disabled:cursor-default ${
                      active
                        ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    <span
                      className="h-6 w-6 shrink-0 rounded-full border"
                      style={{ background: c.hex, borderColor: c.stroke }}
                    />
                    {colorLabel(key)}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch({ type: "check" })}
            disabled={!selected || feedback !== "idle"}
            className="w-full bg-[var(--color-accent)] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            Check vestments
          </button>

          {feedback !== "idle" && round.alternateColors?.includes("purple") && (
            <p className="text-sm text-[var(--color-muted)]">
              Rose (pink) may be worn on this Sunday; the seasonal purple is also correct.
            </p>
          )}

          {feedback === "correct" && (
            <div className="border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-900">
              <p className="font-bold">Correct!</p>
              <p className="mt-1">
                {selected && colorLabel(selected)} is right for {occasion}.
              </p>
              <button
                type="button"
                onClick={() => dispatch({ type: "next" })}
                className="mt-3 w-full border border-green-700 bg-white py-2 font-bold text-green-900"
              >
                Next →
              </button>
            </div>
          )}

          {feedback === "wrong" && (
            <div className="border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
              <p className="font-bold">Not quite.</p>
              <p className="mt-1">
                For {occasion}, choose{" "}
                <strong>{[round.correctColor, ...(round.alternateColors ?? [])].map(colorLabel).join(" or ")}</strong> vestments.
              </p>
              <button
                type="button"
                onClick={() => dispatch({ type: "next" })}
                className="mt-3 w-full border border-amber-800 bg-white py-2 font-bold"
              >
                Try next round →
              </button>
            </div>
          )}

        </aside>
      </div>
    </div>
  );
}
