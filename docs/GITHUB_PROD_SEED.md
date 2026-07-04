# Trigger production seed after Vercel deployment (optional)

Use this if you want seeding to run automatically after each Vercel production deploy, instead of clicking **Run workflow** in GitHub Actions.

The seed job is **idempotent**: global lesson templates are **upserted by shareSlug** on every run; home sections skip when already present (use **force** to re-seed home).

## 1. GitHub Actions secrets

Repo → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Required |
|--------|----------|
| `DATABASE_URL` | Yes (Neon pooled) |
| `DIRECT_URL` | Yes (Neon direct) |
| `ADMIN_EMAIL` | Only if workflow **full seed** is checked |
| `ADMIN_PASSWORD` | Only if workflow **full seed** is checked |
| `ADMIN_NAME` | Optional |

## 2. Run seed once (manual — recommended first time)

1. Merge to `main` and wait until **Vercel** deployment is **Ready**.
2. GitHub → **Actions** → **Seed production database** → **Run workflow**.
3. Leave **force** unchecked (default). First run seeds lesson templates + home hub; later runs refresh templates (e.g. Lent Wk1 showcase).
4. Re-running templates is safe — existing kits update in place by `shareSlug`.

Optional: check **full** for first-time site bootstrap (admin user + curriculum + markdown resources).

## 3. Auto-trigger after Vercel (optional)

### A. Vercel Deploy Hook → GitHub `repository_dispatch`

1. Create a GitHub fine-grained PAT with **Contents: Read** and **Actions: Write** on this repo.
2. GitHub → **Settings** → **Secrets** → add `GH_DISPATCH_TOKEN` (the PAT).
3. Add a small workflow or use curl from a trusted runner — Vercel does not natively POST to GitHub dispatch. Common pattern:
   - **GitHub Actions** `workflow_run` is not tied to Vercel.
   - Use [Vercel Integration](https://vercel.com/docs/observability/webhooks) **Deployment Succeeded** webhook to a serverless function that calls GitHub API, **or**
   - Rely on **manual Run workflow** after deploy (simplest).

### B. GitHub `repository_dispatch` (if you have a webhook caller)

POST to:

```http
POST /repos/{owner}/{repo}/dispatches
```

Body:

```json
{ "event_type": "vercel-deployment-success" }
```

The workflow `.github/workflows/seed-production.yml` listens for this event, waits 120s, runs migrations + seed-once.

## 4. What gets seeded

| Mode | Contents |
|------|----------|
| Default (`db:seed-production-once`) | 5 global lesson templates (showcase: `/lesson/lent-wk1-g3`, `/lesson/mass-etiquette-lower`), home sections on first run |
| **full** checkbox | Above + full `prisma db seed` (admin, curriculum tracks, resources from markdown, typing/hangman words, site copy) |

Vercel **build** still runs `prisma migrate deploy` automatically; this workflow adds data only.

## 5. Local equivalent

```bash
# .env with Neon URLs
pnpm run db:migrate-deploy
pnpm exec prisma generate   # also runs automatically via db:seed-production-once
pnpm run db:seed-production-once
```

Force re-run:

```bash
FORCE_PROD_SEED=true pnpm run db:seed-production-once
```
