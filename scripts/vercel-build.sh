#!/usr/bin/env bash
# Vercel build entrypoint. Preview PR deploys skip DB migrate/ensure (shared Neon with production).
set -euo pipefail

echo "vercel-build: VERCEL_ENV=${VERCEL_ENV:-unset} ref=${VERCEL_GIT_COMMIT_REF:-unset}"

pnpm exec prisma generate

is_production="false"
if [ "${VERCEL_ENV:-}" = "production" ] || [ "${VERCEL_GIT_COMMIT_REF:-}" = "main" ]; then
  is_production="true"
fi

if [ "$is_production" != "true" ]; then
  echo "vercel-build: preview — skipping DB migrate/ensure (shared Neon DB)"
else
  # Apply schema before publishing app code. A failed migrate used to log a
  # warning and still deploy, so Google family sign-in hit missing columns.
  echo "vercel-build: production — applying Prisma migrations before the app build"
  pnpm exec tsx scripts/vercel-migrate-deploy.ts
  echo "vercel-build: production — migrate deploy succeeded"
  set +e
  pnpm exec tsx scripts/ensure-home-section-items.ts
  ensure_home_code=$?
  pnpm exec tsx scripts/ensure-bible-discussion-schema.ts
  ensure_discussion_code=$?
  set -e
  if [ "$ensure_home_code" -ne 0 ] || [ "$ensure_discussion_code" -ne 0 ]; then
    echo "vercel-build: warning — ensure script failed (home=$ensure_home_code discussion=$ensure_discussion_code). Migrations already applied; continuing the app build."
  fi
fi

pnpm exec next build
