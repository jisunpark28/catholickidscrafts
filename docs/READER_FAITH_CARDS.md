# Reader text size, faith articles, and liturgy Q&A flips

## Scripture size

`/bible/read/[book]/[chapter]` has A− / A+ controls for verse text only. Seven sizes: 16.5, 18, 20, 22, 24, 28, and 32px. The ends disable the matching button. The choice is stored as `ckc-bible-reading-size-v1`. Unsupported or unreadable storage stays at 16.5px, including when storage throws. A small inline script applies a saved size before hydration. The title, notes column, sidebar, and site header keep their own sizes. Language, verse selection, and highlights are unchanged.

## Faith articles

The `/catholic-faith-questions` hub and its `/catholic-faith-questions/[slug]` card pages were removed (404). The faith card data in `src/lib/seo/card-seo.ts` is kept.

## Q&A flip deck

Sidebar: **Q&A Cards** goes to `/qa-cards`, which shows the ten liturgy Q&A topics behind one button each (same published data as `/liturgy/[topic]`, with the authored catalog as fallback when the database cannot be read). **Prayer** goes to `/prayers`.

When the database can be read, a topic shows its published rows (the same query as the topic page). A topic with no published rows stays out of the deck. When the database cannot be read, that topic uses the public fields of `prisma/data/liturgy-qa-cards.json` (question, answer, try this, color, alt text, emoji). Review notes and image prompts are not rendered. Topic pages themselves are unchanged and still hide Q&A when the database read fails.

## Checks

- `pnpm test:reader-faith`
- `npx tsx scripts/test-reader-faith-browser.ts` with the production server (`READER_BASE_URL`, screenshots in `READER_SCREENSHOT_DIR`)
- `npx tsc --noEmit`, ESLint on touched files, and `pnpm build`

Local production checks use a non-live database URL. They do not claim a live Neon database, family sign-in, or saved Mom's Bible notes.
