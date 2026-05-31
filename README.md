# Catholic Kids Crafts

A Catholic kids catechism resource site with an [Odin Project](https://www.theodinproject.com/)-inspired layout: clean grids, bold typography, and a dark theme with liturgical gold accents.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS v4**
- Content in **Markdown** (`content/resources/*.md`)
- Deploy on **[Vercel](https://vercel.com)** from **GitHub**

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command        | Description              |
|----------------|--------------------------|
| `pnpm dev`     | Development server       |
| `pnpm build`   | Production build         |
| `pnpm start`   | Run production build     |
| `pnpm lint`    | ESLint                   |

## Adding a resource

1. Create `content/resources/your-slug.md` with frontmatter:

```yaml
---
title: "Your lesson title"
excerpt: "Short description"
date: "2026-05-31"
grade: "Pre-K"
topic: "Saints"
downloadLabel: "Optional button label"
downloadUrl: "/downloads/your-file.pdf"
---
```

2. Push to GitHub—Vercel redeploys automatically.

## Custom domain (Vercel)

1. Import this repo in Vercel.
2. **Settings → Domains** → add your domain.
3. At your registrar, set the DNS records Vercel shows (usually `CNAME` to `cname.vercel-dns.com`).

## Curriculum tracks

Tracks are defined in `src/lib/content.ts`. Markdown posts are matched to tracks by the `grade` field in frontmatter.

## License

Educational use. Add your own license as needed for PDFs and paid products.
