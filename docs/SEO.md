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

## Google Search Console

1. Verify `https://www.catholickidscrafts.com` (DNS or `GOOGLE_SITE_VERIFICATION` in Vercel env).
2. Submit sitemap: `https://www.catholickidscrafts.com/sitemap.xml`
3. Request indexing for the homepage after major SEO changes.
