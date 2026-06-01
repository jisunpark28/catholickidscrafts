"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TypingWordItem = { id: string; word: string; hint: string };

type FallingWord = {
  uid: number;
  word: string;
  hint: string;
  x: number;
  y: number;
};

const FALL_SPEED = 0.22;
const SPAWN_MS = 2200;
const MAX_ON_SCREEN = 6;
const LIVES_START = 3;

const DEFAULT_WORDS: TypingWordItem[] = [
  { id: "d1", word: "grace", hint: "God's help" },
  { id: "d2", word: "faith", hint: "Trust in God" },
  { id: "d3", word: "hope", hint: "" },
  { id: "d4", word: "love", hint: "" },
  { id: "d5", word: "amen", hint: "So be it" },
  { id: "d6", word: "alleluia", hint: "Praise God" },
];

export function WordFallTypingGame() {
  const [pool, setPool] = useState<TypingWordItem[]>([]);
  const [falling, setFalling] = useState<FallingWord[]>([]);
  const [draft, setDraft] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES_START);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const uidRef = useRef(0);
  const poolIndexRef = useRef(0);
  const spawnTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/typing-words")
      .then((r) => r.json())
      .then((items: TypingWordItem[]) => {
        if (Array.isArray(items) && items.length > 0) setPool(items);
        else setPool(DEFAULT_WORDS);
      })
      .catch(() => setPool(DEFAULT_WORDS));
  }, []);

  const nextWordFromPool = useCallback((): TypingWordItem | null => {
    if (pool.length === 0) return null;
    const item = pool[poolIndexRef.current % pool.length]!;
    poolIndexRef.current += 1;
    return item;
  }, [pool]);

  const spawnWord = useCallback(() => {
    const item = nextWordFromPool();
    if (!item) return;
    uidRef.current += 1;
    const x = 8 + Math.random() * 84;
    setFalling((prev) => {
      if (prev.length >= MAX_ON_SCREEN) return prev;
      return [
        ...prev,
        {
          uid: uidRef.current,
          word: item.word,
          hint: item.hint,
          x,
          y: -8,
        },
      ];
    });
  }, [nextWordFromPool]);

  const resetGame = useCallback(() => {
    setFalling([]);
    setDraft("");
    setScore(0);
    setLives(LIVES_START);
    setGameOver(false);
    setPaused(false);
    poolIndexRef.current = 0;
  }, []);

  useEffect(() => {
    if (gameOver || paused || pool.length === 0) return;

    spawnTimerRef.current = window.setInterval(() => {
      if (!gameOver) spawnWord();
    }, SPAWN_MS);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [gameOver, paused, pool.length, spawnWord]);

  useEffect(() => {
    if (gameOver || paused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = () => {
      setFalling((prev) => {
        const next: FallingWord[] = [];
        let lostLife = false;
        for (const w of prev) {
          const y = w.y + FALL_SPEED;
          if (y >= 100) {
            lostLife = true;
          } else {
            next.push({ ...w, y });
          }
        }
        if (lostLife) {
          setLives((l) => {
            const n = l - 1;
            if (n <= 0) setGameOver(true);
            return Math.max(0, n);
          });
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameOver, paused]);

  useEffect(() => {
    const trimmed = draft.trim().toLowerCase();
    if (!trimmed) return;

    setFalling((prev) => {
      const match = prev.find((w) => w.word.toLowerCase() === trimmed);
      if (!match) return prev;
      setScore((s) => s + 1);
      setDraft("");
      return prev.filter((w) => w.uid !== match.uid);
    });
  }, [draft]);

  return (
    <div className="border border-[var(--color-border)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <p className="text-sm text-[var(--color-muted)]">
          Type each word before it reaches the ground. Press Enter or match exactly.
        </p>
        <div className="flex flex-wrap gap-4 text-sm font-semibold">
          <span>Score: {score}</span>
          <span>Lives: {"♥".repeat(lives) || "—"}</span>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="border border-[var(--color-border)] px-2 py-0.5 text-xs"
            disabled={gameOver}
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={resetGame}
            className="border border-[var(--color-border)] px-2 py-0.5 text-xs"
          >
            Restart
          </button>
        </div>
      </div>

      <div className="relative h-[min(52vh,420px)] overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50">
        {falling.map((w) => (
          <div
            key={w.uid}
            className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap rounded-md border border-sky-200/80 bg-white/90 px-3 py-1.5 shadow-md"
            style={{ left: `${w.x}%`, top: `${w.y}%` }}
          >
            <span className="text-lg font-bold tracking-wide text-[var(--color-ink)]">{w.word}</span>
            {w.hint && (
              <span className="ml-2 text-xs text-[var(--color-muted)]">({w.hint})</span>
            )}
          </div>
        ))}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75">
            <p className="text-xl font-bold text-[var(--color-ink)]">Game over</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Final score: {score}</p>
            <button
              type="button"
              onClick={resetGame}
              className="mt-4 bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white"
            >
              Play again
            </button>
          </div>
        )}

        {paused && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 text-lg font-bold">
            Paused
          </div>
        )}
      </div>

      <div className="border-t border-[var(--color-border)] px-4 py-4">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const trimmed = draft.trim().toLowerCase();
              const match = falling.find((w) => w.word.toLowerCase() === trimmed);
              if (match) {
                setFalling((prev) => prev.filter((w) => w.uid !== match.uid));
                setScore((s) => s + 1);
                setDraft("");
              }
            }
          }}
          disabled={gameOver || paused}
          className="w-full border border-[var(--color-border)] px-3 py-3 font-mono text-lg"
          placeholder="Type the falling word…"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoFocus
        />
      </div>
    </div>
  );
}
