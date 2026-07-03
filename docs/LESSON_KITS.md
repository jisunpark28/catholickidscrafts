# Lesson Kits

Assembled classroom lessons: games, typing, Gospel, and resources in one `/lesson/[shareSlug]` URL.

## Phases implemented

| Phase | Scope |
|-------|--------|
| P0 | Icon spec (`docs/LESSON_ICONS.md`), block types, CSS tokens |
| P1 | `LessonKit` DB, Runner, `/program`, templates, editor, admin list |
| P2 | `/lesson/.../family`, Share sheet, `Parish` + join + DRE dashboard |

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

## Routes

- `/program` — browse templates, my lessons (family login)
- `/program/kit/[id]` — edit steps
- `/lesson/[shareSlug]` — classroom runner (no site header)
- `/lesson/[shareSlug]/family` — shortened at-home runner
- `/program/join` — parish invite code
- `/program/parish` — DRE open counts

## Seed

`npm run db:seed` creates 3 global templates if none exist.
