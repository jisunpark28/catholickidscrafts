# Lesson Kits — Personas & Phases

Lesson Kits connect **teacher → student** on one platform layer (classroom runner + at-home follow-up). Full printable packs are linked on **Teachers Pay Teachers**.

## Personas

| Persona | Goal | Primary routes |
|---------|------|----------------|
| **Teacher** | Copy template, edit steps, run class, link TPT pack, assign to students | `/program`, `/program/kit/[id]`, `/lesson/[slug]`, `/account` |
| **Student** | See assigned lesson on home, run shortened family lesson | `/reader/login`, `/` (home card), `/lesson/[slug]/family` |

Parish/DRE workspace flows were removed in favor of individual teacher accounts.

## Phase status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **P0** | Unified SVG icons, block types, CSS | Done |
| **P1** | DB, runner, `/program`, editor, templates, admin list | Done |
| **P2** | Family runner, share + QR | Done |
| **P3** | `LessonAssignment`, teacher assign UI, student home card, completion | Done |
| **P4** | Print/PDF, offline cache, TPT links on kits | Done |

## Data model (persona-related)

- `LessonKit` — `GLOBAL_TEMPLATE` \| `PERSONAL`; optional `tptUrl`, `isFreeSample`
- `LessonAssignment` — teacher → student(s) per week
- `LessonKitProgress` — completion stamp
- `SubProfile` — student Access IDs under teacher account

## Deploy

After merge:

```bash
pnpm run db:migrate-deploy
pnpm run db:seed-production-once
```

Seed creates global templates and home “Lesson Kits” pill.
