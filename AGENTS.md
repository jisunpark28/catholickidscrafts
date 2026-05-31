# AGENTS.md

Guidance for AI agents working in this repository.

## Cursor Cloud specific instructions

### Services

| Service | Required | Command | Port |
|---------|----------|---------|------|
| Next.js dev | Yes | `pnpm dev` or `npm run dev` | 3000 |
| Neon Postgres | Yes (content + admin) | Connection via `DATABASE_URL` / `DIRECT_URL` in `.env` | — |

Mass readings are **not** in the DB; they come from Evangelizo at runtime (`/api/mass/*`).

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
