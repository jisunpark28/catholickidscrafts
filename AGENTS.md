# AGENTS.md

Guidance for AI agents working in this repository.

## Cursor Cloud specific instructions

### Services

| Service | Required | Command | Port |
|---------|----------|---------|------|
| Next.js dev | Yes | `pnpm dev` or `npm run dev` | 3000 |
| Neon Postgres | Yes (content + admin) | Connection via `DATABASE_URL` / `DIRECT_URL` in `.env` | — |

Mass readings are **not** in the DB; `/api/mass/*` uses USCCB RSS for on-site text when available (see `docs/MASS_READINGS.md`). Calendar/citations use Evangelizo.

### Environment

Copy `.env.example` → `.env`. Production uses Neon pooled `DATABASE_URL` + direct `DIRECT_URL` for migrations. See `docs/DEPLOYMENT.md` for Vercel + `catholickidscrafts.com`.

### Lint / build

- `pnpm lint` / `pnpm build` (build needs valid Postgres URLs if prerender touches DB; most CMS routes use `force-dynamic`)
- Vercel: `pnpm run vercel-build` runs `prisma migrate deploy` then `next build`

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
