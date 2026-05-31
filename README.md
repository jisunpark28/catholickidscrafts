# Catholic Kids Crafts

Daily Mass (English) + Catholic kids catechism resources.

## Public site

| Page | URL |
|------|-----|
| Daily Mass calendar | `/mass` |
| Mass readings by date | `/mass/YYYY-MM-DD` |
| Curriculum | `/curriculum` |
| Kids Resources (by liturgical season) | `/resources` |

Mass readings come from the [Evangelizo Reader API](http://feed.evangelizo.org/) (`lang=AM`, Roman calendar, American English).

## Operator admin (Curriculum & Resources)

Only signed-in operators can create, edit, delete, and upload files.

| URL | Purpose |
|-----|---------|
| `/admin/login` | Sign in |
| `/admin` | Dashboard |
| `/admin/resources` | Kids resources CRUD + PDF upload |
| `/admin/curriculum` | Curriculum tracks CRUD |

### First-time setup (local)

1. Copy environment file:

```bash
cp .env.example .env
```

2. Edit `.env`:

- `AUTH_SECRET` — random string (`openssl rand -base64 32`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — your operator login (used once for seeding)
- `DATABASE_URL` — default `file:./prisma/dev.db` (SQLite)

3. Install and initialize database:

```bash
npm install
npm run db:migrate
npm run db:seed
```

4. Run dev server:

```bash
npm run dev
```

5. Open **http://localhost:3000/admin/login** and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

### Production (Vercel + Postgres)

SQLite does **not** persist on Vercel. Use a hosted Postgres database (recommended: [Neon](https://neon.tech) free tier):

1. Create a Postgres database and set `DATABASE_URL` in Vercel (e.g. `postgresql://...`).
2. Change `provider` in `prisma/schema.prisma` to `postgresql` **or** use a separate production schema (same models).
3. Set env vars on Vercel:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` (run seed once locally against prod URL, or add admin in DB)
   - `BLOB_READ_WRITE_TOKEN` (Vercel Blob — for PDF uploads in production)
4. Deploy; run `npx prisma migrate deploy` against production (Vercel build command or one-off).

### File uploads

| Environment | Storage |
|-------------|---------|
| Local dev | `public/uploads/` |
| Vercel | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) when `BLOB_READ_WRITE_TOKEN` is set |

### Data model

- **Resource** — kids crafts / lesson posts (`liturgicalPeriod`: advent, christmas, lent, holy-week, easter, ordinary, general)
- **CurriculumTrack** — grade / stage paths
- **AdminUser** — operator accounts (passwords hashed with bcrypt)
- **UploadedFile** — audit log of uploads

Legacy Markdown under `content/resources/` is imported by `npm run db:seed` only; the live site reads from the database.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply migrations (dev) |
| `npm run db:seed` | Create admin + import markdown |
| `npm run db:studio` | Prisma Studio (browse DB) |

## Tech stack

Next.js 15 · Prisma · SQLite (local) / Postgres (prod) · NextAuth · Tailwind CSS v4
