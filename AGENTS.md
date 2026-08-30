# AGENTS.md

Guidance for AI agents working in this repository.

## Cursor Cloud specific instructions

### Services

| Service | Required | Command | Port |
|---------|----------|---------|------|
| Next.js dev | Yes | `pnpm dev` or `npm run dev` | 3000 |
| Neon Postgres | Yes (content + admin) | Connection via `DATABASE_URL` / `DIRECT_URL` in `.env` | — |

Mass readings are **not** in the DB. Public `/mass` shows Evangelizo calendar titles (±30 days) with **Romcal** General Roman Calendar fallback for the full year; outbound USCCB/LWC/GoodNews links only. `GET /api/mass/[date]` can return USCCB RSS JSON (unused by current UI). Typing **Today’s Bible** uses Universalis JSONP (today only). See `docs/MASS_READINGS.md`.

### Environment

Copy `.env.example` → `.env`. Production uses Neon pooled `DATABASE_URL` + direct `DIRECT_URL` for migrations. See `docs/DEPLOYMENT.md` for Vercel + `catholickidscrafts.com`.

### Lint / build

- `pnpm lint` / `pnpm build` (build needs valid Postgres URLs if prerender touches DB; most CMS routes use `force-dynamic`)
- Vercel: `bash scripts/vercel-build.sh` — **production** (`main`) runs migrate + ensure scripts; **preview** skips DB steps (shared Neon). Disable Vercel **Preview Neon branching** to avoid branch-limit provisioning failures (see `docs/DEPLOYMENT.md` §3). Workflows: `ci.yml`, `neon-preview-branch-cleanup.yml`.

### Admin

- `/admin/login` — operators; super admins also get `/admin/operators`
- Rich text saves HTML; legacy markdown seeds use `contentFormat: markdown`

### VM update script

- `pnpm install` only — no migrations, dev server, or seed in the update script.

### TPT & affiliate (2026-06)

- Set `NEXT_PUBLIC_TPT_STORE_URL` for footer/home TPT button.
- After pull: `npx prisma migrate deploy` (adds Resource `tptUrl` / `isFreeSample` / `previewImageUrl`, Recommendation `linkType`).
- Amazon links: set **Amazon Associate** in admin Recommendations, or use amazon.com URLs (auto disclosure + `rel=sponsored`).
- Legal pages: `/about`, `/privacy`, `/affiliate-disclosure`. Operator notes: `docs/AFFILIATE_LINKS.md`.

- Church game wall stations: bundled in `public/games/tiny-priest/stations.js` (no admin UI)
- Photo booth frames: `/admin/photo-booth-frames`. Admin uploads need `BLOB_READ_WRITE_TOKEN` on Vercel (`src/lib/upload.ts`).

### Production database seed (GitHub Actions)

- Migrations run on every Vercel deploy (`vercel-build`). **Data seed does not.**
- One-time prod seed: GitHub → Actions → **Seed production database** (see `docs/GITHUB_PROD_SEED.md`). Requires repo secrets `DATABASE_URL`, `DIRECT_URL`.
- Local equivalent: `pnpm run db:seed-production-once` (idempotent).

### Home learn hub & Bible (2026-06)

- Home (`/`) uses `HomeLearnHub`: **Daily Mass** pill toggles liturgical calendar; sections/pills from `HomeSection` / `HomeSectionItem` (admin: `/admin/home-sections`).
- After migrate: `npm run db:seed-home-sections` (idempotent; skips if rows exist). Also seed site copy for `home.daily_mass.label`.
- Bible progress: `npx prisma migrate deploy` includes `guestId` and `accessCodeLookup` on subs. Guest progress uses `ckc_bible_reader`; signed-in readers use `ckc_reader` JWT.
- Family accounts: `/account/signup`, `/account/login`, `/reader/login` (Access ID). Optional Google OAuth — `docs/FAMILY_GOOGLE_SIGNIN.md`.
- Home learn search: `GET /api/learn/search?q=` (resources, curriculum, games, Bible, home pills).
- Today's Gospel (`/bible/gospel`): My Reading Calendar + daily stickers (`GospelDayProgress`). Sticker art: `public/images/gospel/praise-sticker.png`.
- Bible text: Douay-Rheims via Latin Prayer public API (`src/lib/bible/latinprayer.ts`). All OT/NT typing uses `modernizeForReading()` (display + typing share one string). Routes under `/bible/*`.
- **Catholic terminology:** UI copy uses `catholic-book-names` (73-book canon; Korean **마르코** not “마가”). Bible read UI language matches prayers: 10 locales via `?lang=` + shared `prayer-lang` localStorage.
- Chapter discussion (OT/NT): below typing on `/bible/read/[book]/[chapter]`; migrations `20260622120000_bible_chapter_discussion` + `20260623150000_bible_discussion_tables_recovery`. API routes use `withDiscussionSchemaReady()` (query first; call `ensureDiscussionSchema()` only on missing table/column). `ensureDiscussionSchema()` skips direct DDL when schema is already complete (checked via pooled `DATABASE_URL`). Build still runs `scripts/ensure-bible-discussion-schema.ts`. Signed-in readers post; guests read only.
- **Resources UI:** `/resources` uses horizontal liturgical badge filter (`LiturgicalPeriodFilter`), floating cards with one-click PDF download (`recordResourceView` on download). **Craft gallery:** `CraftGallerySubmission` model; moderate at `/admin/gallery`; public `/gallery` + resource pages show approved masonry. Family/Access ID upload via `POST /api/gallery/submit` (pending review).
- **Curriculum:** track detail `/curriculum/[slug]` uses vertical `CurriculumRoadmap` (UI-first; progress model later).
- Full spec: `docs/HOME_LEARN_AND_BIBLE.md` (phases B–E: typing stickers, family accounts, home search).
