#!/usr/bin/env bash
# Vercel build entrypoint. Preview PR deploys skip DB migrate/ensure (shared Neon with production).
set -euo pipefail

echo "vercel-build: VERCEL_ENV=${VERCEL_ENV:-unset} ref=${VERCEL_GIT_COMMIT_REF:-unset}"

pnpm exec prisma generate

is_production="false"
if [ "${VERCEL_ENV:-}" = "production" ] || [ "${VERCEL_GIT_COMMIT_REF:-}" = "main" ]; then
  is_production="true"
fi

if [ "$is_production" = "true" ]; then
  echo "vercel-build: production — running migrate and ensure scripts"
  pnpm exec tsx scripts/vercel-migrate-deploy.ts
  pnpm exec tsx scripts/ensure-home-section-items.ts
  pnpm exec tsx scripts/ensure-bible-discussion-schema.ts
else
  echo "vercel-build: preview — skipping DB migrate/ensure (shared Neon DB)"
fi

pnpm exec next build
