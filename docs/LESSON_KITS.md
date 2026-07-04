# Lesson Kits

Assembled classroom lessons: games, typing, Gospel, and resources in one `/lesson/[shareSlug]` URL.

**Teachers:** see [`docs/FOR_TEACHERS.md`](FOR_TEACHERS.md).  
**Persona map:** [`docs/LESSON_PERSONAS.md`](LESSON_PERSONAS.md).

## Phase status

| Phase | Scope | Status |
|-------|--------|--------|
| P0 | Icon spec (`docs/LESSON_ICONS.md`), block types, CSS tokens | Done |
| P1 | `LessonKit` DB, Runner, `/program`, templates, editor, admin list | Done |
| P2 | Family runner, Share + QR | Done |
| P3 | Student assignment, “Teacher assigned” home card | Done |
| P4 | Print/PDF, offline cache, TPT links on kits | Done |

## Block types (`LessonBlockType`)

| Type | Config |
|------|--------|
| `GAME` | `{ gameFormat, … }` — teacher-supplied game data (see below) |
| `PLAY_GAME` | `{ gameSlug }` — built-in site games |
| `TYPING_WORDS` | `{ wordPreset }` or `{ wordIds }` |
| `GOSPEL_TYPING` | `{ readingKind, maxChars, familyInclude? }` |
| `MASS_TODAY` | `{}` |
| `CUSTOM_NOTE` | `{ html, familyInclude? }` — teacher-only |
| `WRITING` | `{ prompt, placeholder?, minChars?, maxChars?, writingMode?: "display" \| "student" }` |
| `RESOURCE` | `{ resourceSlug, familyInclude? }` |
| `LINK` | `{ url, buttonLabel?, openInNewTab? }` |
| `IMAGE` | `{ imageUrl, alt?, caption?, imageSource?: "upload" \| "url" }` |
| `SLIDES` | `{ embedUrl?, assetUrl?, slidesSource?: "embed" \| "upload", buttonLabel? }` |
| `BIBLE_CHAPTER` | `{ bookSlug, chapter, maxChars?, familyInclude? }` |
| `HANGMAN_WORDS` | `{ gameSlug: "hangman" }` |

### Editor palette (PR-1) & content blocks (PR-2–3)

Teachers add blocks from **Content / Media / Games** tabs (`src/lib/lesson-kit/block-palette.ts`).  
`MASS_TODAY`, `GOSPEL_TYPING`, and `BIBLE_CHAPTER` stay in the schema for existing kits but are **hidden from the add palette**.  
`LINK` blocks use `url`, `buttonLabel`, and `openInNewTab` (`src/lib/lesson-kit/link-block.ts`).  
`WRITING` is for student prompts/responses; `CUSTOM_NOTE` remains teacher-only (`src/lib/lesson-kit/writing-block.ts`).  
Teacher media uploads: `POST /api/program/uploads` → `config.assetUrl` (`src/lib/lesson-kit/media-upload.ts`, `LessonMediaUpload`).  
`IMAGE` blocks use upload or external URL (`src/lib/lesson-kit/image-block.ts`, `LessonImageFigure`).  
`SLIDES` blocks embed Google Slides/Drive or uploaded PDF/PPTX (`src/lib/lesson-kit/slides-block.ts`). PPTX uploads show a download button — export to PDF for inline class view.

### `GAME` block (PR-7)

Unified teacher-configured games (`src/lib/lesson-kit/game-block.ts`, `LessonGamePlayer`).

| `gameFormat` | Config fields | Runner |
|--------------|---------------|--------|
| `hangman` | `gameWords[]`, `gameHint?` | `LessonHangmanGame` |
| `typing` | `typingMode`: `words` \| `passage`; `gameWords[]` or `gamePassage` | `WordFallTypingGame` / `PassageTypingGame` |
| `picture_match` | `pictureMatch: { imageUrl, word }[]` | `LessonPictureMatchGame` |
| `fill_blank` | `fillBlankText` (use `___`), `fillBlankAnswers[]` | `LessonFillBlankGame` |
| `true_false` | `trueFalseItems: { statement, answer }[]` | `LessonTrueFalseGame` |
| `multiple_choice` | `multipleChoiceItems: { question, choices, correctIndex }[]` | `LessonMultipleChoiceGame` |

Print view shows a format summary plus optional teacher answer key (`printAnswerKey`, default on).  
Legacy `TYPING_WORDS`, `HANGMAN_WORDS`, and `PLAY_GAME` blocks still run in older kits; the editor palette offers `GAME` + site `PLAY_GAME`.

## Routes

- `/program` — templates and teacher’s Lesson Kits (server-loaded)
- `/program/kit/[id]` — edit steps
- `/program/kit/[id]/print` — print / save PDF
- `/lesson/[shareSlug]` — classroom runner
- `/lesson/[shareSlug]/family` — student / at-home runner
- `/account` — teacher dashboard: students + weekly assignments
- `/curriculum` — ready-made Lesson Kit cards

## APIs

- `GET|POST /api/program/kits` — list / duplicate templates
- `POST /api/program/uploads` — teacher media (images, PDF, PPT) → `assetUrl`
- `PATCH /api/program/kits/[id]` — title, TPT link, grade band, etc.
- `GET|POST /api/admin/lesson-templates` — admin global template CRUD (create)
- `GET|PATCH|DELETE /api/admin/lesson-templates/[id]` — admin template meta
- `PUT /api/admin/lesson-templates/[id]/blocks` — admin template steps
- `GET|POST /api/program/assignments` — teacher weekly assignments
- `GET /api/program/teacher-stats` — student kit completions + weekly opens
- `POST /api/lesson/[shareSlug]/complete` — mark family lesson done

## Seed

`pnpm run db:seed` creates global templates if none exist.

Production: `pnpm run db:migrate-deploy` then `pnpm run db:seed-production-once` (or GitHub Actions — see `docs/GITHUB_PROD_SEED.md`).
