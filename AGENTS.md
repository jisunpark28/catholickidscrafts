# AGENTS.md

Guidance for AI agents working in this repository.

## Cursor Cloud specific instructions

### Services

| Service | Required | Command | Port |
|---------|----------|---------|------|
| Next.js dev | Yes | `pnpm dev` or `npm run dev` | 3000 |
| Neon Postgres | Yes (content + admin) | Connection via `DATABASE_URL` / `DIRECT_URL` in `.env` | — |

Mass readings are **not** in the DB. Public `/mass` shows Evangelizo calendar titles + outbound USCCB/LWC links only. `GET /api/mass/[date]` can return USCCB RSS JSON (unused by current UI). Typing **Today’s Bible** uses Universalis JSONP (today only). See `docs/MASS_READINGS.md`.

### Environment

Copy `.env.example` → `.env`. Production uses Neon pooled `DATABASE_URL` + direct `DIRECT_URL` for migrations. See `docs/DEPLOYMENT.md` for Vercel + `catholickidscrafts.com`.

### Lint / build

- `pnpm lint` / `pnpm build` (build needs valid Postgres URLs if prerender touches DB; most CMS routes use `force-dynamic`)
- Vercel: `pnpm run vercel-build` runs `scripts/vercel-migrate-deploy.sh` (auto-recovers failed `20260622120000_bible_chapter_discussion`) then `next build`

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

- Church game hotspots: `/admin/church-decorations`, API `/api/church-decorations`.
- Photo booth frames: `/admin/photo-booth-frames`. Admin uploads need `BLOB_READ_WRITE_TOKEN` on Vercel (`src/lib/upload.ts`).

### Home learn hub & Bible (2026-06)

- Home (`/`) uses `HomeLearnHub`: **Daily Mass** pill toggles liturgical calendar; sections/pills from `HomeSection` / `HomeSectionItem` (admin: `/admin/home-sections`).
- After migrate: `npm run db:seed-home-sections` (idempotent; skips if rows exist). Also seed site copy for `home.daily_mass.label`.
- Bible progress: `npx prisma migrate deploy` includes `guestId` and `accessCodeLookup` on subs. Guest progress uses `ckc_bible_reader`; signed-in readers use `ckc_reader` JWT.
- Family accounts: `/account/signup`, `/account/login`, `/reader/login` (Access ID). Optional Google OAuth — `docs/FAMILY_GOOGLE_SIGNIN.md`.
- Home learn search: `GET /api/learn/search?q=` (resources, curriculum, games, Bible, home pills).
- Today's Gospel (`/bible/gospel`): My Reading Calendar + daily stickers (`GospelDayProgress`). Sticker art: `public/images/gospel/praise-sticker.png`.
- Bible text: Douay-Rheims via Latin Prayer public API (`src/lib/bible/latinprayer.ts`). Routes under `/bible/*`; reader Access ID login stub at `/reader/login`.
- Chapter discussion (OT/NT): below typing on `/bible/read/[book]/[chapter]`; migrations `20260622120000_bible_chapter_discussion` + `20260623150000_bible_discussion_tables_recovery`. Runtime `ensureDiscussionSchema()` uses Neon **direct** URL (auto-derived from pooled `DATABASE_URL` if `DIRECT_URL` unset). Signed-in readers post; guests read only.
- Full spec: `docs/HOME_LEARN_AND_BIBLE.md` (phases B–E: typing stickers, family accounts, home search).
