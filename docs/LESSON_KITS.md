# Lesson Kits

Assembled classroom lessons: games, typing, Gospel, and resources in one `/lesson/[shareSlug]` URL.

See **persona map**: [`docs/LESSON_PERSONAS.md`](LESSON_PERSONAS.md).

## Phase status

| Phase | Scope | Status |
|-------|--------|--------|
| P0 | Icon spec (`docs/LESSON_ICONS.md`), block types, CSS tokens | Done |
| P1 | `LessonKit` DB, Runner, `/program`, templates, editor, admin list | Done |
| P2 | Family runner, Share + QR, Parish join + DRE dashboard | Done |
| P3 | SubProfile assignment, reader “This week” home card | Done |
| P4 | Parish plans, print/PDF, offline cache, parish kit publishing | Done |

## Block types (`LessonBlockType`)

| Type | Config |
|------|--------|
| `PLAY_GAME` | `{ gameSlug }` |
| `TYPING_WORDS` | `{ wordPreset }` or `{ wordIds }` |
| `GOSPEL_TYPING` | `{ readingKind, maxChars, familyInclude? }` |
| `MASS_TODAY` | `{}` |
| `CUSTOM_NOTE` | `{ html, familyInclude? }` |
| `RESOURCE` | `{ resourceSlug, familyInclude? }` |
| `BIBLE_CHAPTER` | `{ bookSlug, chapter, maxChars?, familyInclude? }` |
| `HANGMAN_WORDS` | `{ gameSlug: "hangman" }` |

## Routes

- `/program` — templates, my lessons, parish section (server-loaded)
- `/program/kit/[id]` — edit steps (personal or parish kit for DRE)
- `/program/kit/[id]/print` — print / save PDF
- `/program/parish/setup` — DRE create parish + invite code
- `/program/parish` — DRE dashboard (stats, plans, parish kits)
- `/program/join` — catechist join by code
- `/lesson/[shareSlug]` — classroom runner
- `/lesson/[shareSlug]/family` — at-home runner
- `/account` — assign at-home lessons to readers
- `/curriculum` — ready-made lesson kit cards

## APIs

- `POST /api/program/parish/create` — DRE creates parish
- `POST /api/program/parish/kits` — DRE adds parish kit from template or personal copy
- `GET|POST /api/program/parish/plans` — parish weekly plan
- `GET|POST /api/program/assignments` — parent weekly assignments
- `POST /api/lesson/[shareSlug]/complete` — mark family lesson done

## Seed

`npm run db:seed` creates 3 global templates if none exist.

Production: `npm run db:migrate-deploy` then `npm run db:seed-production-once` (or GitHub Actions — see `docs/GITHUB_PROD_SEED.md`).
