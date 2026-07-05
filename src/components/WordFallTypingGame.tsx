"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TypingWordItem = { id: string; word: string; hint: string; sortOrder?: number };

type FallingWord = {
  uid: number;
  word: string;
  hint: string;
  x: number;
  y: number;
};

export type WordFallDifficulty = "easy" | "medium" | "hard";

const DIFFICULTY_OPTIONS: { id: WordFallDifficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

const DIFFICULTY_CONFIG: Record<
  WordFallDifficulty,
  {
    fallSpeed: number;
    spawnMs: number;
    maxOnScreen: number;
    lives: number;
    maxSortOrder: number;
    maxWordLength: number;
  }
> = {
  easy: {
    fallSpeed: 0.14,
    spawnMs: 3000,
    maxOnScreen: 4,
    lives: 5,
    maxSortOrder: 1,
    maxWordLength: 8,
  },
  medium: {
    fallSpeed: 0.22,
    spawnMs: 2200,
    maxOnScreen: 6,
    lives: 3,
    maxSortOrder: 2,
    maxWordLength: 14,
  },
  hard: {
    fallSpeed: 0.3,
    spawnMs: 1700,
    maxOnScreen: 8,
    lives: 3,
    maxSortOrder: 4,
    maxWordLength: 64,
  },
};

const DEFAULT_WORDS: TypingWordItem[] = [
  { id: "d1", word: "grace", hint: "God's help", sortOrder: 0 },
  { id: "d2", word: "faith", hint: "Trust in God", sortOrder: 1 },
  { id: "d3", word: "hope", hint: "", sortOrder: 1 },
  { id: "d4", word: "love", hint: "", sortOrder: 1 },
  { id: "d5", word: "amen", hint: "So be it", sortOrder: 0 },
  { id: "d6", word: "alleluia", hint: "Praise God", sortOrder: 0 },
];

/** Center X (%) so the whole bubble stays inside the playfield. */
function randomSpawnCenterX(word: string, hint: string): number {
  const label = hint ? `${word} (${hint})` : word;
  const halfWidthPct = Math.min(42, 4 + label.length * 0.85);
  const margin = 2;
  const minCenter = halfWidthPct + margin;
  const maxCenter = 100 - halfWidthPct - margin;
  if (minCenter >= maxCenter) return 50;
  return minCenter + Math.random() * (maxCenter - minCenter);
}

function shuffleWords<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function filterPool(all: TypingWordItem[], difficulty: WordFallDifficulty): TypingWordItem[] {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const filtered = all.filter((w) => {
    const sort = w.sortOrder ?? 0;
    return sort <= cfg.maxSortOrder && w.word.length <= cfg.maxWordLength;
  });
  return filtered.length > 0 ? filtered : all.filter((w) => w.word.length <= cfg.maxWordLength);
}

type Props = {
  /** Limit pool to these words (lowercase match). */
  wordFilter?: string[];
  /** Lesson kit words — skips global /api/typing-words when set. */
  customWords?: TypingWordItem[];
  /** Hide difficulty controls (lesson embed). */
  compact?: boolean;
};

export function WordFallTypingGame({ wordFilter, customWords, compact = false }: Props) {
  const [allWords, setAllWords] = useState<TypingWordItem[]>(customWords ?? []);
  const [difficulty, setDifficulty] = useState<WordFallDifficulty>("medium");
  const [falling, setFalling] = useState<FallingWord[]>([]);
  const [draft, setDraft] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(DIFFICULTY_CONFIG.medium.lives);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const uidRef = useRef(0);
  const poolIndexRef = useRef(0);
  const shuffledPoolRef = useRef<TypingWordItem[]>([]);
  const spawnTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const config = DIFFICULTY_CONFIG[difficulty];

  const pool = useMemo(() => {
    let base = filterPool(allWords.length > 0 ? allWords : DEFAULT_WORDS, difficulty);
    if (wordFilter?.length) {
      const set = new Set(wordFilter.map((w) => w.toLowerCase()));
      base = base.filter((w) => set.has(w.word.toLowerCase()));
      if (base.length === 0) {
        base = (allWords.length > 0 ? allWords : DEFAULT_WORDS).filter((w) =>
          set.has(w.word.toLowerCase()),
        );
      }
    }
    return base;
  }, [allWords, difficulty, wordFilter]);

  useEffect(() => {
    if (customWords?.length) {
      setAllWords(customWords);
      return;
    }
    fetch("/api/typing-words")
      .then((r) => r.json())
      .then((items: TypingWordItem[]) => {
        if (Array.isArray(items) && items.length > 0) setAllWords(items);
        else setAllWords(DEFAULT_WORDS);
      })
      .catch(() => setAllWords(DEFAULT_WORDS));
  }, [customWords]);

  const resetGame = useCallback(
    (nextDifficulty?: WordFallDifficulty) => {
      const d = nextDifficulty ?? difficulty;
      const cfg = DIFFICULTY_CONFIG[d];
      setFalling([]);
      setDraft("");
      setScore(0);
      setLives(cfg.lives);
      setGameOver(false);
      setPaused(false);
      shuffledPoolRef.current = shuffleWords(
        filterPool(allWords.length > 0 ? allWords : DEFAULT_WORDS, d),
      );
      poolIndexRef.current = 0;
    },
    [difficulty, allWords],
  );

  const changeDifficulty = (next: WordFallDifficulty) => {
    setDifficulty(next);
    resetGame(next);
  };

  const reshufflePool = useCallback(() => {
    shuffledPoolRef.current = shuffleWords(pool);
    poolIndexRef.current = 0;
  }, [pool]);

  useEffect(() => {
    reshufflePool();
  }, [reshufflePool]);

  const nextWordFromPool = useCallback((): TypingWordItem | null => {
    if (pool.length === 0) return null;
    if (
      shuffledPoolRef.current.length === 0 ||
      poolIndexRef.current >= shuffledPoolRef.current.length
    ) {
      shuffledPoolRef.current = shuffleWords(pool);
      poolIndexRef.current = 0;
    }
    const item = shuffledPoolRef.current[poolIndexRef.current]!;
    poolIndexRef.current += 1;
    return item;
  }, [pool]);

  const spawnWord = useCallback(() => {
    const item = nextWordFromPool();
    if (!item) return;
    uidRef.current += 1;
    const x = randomSpawnCenterX(item.word, item.hint);
    setFalling((prev) => {
      if (prev.length >= config.maxOnScreen) return prev;
      return [
        ...prev,
        {
          uid: uidRef.current,
          word: item.word,
          hint: item.hint,
          x,
          y: -6,
        },
      ];
    });
  }, [nextWordFromPool, config.maxOnScreen]);

  useEffect(() => {
    if (gameOver || paused || pool.length === 0) return;

    spawnTimerRef.current = window.setInterval(() => {
      spawnWord();
    }, config.spawnMs);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [gameOver, paused, pool.length, spawnWord, config.spawnMs]);

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
          const y = w.y + config.fallSpeed;
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
  }, [gameOver, paused, config.fallSpeed]);

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
      {!compact && (
        <>
          <p className="border-b border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-muted)]">
            <strong className="text-[var(--color-ink)]">Word mode:</strong> church words fall from
            the top—good for spelling saints, seasons, and Mass vocabulary. Start on Easy for
            younger grades.
          </p>
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--color-ink)]">Difficulty</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => changeDifficulty(opt.id)}
                  className={`border px-4 py-2 text-sm font-bold transition ${
                    difficulty === opt.id
                      ? "border-[var(--color-accent)] bg-white text-[var(--color-ink)]"
                      : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <p className="text-sm text-[var(--color-muted)]">
          Type each word before it lands. {pool.length} words in this level.
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
            onClick={() => resetGame()}
            className="border border-[var(--color-border)] px-2 py-0.5 text-xs"
          >
            Restart
          </button>
        </div>
      </div>

      <div className="relative h-[min(52vh,420px)] overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 px-3 sm:px-5">
        <div className="relative h-full w-full">
          {falling.map((w) => (
            <div
              key={w.uid}
              className="pointer-events-none absolute max-w-[min(100%,calc(100%-1rem))] -translate-x-1/2 whitespace-nowrap rounded-md border border-sky-200/80 bg-white/95 px-3 py-1.5 shadow-md"
              style={{
                left: `${w.x}%`,
                top: `${w.y}%`,
              }}
            >
              <span className="text-lg font-bold tracking-wide text-[var(--color-ink)]">{w.word}</span>
              {w.hint && (
                <span className="ml-2 text-xs text-[var(--color-muted)]">({w.hint})</span>
              )}
            </div>
          ))}
        </div>

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75">
            <p className="text-xl font-bold text-[var(--color-ink)]">Game over</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Final score: {score}</p>
            <button
              type="button"
              onClick={() => resetGame()}
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
