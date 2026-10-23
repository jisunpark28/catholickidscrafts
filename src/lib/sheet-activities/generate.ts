import { derange, rng, shuffle } from "./rng";

export type MazeWalls = { cols: number; rows: number; right: boolean[][]; down: boolean[][] };

/** Perfect maze (recursive backtracker); right[r][c] / down[r][c] = wall present. */
export function generateMaze(cols: number, rows: number, seed: string): MazeWalls {
  const rand = rng(`maze:${seed}`);
  const right = Array.from({ length: rows }, () => Array(cols).fill(true) as boolean[]);
  const down = Array.from({ length: rows }, () => Array(cols).fill(true) as boolean[]);
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false) as boolean[]);
  const stack: Array<[number, number]> = [[0, 0]];
  seen[0][0] = true;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const next = shuffle(
      [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ] as Array<[number, number]>,
      rand,
    ).find(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen[nr][nc]);
    if (!next) {
      stack.pop();
      continue;
    }
    const [nr, nc] = next;
    if (nr === r) right[r][Math.min(c, nc)] = false;
    else down[Math.min(r, nr)][c] = false;
    seen[nr][nc] = true;
    stack.push(next);
  }
  return { cols, rows, right, down };
}

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Word search grid. Returns placed words only (unplaceable ones are dropped). */
export function generateWordSearch(words: string[], size: number, seed: string, diagonal: boolean) {
  const rand = rng(`ws:${seed}`);
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""));
  const dirs: Array<[number, number]> = diagonal ? [[0, 1], [1, 0], [1, 1]] : [[0, 1], [1, 0]];
  const placed: string[] = [];
  for (const word of [...words].sort((a, b) => b.length - a.length)) {
    if (word.length > size) continue;
    let ok = false;
    for (let attempt = 0; attempt < 300 && !ok; attempt++) {
      const [dr, dc] = dirs[Math.floor(rand() * dirs.length)];
      const r0 = Math.floor(rand() * (size - dr * (word.length - 1)));
      const c0 = Math.floor(rand() * (size - dc * (word.length - 1)));
      const fits = [...word].every((ch, i) => {
        const g = grid[r0 + dr * i][c0 + dc * i];
        return g === "" || g === ch;
      });
      if (!fits) continue;
      [...word].forEach((ch, i) => (grid[r0 + dr * i][c0 + dc * i] = ch));
      ok = true;
    }
    if (ok) placed.push(word);
  }
  for (const row of grid) for (let c = 0; c < size; c++) if (!row[c]) row[c] = ALPHA[Math.floor(rand() * 26)];
  return { grid, placed: words.filter((w) => placed.includes(w)) };
}

/** One row of random letters per word with the word hidden inside (Level 1 circle-the-word). */
export function generateWordRows(words: string[], width: number, seed: string): string[] {
  const rand = rng(`wr:${seed}`);
  return words.map((w) => {
    const pad = Math.max(0, width - w.length);
    const left = Math.floor(rand() * (pad + 1));
    const noise = (n: number) => Array.from({ length: n }, () => ALPHA[Math.floor(rand() * 26)]).join("");
    return noise(left) + w + noise(pad - left);
  });
}

export const CODE_SYMBOLS = ["★", "●", "▲", "■", "♥", "✚", "◆", "☀", "☾", "✿", "♣", "♪", "☁", "✱", "♦"];

/** Letter -> code (number 1..26 or symbol) for the letters used in `message`. */
export function generateCode(message: string, seed: string, symbols: boolean): Map<string, string> {
  const rand = rng(`code:${seed}`);
  const letters = [...new Set(message.toUpperCase().replace(/[^A-Z]/g, ""))];
  const map = new Map<string, string>();
  if (symbols && letters.length <= CODE_SYMBOLS.length) {
    const syms = shuffle(CODE_SYMBOLS, rand);
    letters.forEach((l, i) => map.set(l, syms[i]));
  } else {
    const nums = shuffle(
      Array.from({ length: 26 }, (_, i) => String(i + 1)),
      rand,
    );
    [...ALPHA].forEach((l, i) => map.set(l, nums[i]));
  }
  return map;
}

export { derange, rng, shuffle };

export type CrossPlacement = { word: string; clue: string; row: number; col: number; across: boolean; num: number };

