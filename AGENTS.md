# AGENTS.md

## Cursor Cloud specific instructions

### Services

| Service | Required | Command | Notes |
|---------|----------|---------|--------|
| Next.js dev server | Yes (local dev) | `pnpm dev` | Default port **3000** |
| Production preview | Optional | `pnpm build && pnpm start` | After build |

No database or Docker services.

### Lint / test / build

- **Lint:** `pnpm lint`
- **Build:** `pnpm build`
- **Tests:** none configured yet

### Content workflow

- Lesson posts: `content/resources/*.md` (gray-matter frontmatter)
- Curriculum tracks: `src/lib/content.ts`
- Static downloads: `public/downloads/`

### Vercel

`vercel.json` sets framework to `nextjs`. Connect the GitHub repo in Vercel; each push to `main` deploys. Add custom domain under project **Domains**.

### Non-obvious notes

- Tailwind v4 uses `@import "tailwindcss"` in `globals.css` (no separate `tailwind.config` required for basics).
- Resource pages are statically generated from Markdown at build time; new `.md` files need a rebuild/redeploy to appear.
