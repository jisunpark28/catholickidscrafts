# Mom's Bible PR-1 migration runbook

Migration: `prisma/migrations/20261105120000_moms_bible_phase1/migration.sql`
Branch: `feat/moms-bible-pr1-schema` (depends on PR #283 `feat/moms-bible-step2`).

What it does (additive, one transaction, so a failure changes nothing):
- creates the Mom's Bible enums and tables (`ParentChildLink`, `ParentInvite`, `MbHighlight`,
  `MbNote`, `MbNoteItem`, `MbChapterSeen`, `MbNotification`, `MbParentSettings`, `MbBook`);
- adds `SubProfile.kidCode` (back-filled as `name-NNNN`, e.g. `lily-8492`, random and unique,
  then made required and unique) and the empty PIN columns (`pinHash` stays null);
- adds one owner `ParentChildLink` per child and one `MbParentSettings` row per family account.

It does **not** touch the CKC Access ID columns, so today's child sign-in keeps working.

> **Important: merging into `main` runs this on production automatically.**
> `scripts/vercel-build.sh` runs `next build`, then `scripts/vercel-migrate-deploy.ts`
> (`prisma migrate deploy`) on every production build. If the migration fails, the build
> still deploys the new code (it only logs a warning), so always check the build log (step 3).
> Preview deploys skip migrations (they share the production database).

Never run `prisma migrate dev` or `prisma db push` against Neon. Only `migrate deploy`, and only
in the steps below.

---

## 1. Test on a Neon branch (before merging anything)

1. Neon console → your project → **Branches** → **Create branch**.
   Parent: the production branch (`main`), "Current point in time". Name: `mb-pr1-test`.
2. Open the new branch → **Connection details**. Copy two strings:
   the **pooled** one (host has `-pooler`) and the **direct** one (no `-pooler`).
   They must contain the new branch's endpoint id (`ep-…`), not production's.
3. In a **new** PowerShell window (the variables then only live in that window; `.env` is not
   edited; environment variables win over `.env`):

   ```powershell
   cd C:\Users\jisun\cpac\catholickidscrafts
   git switch feat/moms-bible-pr1-schema
   $env:DATABASE_URL = "<pooled string of mb-pr1-test>"
   $env:DIRECT_URL   = "<direct string of mb-pr1-test>"
   npx prisma migrate status
   ```

   Check the line `Datasource "db": PostgreSQL database ... at "ep-…"`: the `ep-…` must be the
   **test branch**. If it is the production endpoint, stop and close the window.
   It should say that 1 migration (`20261105120000_moms_bible_phase1`) has not been applied
   (if it lists more, `main` has other unapplied migrations: stop and check).
4. Apply it to the test branch only:

   ```powershell
   npx prisma migrate deploy
   ```

   Expected: `Applying migration 20261105120000_moms_bible_phase1` and
   `All migrations have been successfully applied.`
5. Verify in the Neon **SQL Editor** (choose branch `mb-pr1-test`). Every query's expected result
   is in the comment:

   ```sql
   -- a) every child has a valid, unique Kid Code  ->  bad = 0, total = uniq
   SELECT count(*) AS total, count(DISTINCT "kidCode") AS uniq,
          count(*) FILTER (WHERE "kidCode" IS NULL OR "kidCode" !~ '^[a-z]{2,12}-[0-9]{4}$') AS bad
   FROM "SubProfile";

   -- b) every child has an owner link to its family  ->  0
   SELECT count(*) AS missing_owner FROM "SubProfile" s
   WHERE NOT EXISTS (SELECT 1 FROM "ParentChildLink" l
     WHERE l."subProfileId" = s."id" AND l."parentAccountId" = s."familyAccountId" AND l."isOwner");

   -- c) every family account has settings with a unique token  ->  three equal numbers
   SELECT (SELECT count(*) FROM "FamilyAccount") AS families,
          (SELECT count(*) FROM "MbParentSettings") AS settings,
          (SELECT count(DISTINCT "unsubscribeToken") FROM "MbParentSettings") AS tokens;

   -- d) no PINs yet, Access IDs untouched  ->  pins = 0, no_access_id = 0
   SELECT count(*) FILTER (WHERE "pinHash" IS NOT NULL) AS pins,
          count(*) FILTER (WHERE "accessCodeLookup" IS NULL) AS no_access_id
   FROM "SubProfile";

   -- e) look at a few codes
   SELECT "displayName", "kidCode" FROM "SubProfile" ORDER BY "createdAt" DESC LIMIT 10;
   ```

