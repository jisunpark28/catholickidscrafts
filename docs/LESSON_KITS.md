# Lesson Kits

Assembled classroom lessons: games, typing, Gospel, and resources in one `/lesson/[shareSlug]` URL.

## Phase status

| Phase | Scope | Status |
|-------|--------|--------|
| P0 | Icon spec (`docs/LESSON_ICONS.md`), block types, CSS tokens | Done |
| P1 | `LessonKit` DB, Runner, `/program`, templates, editor, admin list | Done (editor: block config panel, autosave, Bible/Hangman add types) |
| P2 | `/lesson/.../family`, Share sheet + QR, `Parish` + join + DRE dashboard | Done (parish kit “Use this” wired; parish create UI still admin/DB) |
| P3 | SubProfile assignment, reader “This week” card | Planned |
| P4 | Parish plans, UGC, offline, PDF | Planned |

## Block types (`LessonBlockType`)

| Type | Config |
|------|--------|
| `PLAY_GAME` | `{ gameSlug }` |
| `TYPING_WORDS` | `{ wordPreset }` or `{ wordIds }` |
| `GOSPEL_TYPING` | `{ readingKind, maxChars }` |
| `MASS_TODAY` | `{}` |
| `CUSTOM_NOTE` | `{ html }` |
| `RESOURCE` | `{ resourceSlug }` |
| `BIBLE_CHAPTER` | `{ bookSlug, chapter, maxChars? }` |
| `HANGMAN_WORDS` | `{ gameSlug: "hangman" }` |

Block `config` is validated with Zod on `PUT /api/program/kits/[id]/blocks` (`src/lib/lesson-kit/block-schema.ts`).

## Routes

- `/program` — browse templates, my lessons (family login); server-loaded hub data
- `/program/kit/[id]` — edit steps (tap a step to configure; autosave)
- `/lesson/[shareSlug]` — classroom runner (no site header)
- `/lesson/[shareSlug]/family` — shortened at-home runner
- `/program/join` — parish invite code
- `/program/parish` — DRE open counts
- `/curriculum` — includes ready-made lesson kit cards

## Home hub

“Class lessons” appears under **Play & Learn** (`/program`). Re-run `npm run db:seed` to add the pill on databases seeded before this change.

## Seed

`npm run db:seed` creates 3 global templates if none exist.

Production after deploy: `npm run db:migrate-deploy` then `npm run db:seed`.
