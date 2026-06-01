# Typing game word catalog

File: `typing-words.ts` — source of truth for **Word mode** (`/play/typing`).

| sortOrder | Category |
|-----------|----------|
| 0 | Basic prayer words |
| 1 | 24 virtues (theological, cardinal, and moral) |
| 2 | Catholic Mass terms |
| 3 | Twelve apostles and well-known saints |
| 4 | Bible vocabulary (nouns, names, key verbs — no articles, prepositions, or conjunctions) |

## Load into production

```bash
# .env must have DATABASE_URL and DIRECT_URL (Neon)
npx prisma generate
npx prisma migrate deploy
npm run db:seed-typing
```

### Windows / Neon troubleshooting

**`P1002` advisory lock timeout on `migrate deploy`**

- Another migration may be running (e.g. Vercel deploy). Wait 2–3 minutes and retry.
- In `.env`, `DIRECT_URL` must be Neon **direct** (host **without** `-pooler`). `DATABASE_URL` is the pooled URL.
- Check status: `npx prisma migrate status` — if all migrations are already applied, skip to `npm run db:seed-typing` only.

**`Cannot read properties of undefined (reading 'upsert')`**

- Run `npx prisma generate` after `git pull` (Prisma client was generated before `TypingWord` existed).
- Then `npm run db:seed-typing` again.


Or full seed (also needs `ADMIN_EMAIL` / `ADMIN_PASSWORD`):

```bash
npm run db:seed
```

Edits: change `typing-words.ts`, then run `db:seed-typing` again (upserts by `word`).
