/** Local-only replay history. No names, answers, scores, or child profile are stored. */
import { MISSIONS } from './missions';
export type Location = 'church' | 'home' | 'school' | 'playground';
export type Scope = Location | 'tour';
export type Mission = { id: string; location: Location; commandment: number; prompt: string; choices: { id: string; text: string }[]; correctId: string; feedback: string };
export const LOCATIONS: Location[] = ['church', 'home', 'school', 'playground'];
export const LABELS: Record<Scope, string> = { tour: 'Village tour', church: 'Church', home: 'Home', school: 'School', playground: 'Playground' };
export const STORAGE_KEY = 'ckc-neighbor-village-v1';
export type History = { version: 1; seen: string[]; recent: string[]; coverage: number[] };
export const freshHistory = (): History => ({ version: 1, seen: [], recent: [], coverage: Array(10).fill(0) });
const ids = new Set(MISSIONS.map(m => m.id));
export function parseHistory(raw: string | null): History {
  try {
    const h = JSON.parse(raw || 'null');
    if (!h || h.version !== 1 || !Array.isArray(h.seen) || !Array.isArray(h.recent) || !Array.isArray(h.coverage) || h.coverage.length !== 10) return freshHistory();
    return {
      version: 1,
      seen: [...new Set(h.seen.filter((id: unknown): id is string => typeof id === 'string' && ids.has(id)))].slice(-200) as string[],
      recent: h.recent.filter((id: unknown): id is string => typeof id === 'string' && ids.has(id)).slice(-20),
      coverage: h.coverage.map((n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= 0 ? Math.min(10000, Math.floor(n)) : 0),
    };
  } catch { return freshHistory(); }
}
export function shuffle<T>(input: readonly T[], rng: () => number = Math.random): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.min(i, Math.max(0, Math.floor(rng() * (i + 1)))); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** Offered questions are reserved immediately, even if a round is abandoned.
 * Exhaust unused IDs in the chosen scope before recycling. Least-offered
 * commandments win among unused candidates; maximize distinct commandments per round.
 * A fresh mixed tour covers all ten across its first two five-mission rounds.
 * Near exhaustion/location constraints take priority over commandment balance. */
export function selectRound(scope: Scope, previous: History, rng: () => number = Math.random) {
  const h: History = { ...previous, seen: [...previous.seen], recent: [...previous.recent], coverage: [...previous.coverage] };
  const pool = MISSIONS.filter(m => scope === 'tour' || m.location === scope);
  const selected: Mission[] = [];
  const recentAtStart = new Set(previous.recent);
  const roundCommands = new Set<number>();
  for (let i = 0; i < 5; i++) {
    let available = pool.filter(m => !h.seen.includes(m.id) && !selected.some(s => s.id === m.id));
    if (!available.length) {
      const poolIds = new Set(pool.map(m => m.id));
      h.seen = h.seen.filter(id => !poolIds.has(id));
      available = pool.filter(m => !selected.some(s => s.id === m.id));
      const notRecent = available.filter(m => !recentAtStart.has(m.id));
      if (notRecent.length) available = notRecent;
    }
    const outsideRecent = available.filter(m => !recentAtStart.has(m.id));
    if (outsideRecent.length) available = outsideRecent;
    const distinct = available.filter(m => !roundCommands.has(m.commandment));
    if (distinct.length) available = distinct;
    const min = Math.min(...available.map(m => h.coverage[m.commandment - 1]));
    const candidates = available.filter(m => h.coverage[m.commandment - 1] === min);
    const chosen = shuffle(candidates, rng)[0];
    selected.push({ ...chosen, choices: shuffle(chosen.choices, rng) });
    h.seen.push(chosen.id);
    h.recent = [...h.recent, chosen.id].slice(-20);
    h.coverage[chosen.commandment - 1]++;
    roundCommands.add(chosen.commandment);
  }
  return { missions: selected, history: h };
}
