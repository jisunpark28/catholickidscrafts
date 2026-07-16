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

You do not need `ADMIN_EMAIL` / `ADMIN_PASSWORD` on Vercel. Seed production data once using either:

- **GitHub Actions** (recommended): see [`docs/GITHUB_PROD_SEED.md`](GITHUB_PROD_SEED.md) — Actions → **Seed production database** → Run workflow (idempotent; safe to click once after deploy).
- **Local CLI**: `npm run db:seed-production-once` with Neon URLs in `.env` (or full `npm run db:seed` with admin env vars).

3. **Deploy** — production builds run `bash scripts/vercel-build.sh` (`prisma migrate deploy` on `main` only). Preview PR builds skip DB migrate and use the shared production Neon database. **Seed is not part of the Vercel build**; run the GitHub Action or CLI above once.

### Neon + Vercel: avoid “Branch limit exceeded”

If Vercel preview checks fail with **Provisioning integrations failed** or **Neon branching: Branch limit exceeded**, the Vercel–Neon integration is creating a new `preview/<git-branch>` database branch per PR and your Neon plan limit (Free: **10 branches**) is full.

**Important:** While the Neon integration is connected, Preview `DATABASE_URL` values injected at deploy time **override** manual Preview env vars. Turning off preview branching requires disconnecting or reconnecting without Preview — not only copying Production URLs.

**Step 1 — Free branch slots (Neon Console)**

1. [console.neon.tech](https://console.neon.tech) → your project → **Branches**
2. Delete branches named `preview/...` (never delete `main`)
3. If you use **Neon-Managed** integration: **Integrations** → **Vercel** → **Manage** → **Branches** → delete stale preview branches

**Step 2 — Stop creating a Neon branch per PR**

*Vercel-Managed (Neon from Vercel **Storage**):*

1. [vercel.com](https://vercel.com) → team → **Storage** → your Neon database (or project **catholickidscrafts28** → **Storage** tab)
2. **Projects** tab → **catholickidscrafts28** → **⋯** → **Remove project connection**
3. **Connect project** again → enable **Production** only; leave **Preview** unchecked (and **Deployments configuration → Preview** off if shown)
4. Set env vars manually (Step 3 below)

*Neon-Managed (linked from Neon Console):*

1. Neon → **Integrations** → **Vercel** → **Manage** → **Disconnect**
2. Set env vars manually (Step 3 below)

**Step 3 — Manual DB env vars (shared production DB for previews)**

From Neon **main** branch → **Connection details**:

| Vercel variable | Neon string |
|-----------------|-------------|
| `DATABASE_URL` | **Pooled** (host contains `-pooler`) |
| `DIRECT_URL` | **Direct** (no pooler) |

Vercel project → **Settings** → **Environment Variables** → set both for **Production** and **Preview** → **Redeploy** the PR preview.

**Optional:** GitHub **Secret** `NEON_API_KEY` + **Variable** `NEON_PROJECT_ID` enables `.github/workflows/neon-preview-branch-cleanup.yml` (deletes `preview/<branch>` when a PR closes) and **Cleanup stale Neon preview branches** (Actions tab).

See [Neon: Managing Vercel preview branch cleanup](https://neon.com/docs/guides/vercel-branch-cleanup).

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

The `/mass` page uses Evangelizo for liturgical **titles** on the calendar and links out to **USCCB**, **Living with Christ**, and **GoodNews** for full reading texts (not republished in public HTML). Optional `GET /api/mass/[date]` still aggregates USCCB RSS for programmatic use. See `docs/MASS_READINGS.md`. Not editable in admin.

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| Vercel preview **pending** / **Provisioning integrations failed** / **Neon branch limit exceeded** | Disable Vercel **Preview** Neon branching; use shared `DATABASE_URL` for Preview; delete stale `preview/*` branches in Neon (see §3 above) |
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
