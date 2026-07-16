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
fi

# Build the Next.js app first so UI changes (e.g. Mass calendar links) ship even when
# Neon is momentarily busy or migrate hits an advisory lock.
pnpm exec next build

if [ "$is_production" = "true" ]; then
  echo "vercel-build: production — running migrate and ensure scripts after UI build"
  set +e
  pnpm exec tsx scripts/vercel-migrate-deploy.ts
  migrate_code=$?
  pnpm exec tsx scripts/ensure-home-section-items.ts
  ensure_home_code=$?
  pnpm exec tsx scripts/ensure-bible-discussion-schema.ts
  ensure_discussion_code=$?
  set -e
  if [ "$migrate_code" -ne 0 ] || [ "$ensure_home_code" -ne 0 ] || [ "$ensure_discussion_code" -ne 0 ]; then
    echo "vercel-build: warning — post-build DB step failed (migrate=$migrate_code home=$ensure_home_code discussion=$ensure_discussion_code). Deployment keeps the successful UI build."
  fi
fi
