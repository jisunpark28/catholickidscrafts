-- Mom's Bible: a child can start a message to one of their parents on a verse.
-- Additive: one new column with a constant default (existing notes = false, no table rewrite).
-- Test on a Neon branch first; merging into main runs `prisma migrate deploy` on production.

ALTER TABLE "MbNote" ADD COLUMN "startedByChild" BOOLEAN NOT NULL DEFAULT false;