/** Small deterministic crossword: each word crosses an earlier one where possible, else goes on its own row. */
export function generateCrossword(entries: ReadonlyArray<readonly [string, string]>): {
  rows: number;
  cols: number;
  placed: CrossPlacement[];
} {
  const grid = new Map<string, string>();
  const at = (r: number, c: number) => grid.get(`${r},${c}`);
  const fits = (w: string, r: number, c: number, across: boolean) => {
    let cross = 0;
    for (let i = -1; i <= w.length; i++) {
      const rr = across ? r : r + i;
      const cc = across ? c + i : c;
      const cell = at(rr, cc);
      if (i === -1 || i === w.length) {
        if (cell) return -1;
        continue;
      }
      if (cell) {
        if (cell !== w[i]) return -1;
        cross++;
      } else if (across ? at(rr - 1, cc) || at(rr + 1, cc) : at(rr, cc - 1) || at(rr, cc + 1)) return -1;
    }
    return cross;
  };
  const put = (w: string, r: number, c: number, across: boolean) => {
    for (let i = 0; i < w.length; i++) grid.set(across ? `${r},${c + i}` : `${r + i},${c}`, w[i]);
  };
  const sorted = [...entries].sort((a, b) => b[0].length - a[0].length);
  const raw: Omit<CrossPlacement, "num">[] = [];
  for (const [word, clue] of sorted) {
    let best: [number, number, boolean] | null = null;
    if (raw.length === 0) best = [0, 0, true];
    else
      for (const p of raw) {
        for (let i = 0; i < p.word.length && !best; i++)
          for (let j = 0; j < word.length && !best; j++) {
            if (p.word[i] !== word[j]) continue;
            const across = !p.across;
            const r = p.across ? p.row - j : p.row + i;
            const c = p.across ? p.col + i : p.col - j;
            if (fits(word, r, c, across) > 0) best = [r, c, across];
          }
        if (best) break;
      }
    if (!best) {
      const maxR = Math.max(...raw.map((p) => (p.across ? p.row : p.row + p.word.length - 1)));
      const minC = Math.min(...raw.map((p) => p.col));
      best = [maxR + 2, minC, true];
    }
    put(word, best[0], best[1], best[2]);
    raw.push({ word, clue, row: best[0], col: best[1], across: best[2] });
  }
  const minR = Math.min(...raw.map((p) => p.row));
  const minC = Math.min(...raw.map((p) => p.col));
  const norm = raw.map((p) => ({ ...p, row: p.row - minR, col: p.col - minC }));
  const starts = [...new Set(norm.map((p) => `${p.row},${p.col}`))].sort((a, b) => {
    const [ar, ac] = a.split(",").map(Number);
    const [br, bc] = b.split(",").map(Number);
    return ar - br || ac - bc;
  });
  const placed = norm.map((p) => ({ ...p, num: starts.indexOf(`${p.row},${p.col}`) + 1 }));
  const rows = Math.max(...placed.map((p) => (p.across ? p.row : p.row + p.word.length - 1))) + 1;
  const cols = Math.max(...placed.map((p) => (p.across ? p.col + p.word.length - 1 : p.col))) + 1;
  return { rows, cols, placed };
}

/** 4x4 Latin square (2x2 boxes) with some cells blanked. Values are 0..3. */
export function generateSudoku(seed: string, blanks: number): { solution: number[][]; shown: boolean[][] } {
  const rand = rng(`sudoku:${seed}`);
  const base = [
    [0, 1, 2, 3],
    [2, 3, 0, 1],
    [1, 0, 3, 2],
    [3, 2, 1, 0],
  ];
  const perm = shuffle([0, 1, 2, 3], rand);
  const bandSwap = rand() < 0.5;
  const rowsOrder = bandSwap ? [2, 3, 0, 1] : [0, 1, 2, 3];
  const solution = rowsOrder.map((r) => base[r].map((v) => perm[v]));
  const cells = shuffle(
    Array.from({ length: 16 }, (_, i) => i),
    rand,
  ).slice(0, blanks);
  const shown = solution.map((row, r) => row.map((_, c) => !cells.includes(r * 4 + c)));
  return { solution, shown };
}

/** Grid numbers for colour-by-number: cells inside the polygon get the "inside" value. */
export function generateColorGrid(
  inside: (x: number, y: number) => boolean,
  cols: number,
  rows: number,
  seed: string,
  mode: "key" | "even",
): number[][] {
  const rand = rng(`colornum:${seed}`);
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const x = ((c + 0.5) / cols) * 100;
      const y = ((r + 0.5) / rows) * 100;
      const inn = inside(x, y);
      if (mode === "key") return inn ? 1 : 2;
      const n = 1 + Math.floor(rand() * 9);
      const even = n % 2 === 0 ? n : n === 9 ? 8 : n + 1;
      const odd = n % 2 === 1 ? n : n - 1;
      return inn ? even : odd;
    }),
  );
}
