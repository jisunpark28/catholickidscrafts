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
npm run db:seed-typing
```

Or full seed (also needs `ADMIN_EMAIL` / `ADMIN_PASSWORD`):

```bash
npm run db:seed
```

Edits: change `typing-words.ts`, then run `db:seed-typing` again (upserts by `word`).
