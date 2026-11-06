import assert from 'node:assert/strict';
import { MISSIONS } from '../src/lib/commandments/missions';
import { freshHistory, LABELS, LOCATIONS, parseHistory, selectRound, shuffle, type History, type Scope } from '../src/lib/commandments/model';
const rng = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
assert.equal(MISSIONS.length, 200);
assert.equal(new Set(MISSIONS.map(m => m.id)).size, 200);
assert.equal(new Set(MISSIONS.map(m => m.prompt)).size, 200);
for (const l of LOCATIONS) assert.equal(MISSIONS.filter(m => m.location === l).length, 50, LABELS[l]);
for (const m of MISSIONS) {
  assert.ok(Number.isInteger(m.commandment) && m.commandment >= 1 && m.commandment <= 10);
  assert.equal(m.choices.length, 3);
  assert.equal(new Set(m.choices.map(c => c.id)).size, 3);
  assert.equal(new Set(m.choices.map(c => c.text)).size, 3);
  assert.equal(m.choices.filter(c => c.id === m.correctId).length, 1);
  assert.ok(m.prompt.length > 30 && m.feedback.length > 30);
}
assert.equal(new Set(MISSIONS.map(m => m.commandment)).size, 10);
for (const seed of [1, 2, 17, 818, 7361]) {
  for (const scope of ['tour', ...LOCATIONS] as Scope[]) {
    const random = rng(seed);
    let h = freshHistory();
    const all = new Set<string>();
    const total = scope === 'tour' ? 200 : 50;
    const firstTen: number[] = [];
    for (let n = 0; n < total / 5; n++) {
      const before = new Set(h.seen);
      const result = selectRound(scope, h, random);
      h = parseHistory(JSON.stringify(result.history)); // exercise reload each round
      assert.equal(result.missions.length, 5);
      assert.equal(new Set(result.missions.map(m => m.id)).size, 5);
      for (const m of result.missions) {
        assert.ok(!all.has(m.id), `${scope} exhausted unused before recycling`);
        assert.ok(!before.has(m.id));
        all.add(m.id);
        assert.ok(scope === 'tour' || m.location === scope);
        assert.equal(m.choices.filter(c => c.id === m.correctId).length, 1);
        if (n < 2) firstTen.push(m.commandment);
      }
    }
    assert.equal(all.size, total);
    if (scope === 'tour') assert.equal(new Set(firstTen).size, 10, 'first two fresh tours cover all ten');
    const recent = new Set(h.recent);
    const recycled = selectRound(scope, h, random);
    assert.ok(recycled.missions.every(m => !recent.has(m.id)), `${scope} avoids recent 20 on recycle`);
  }
}
assert.deepEqual(selectRound('tour', freshHistory(), rng(123)), selectRound('tour', freshHistory(), rng(123)), 'deterministic with seeded RNG');
const positions = new Set<number>();
for (let i = 1; i < 40; i++) for (const m of selectRound('tour', freshHistory(), rng(i)).missions) positions.add(m.choices.findIndex(c => c.id === m.correctId));
assert.deepEqual([...positions].sort(), [0, 1, 2], 'correct answer appears in all positions');
for (const raw of [null, '', '{', 'null', '[]', '{"version":2}', '{"version":1,"seen":[],"recent":[],"coverage":[]}']) assert.deepEqual(parseHistory(raw), freshHistory());
const dirty = parseHistory(JSON.stringify({ version:1, seen:['fake', MISSIONS[0].id, MISSIONS[0].id], recent:[1,'fake'], coverage:[-1,'x',null,0,1,2,3,4,5,1000000] }));
assert.deepEqual(dirty.seen,[MISSIONS[0].id]); assert.deepEqual(dirty.recent,[]); assert.equal(dirty.coverage[0],0); assert.equal(dirty.coverage[9],10000);
assert.deepEqual(shuffle([1,2,3],rng(1)).sort(),[1,2,3]);
let history: History = freshHistory();
for (let n=0;n<100;n++) history = selectRound(n%2 ? 'church' : 'tour', history, rng(n+1)).history;
assert.ok(history.seen.length<=200);
console.log('PASS: 200 IDs; 50/place; 10 commandments; unique prompts/choices; correct mappings; 0 repeats before exhaustion; recent avoidance; seeded shuffle; fresh two-tour coverage; reload/corrupt history; mixed scopes.');
console.log('Coverage:', Object.fromEntries(Array.from({length:10},(_,i)=>[i+1,MISSIONS.filter(m=>m.commandment===i+1).length])));
