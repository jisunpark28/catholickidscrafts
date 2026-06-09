# SEO & canonical URLs

## Canonical host

Production traffic should use **`https://www.catholickidscrafts.com`**.

- **Vercel** (`vercel.json`): `catholickidscrafts.com` → `https://www.catholickidscrafts.com` (301)
- **Middleware** (`src/middleware.ts`): apex + `http` → `https://www` (308)
- **Metadata** (`NEXT_PUBLIC_SITE_URL`, `metadataBase`, sitemap, robots): always `https://www`

Set in Vercel:

```env
NEXT_PUBLIC_SITE_URL=https://www.catholickidscrafts.com
```

## Favicon (Google Search)

Regenerate multi-size `favicon.ico` (16–96px) after changing `public/icon.png`:

```bash
pnpm favicon:generate
```

Commits both `public/favicon.ico` and `src/app/favicon.ico`.

Google may take **days to weeks** to refresh favicons in search results after recrawl.

## Per-page canonical URLs

Root layout metadata (`siteMetadata`) sets `metadataBase` only—**not** a global canonical. Each public page under `src/app/(site)/` sets its own canonical via `canonicalForPath()` from `src/lib/site-metadata.ts`.

- Static pages: `...canonicalForPath("/mass")` in `export const metadata`
- Dynamic pages: same helper in `generateMetadata` (e.g. `/resources/${slug}`)
- Filter/query URLs (e.g. `/resources?q=…`) canonical to the base path (`/resources`) without query params
- `/play/emoji` redirects to photo booth; its canonical is `/play/photo-booth`

This fixes Google Search Console “Duplicate without user-selected canonical” when child pages incorrectly inherited `canonical: "/"` from the root layout.

## Google Search Console

1. Verify `https://www.catholickidscrafts.com` (DNS or `GOOGLE_SITE_VERIFICATION` in Vercel env).
2. Submit sitemap: `https://www.catholickidscrafts.com/sitemap.xml`
3. After deploying per-page canonicals, validate the fix for affected URLs (e.g. `/mass`) and request re-indexing.
