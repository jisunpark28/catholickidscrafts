# Lesson Kits — Personas & Phases

Lesson Kits connect **DRE → catechist → parent → reader** on one platform layer (not content replacement).

## Personas

| Persona | Goal | Primary routes |
|---------|------|----------------|
| **DRE** | Parish workspace, invite catechists, parish kits, weekly plan, usage stats | `/program/parish/setup`, `/program/parish` |
| **Catechist** | Copy template, edit steps, run classroom, share at-home link + QR | `/program`, `/program/kit/[id]`, `/lesson/[slug]` |
| **Parent** | Assign at-home lesson to child(ren), copy family link | `/account`, `/program` |
| **Reader (child)** | See “This week” on home, run shortened family lesson | `/` (home card), `/lesson/[slug]/family` |

## Phase status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **P0** | Unified SVG icons, block types, CSS | Done |
| **P1** | DB, runner, `/program`, editor, templates, admin list | Done |
| **P2** | Family runner, share + QR, parish join, DRE dashboard | Done |
| **P2+** | DRE create parish, parish kit CRUD, invite code on dashboard | Done |
| **P3** | `LessonAssignment`, parent assign UI, reader home card, completion | Done |
| **P4** | `ParishPlan` scheduling, print/PDF, offline cache on device, parish UGC (DRE publishes personal kit) | Done |

## Data model (persona-related)

- `Parish` / `ParishMember` — DRE + catechists (`role`)
- `LessonKit` — `GLOBAL_TEMPLATE` \| `PERSONAL` \| `PARISH`
- `LessonAssignment` — parent → reader(s) per week
- `LessonKitProgress` — completion stamp
- `ParishPlan` — DRE week → kit mapping

## Deploy

After merge:

```bash
npm run db:migrate-deploy
npm run db:seed
```

Seed creates global templates and home “Class lessons” pill.
