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
| `/admin/operators` | Add/remove operator accounts (super admin) |

### First-time setup (local)

1. Copy environment file:

```bash
cp .env.example .env
```

2. Edit `.env`:

- `AUTH_SECRET` — random string (`openssl rand -base64 32`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — your operator login (used once for seeding)
- `DATABASE_URL` / `DIRECT_URL` — Neon Postgres connection strings

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

### Production (Vercel + Neon — free tier)

This project uses **PostgreSQL** (Neon). Set both `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) on Vercel.

**Step-by-step (Korean):** [docs/SETUP_KO.md](docs/SETUP_KO.md)

1. Neon project → copy pooled + direct connection strings.
2. Vercel env: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL=https://catholickidscrafts.com`, `BLOB_READ_WRITE_TOKEN`.
3. Run `npm run db:seed` once locally with Neon URLs in `.env` to create the super-admin and sample content.
4. Deploy; `vercel-build` runs `prisma migrate deploy` automatically.

### Multiple operators & rich text

| Feature | Where |
|---------|--------|
| Super admin adds operators | `/admin/operators` (nav visible to super admins only) |
| Rich text (HTML) | Resource & curriculum editors |
| Roles | `SUPER_ADMIN` (operators + content), `OPERATOR` (content only) |

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

Next.js 15 · Prisma · Neon Postgres · NextAuth · TipTap · Tailwind CSS v4
