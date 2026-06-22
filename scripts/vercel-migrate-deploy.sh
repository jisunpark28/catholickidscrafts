#!/usr/bin/env bash
set -euo pipefail

PRISMA="npx prisma"

set +e
DEPLOY_OUT="$($PRISMA migrate deploy 2>&1)"
DEPLOY_CODE=$?
set -e
echo "$DEPLOY_OUT"

if [ "$DEPLOY_CODE" -ne 0 ]; then
  if echo "$DEPLOY_OUT" | grep -q "20260622120000_bible_chapter_discussion" \
    && echo "$DEPLOY_OUT" | grep -qE "P3009|failed migrations|failed to apply"; then
    echo "Recovering failed bible discussion migration (runtime columns may exist already)..."
    $PRISMA migrate resolve --rolled-back 20260622120000_bible_chapter_discussion
    $PRISMA migrate deploy
  else
    exit "$DEPLOY_CODE"
  fi
fi
