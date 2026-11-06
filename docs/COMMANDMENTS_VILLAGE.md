# Love Your Neighbor Village

Route: `/play/ten-commandments`. Public, no login/payment/API needed for game content or progress. The route inherits the existing Play layout and **does not recreate** the site's header/sidebar.

## Content and Catholic numbering

200 manually authored English situations, exactly 50 per location. Each has three distinct choices, one correct ID, explanatory feedback, and a Catholic commandment number. `src/lib/commandments/missions.ts` is the canonical playable collection; it is not generated at runtime or multiplied from noun-swapping templates.

Distribution (not forced equal quotas):

| Commandment | Missions |
|---|---:|
|1|17|
|2|18|
|3|17|
|4|20|
|5|23|
|6|13|
|7|29|
|8|25|
|9|13|
|10|25|

The selector balances *exposure* among the unused questions; equal counts in the bank are not necessary. Marriage topics are more naturally located at church/home than at playground. Sixth/ninth missions are explicitly about faithfulness in marriage / desires respecting marriage, or clearly marked lessons about those topics; ordinary toy envy is **tenth**, not ninth. Animal/creation stewardship is **seventh** (CCC 2415–2418), rather than pretending the fifth's human-life teaching is the whole explanation.

Child-facing commandment titles are paraphrases, not the full traditional wording. Adult help explains numbering, family sensitivity, unwanted thoughts versus chosen desires, and safety. No explicit adult sexual detail. Children are not responsible for repairing adults' marriages. A child may refuse wrongdoing/harm and tell a safe adult. No unsafe secrecy or obedience. No timers, negative points, shaming, or claims that winning earns God's love. Wrong choices can be retried without penalty.

### Sources consulted (2026-11-06)

- Vatican Catechism, Ten Commandments overview / Catholic numbering, CCC 2052–2074: https://www.vatican.va/archive/ENG0015/__P78.HTM
- Sixth commandment, marriage faithfulness, CCC 2380–2389: https://www.vatican.va/archive/ENG0015/__P87.HTM
- Ninth commandment, respect and purity of heart, CCC 2520–2527: https://www.vatican.va/archive/ENG0015/__P8R.HTM
- Ninth in brief, CCC 2528–2533: https://www.vatican.va/archive/ENG0015/__P8S.HTM
- First commandment: https://www.vatican.va/archive/ENG0015/__P7B.HTM

The game links teaching sources in adult help and gives CCC paragraph ranges for all ten. This is source-informed authoring, **not a claim of review by a theologian, priest, or catechetical authority**. Families/teachers can use their judgment about advanced marriage lessons.

## Round/replay contract

- Five missions per round. Mixed village tour default; choosing a map location starts a new five-mission local round.
- Fisher–Yates shuffles both candidates and answers; correctness is attached to choice IDs, never array positions.
- Reserve question IDs **when offered at round creation**, even if the round is abandoned or page reloaded. The UI states this plainly.
- Use unused questions in the chosen scope first. Only recycle when that scope has none unused. No repeat within a round, including across an exhaustion boundary.
- Among available unused questions, favor commandments not yet in that round, then lowest lifetime offering count. The first two mixed tours from fresh history therefore contain all ten commandments.
- At exhaustion, avoid the previous 20 offered IDs for the *whole* new round while alternatives exist. Near exhaustion, unused-question priority and location constraints win over balanced coverage.
- Switching scopes shares the same ID history. Exhausting a local scope clears that scope's seen IDs; it does not reset other places. The two-tour guarantee is for fresh mixed history, not an arbitrary point after switching places/exhaustion.
- Garden/progress is round-local. Completion displays five completed missions with explanatory recap. No leaderboard.

## Storage and privacy

Only `version`, seen/recent mission IDs, and ten commandment offering counts in `ckc-neighbor-village-v1`. No child identity, answer selections, score, or user text. Nothing is sent to a server by the game. Storage input is validated against known IDs and bounded. Malformed or unavailable storage falls back safely; in-memory history survives new rounds until navigation/reload. No claim of synchronized cross-tab selection.

## Artwork/accessibility

Original hand-authored SVG village: church, home, school, swing/slide playground; winding paths, hills, trees, flowers, garden. Location controls are HTML buttons with descriptive accessible names/pressed state. Scenario vignettes are separately authored SVG illustrations (book/candle, house, pencil case/desk, playground). No fake illustrated site header, external art service, or generated child photographs.

Keyboard-operable answers and navigation; live feedback, explicit correct check mark, no color-only state, focus on scenario/completion headings, reduced-motion rule, mobile map/card stack. No autoplay or audio.

## Verification

- `npm run test:commandments`: exact counts, unique IDs/prompts, three choices/correct IDs; seeded determinism/shuffle; no repeats before all 50/200 exhausted; recent avoidance; reload/corrupt/bounded storage; two fresh tours cover ten; mixed scopes.
- `npm run test:commandments:browser` with server on 3038, or `VILLAGE_BASE_URL`: actual hub/shared sidebar/direct route, wrong/retry/correct, keyboard, duplicate click guard, completion/restart, fresh two-tour storage, all locations, corrupt/blocked storage, reduced motion, desktop/mobile overflow. Screenshots in parent directory or `VILLAGE_SCREENSHOTS`.
- `tsc --noEmit`, touched TS/TSX ESLint, and actual `npm run build`.

A worktree without DB environment fails existing global Prisma import checks during build page collection. For local offline verification an explicitly non-live localhost placeholder URL can exercise the existing defaults/fallbacks. That is not live-CMS/database verification and must not be represented as such. No migration/seed is required for this game. The hub copy defaults are available immediately; normal site-copy seeding may expose them to a previously initialized admin editor as usual.