6. Optional app check against the test branch (same PowerShell window): `npm run dev`, sign in
   as a parent, add a child (it must get a `name-NNNN` code and an owner link: re-run query a/b),
   and sign in as an existing child with the old CKC Access ID (must still work).
7. Close that PowerShell window. Keep `mb-pr1-test` until production is done, then delete it.

## 2. Before production

- PR #283 merged into `main` first, then PR-1 rebased/merged on top (PR-1 contains #283's commit).
- Pick a quiet time (evening Toronto time).
- Neon: create a backup branch from production right now, name `pre-mb-pr1-YYYYMMDD`
  (Branches → Create branch, parent `main`, current point in time). This is the restore point.
  Write down the time.

## 3. Production

1. Merge PR-1 into `main` on GitHub. Vercel starts the production build.
2. Vercel → the production deployment → **Build Logs**. Look for:
   - `vercel-build: production … running migrate and ensure scripts after UI build`
   - `Applying migration 20261105120000_moms_bible_phase1`
   - `All migrations have been successfully applied.`
   If you see `vercel-build: warning … post-build DB step failed (migrate=…)` instead, go to
   **4a** right away.
3. Run the queries from step 1.5 in the SQL Editor on the **production** branch (they only read).
4. Quick live check: `/account` loads with the children list, adding a child works, an existing
   child signs in with the Access ID.

## 4. Rollback

### 4a. The migration failed during the build
The migration is one transaction, so the database is unchanged, but the new code went live and
expects `kidCode`. In Vercel → Deployments, **Instant Rollback** to the previous production
deployment (old code matches the old schema). The build script already marks a failed migration
as rolled back and retries it up to 4 times; if it still shows as failed, run from a window
pointed at production (as in step 1.3, with production's strings):
`npx prisma migrate resolve --rolled-back 20261105120000_moms_bible_phase1`.
Fix the cause on a Neon test branch, then deploy again.

### 4b. The migration worked but you need to undo PR-1
Only safe while nobody has used Mom's Bible features (PR-1 has none yet), because it deletes the
new tables.
1. Vercel **Instant Rollback** to the previous production deployment.
2. On GitHub, **Revert** the PR-1 merge on `main`. Otherwise the next production build would
   apply the migration again after step 3 deletes its record.
3. In the Neon SQL Editor on production, run the down SQL:

   ```sql
   BEGIN;
   DROP TABLE IF EXISTS "MbNotification", "MbNoteItem", "MbNote", "MbHighlight", "MbChapterSeen",
     "MbParentSettings", "MbBook", "ParentInvite", "ParentChildLink" CASCADE;
   DROP TYPE IF EXISTS "MbColor", "MbAuthorKind", "MbItemKind", "MbEmailMode";
   DROP INDEX IF EXISTS "SubProfile_kidCode_key";
   ALTER TABLE "SubProfile"
     DROP COLUMN IF EXISTS "kidCode",
     DROP COLUMN IF EXISTS "pinHash",
     DROP COLUMN IF EXISTS "pinSetAt",
     DROP COLUMN IF EXISTS "pinFailCount",
     DROP COLUMN IF EXISTS "pinLockedUntil",
     DROP COLUMN IF EXISTS "pinDisabledAt";
   DELETE FROM "_prisma_migrations" WHERE "migration_name" = '20261105120000_moms_bible_phase1';
   COMMIT;
   ```

   (Tested: after it, the database matches the `main` schema exactly, and the migration can be
   applied again.)

Why roll back the code first: old code doesn't set `kidCode`, so with the new schema "add child"
fails; new code without the new columns fails everywhere. Keep the gap between steps 1 and 3
short.

### 4c. Last resort: Neon restore
Neon → production branch → **Restore** (Reset from parent / point in time) to the backup branch
`pre-mb-pr1-YYYYMMDD` or the noted time. **Everything written after that time is lost** (new
accounts, orders, memos), so prefer 4b. Then do 4b steps 1–2 for the code.

## 5. Notes
- `gen_random_uuid()` is built into Postgres 13+ (every current Neon version); no extension needed.
- Children whose names have no Latin letters get `kid-NNNN`.
- New family accounts don't get `MbParentSettings` from the migration; the app creates it on
  first use (PR-3).
- During the few seconds between the migration finishing and the new deployment going live,
  "add child" on the old code fails once with an error (no `kidCode`). Retrying after the deploy
  works. Merging at a quiet time keeps this unlikely.
