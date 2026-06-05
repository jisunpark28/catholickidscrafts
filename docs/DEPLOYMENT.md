# Deploying catholickidscrafts.com (free tier)

Run the site on **Neon** (database), **Vercel** (hosting), and **Vercel Blob** (file uploads) using their free tiers.

## Prerequisites

- GitHub repo: `jisunpark28/catholickidscrafts` (or your fork)
- Domain: **catholickidscrafts.com** (DNS at your registrar)
- Free accounts: [Neon](https://neon.tech), [Vercel](https://vercel.com)

---

## 1. Neon Postgres (free)

1. Sign in at [neon.tech](https://neon.tech) → **New Project**
2. Open the project → **Connection details**
3. Copy both URLs:
   - **Pooled** → Vercel `DATABASE_URL` (host includes `-pooler`)
   - **Direct** → Vercel `DIRECT_URL` (for migrations; no pooler)

You can use the same Neon URLs for local development (no local Postgres install required).

---

## 2. Initialize the database (once)

```bash
git clone https://github.com/jisunpark28/catholickidscrafts.git
cd catholickidscrafts
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string |
| `AUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | First **super admin** (used by seed only) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.catholickidscrafts.com` |

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open **http://localhost:3000/admin/login** and sign in with the seeded email and password.

---

## 3. Deploy on Vercel (free)

1. [vercel.com](https://vercel.com) → **Add New Project** → connect the GitHub repo
2. **Environment Variables** (Production and Preview recommended):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon pooled URL |
| `DIRECT_URL` | Neon direct URL |
| `AUTH_SECRET` | Same as local or a new random string |
| `NEXT_PUBLIC_SITE_URL` | `https://www.catholickidscrafts.com` |
| `GOOGLE_SITE_VERIFICATION` | Search Console HTML tag `content=` value (see `docs/GOOGLE_SEARCH.md`) |
| `BLOB_READ_WRITE_TOKEN` | After Blob setup (step 4) |

You do not need `ADMIN_EMAIL` / `ADMIN_PASSWORD` on Vercel. Run `npm run db:seed` once locally with Neon URLs in `.env` to seed production data.

3. **Deploy** — the build runs `prisma migrate deploy` automatically (`vercel-build` script).

---

## 4. Vercel Blob (admin uploads — required in production)

All **Admin → Upload** flows (resources PDFs, church decorations, **photo booth frames**, preview images) use [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) when deployed. Vercel’s filesystem is read-only; without Blob you may see `ENOENT: mkdir '/var/task/public'`.

### Link Blob to the project (pick one path)

**A — From the project (easiest)**  
1. Open project **catholickidscrafts** (not only the team Storage page).  
2. Tab **Storage** → **Create Database** → **Blob** → **Public** access.  
3. If asked, pick this project — env vars (`BLOB_STORE_ID`, OIDC, and/or `BLOB_READ_WRITE_TOKEN`) are added automatically.

**B — Store already created (e.g. `catholickidscrafts28-blob`)**  
1. Team **Storage** → click the Blob store name.  
2. Tab **Projects** → **Connect to Project** → choose **catholickidscrafts** → Production (+ Preview).  
   (If you only see the store overview, use path A from the project’s **Storage** tab instead.)

**C — Check it worked**  
Project **Settings** → **Environment Variables**: `BLOB_STORE_ID` and/or `BLOB_READ_WRITE_TOKEN` for Production.

A new deployment starts when you connect a store or push to `main`. You do not need a separate **Redeploy** if Deployments already shows a recent **Ready** build after connecting.

Locally, uploads go to `public/uploads/` when no Blob env vars are set (`pnpm dev` only).

---

## 5. Custom domain (catholickidscrafts.com)

1. Vercel project → **Settings** → **Domains**
2. Add `catholickidscrafts.com` and `www.catholickidscrafts.com`
3. Add the **DNS records** Vercel shows at your registrar (usually `A` / `CNAME`)
4. SSL is issued automatically (may take a few minutes)

---

## 6. Multiple operator accounts

1. Sign in at `/admin/login` as a **super admin**
2. Open **Operators** in the admin nav → add email, name, password, and role:
   - **Operator** — edit resources and curriculum
   - **Super admin** — above plus manage other operators

The first super admin is created only via `npm run db:seed`. Add further accounts from the Operators screen.

---

## 7. Rich text editor

- **Kids Resources** and **Curriculum** editors support bold, headings, lists, and more
- Content is stored as HTML (`contentFormat: html`)
- Legacy Markdown from seed files still displays; saving converts to HTML

---

## 8. Daily Mass (not editable)

The `/mass` page uses Evangelizo for liturgical **titles** on the calendar and links out to **USCCB** and **Living with Christ** for full reading texts (not republished in public HTML). Optional `GET /api/mass/[date]` still aggregates USCCB RSS for programmatic use. See `docs/MASS_READINGS.md`. Not editable in admin.

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| Vercel build fails on `DIRECT_URL` | Neon direct URL is set |
| Cannot log in | Ran `npm run db:seed`; `AUTH_SECRET` matches on Vercel |
| PDF / frame upload fails (`ENOENT … /var/task/public`) | Create **Blob** store, connect project, set `BLOB_READ_WRITE_TOKEN`, redeploy |
| Operators menu missing | Signed in as super admin (seed account) |

---

## Cost summary (free tiers)

| Service | Free tier |
|---------|-----------|
| Neon | Small Postgres instance |
| Vercel | Hobby (suitable for personal / non-profit) |
| Vercel Blob | Limited storage and bandwidth |
| Evangelizo | Public read-only API |

Upgrade paid plans if traffic grows significantly.
