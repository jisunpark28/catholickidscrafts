# Google search indexing

Google not showing `site:catholickidscrafts.com` is normal for a **new site** until you verify ownership and submit URLs. The site is not blocked in `robots.txt`.

## 1. Use the same URL everywhere

Live site redirects to **https://www.catholickidscrafts.com**. Set in Vercel:

```env
NEXT_PUBLIC_SITE_URL=https://www.catholickidscrafts.com
```

After deploy, check:

- https://www.catholickidscrafts.com/robots.txt → `Sitemap: https://www.catholickidscrafts.com/sitemap.xml`
- https://www.catholickidscrafts.com/sitemap.xml → all `<loc>` URLs use `www`

## 2. Google Search Console (required)

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add property **URL prefix**: `https://www.catholickidscrafts.com`
3. Verify ownership (HTML tag recommended):
   - In Vercel → **Settings** → **Environment Variables**, add **`GOOGLE_SITE_VERIFICATION`** (Production) with the `content=` value from Google — **not** the full `<meta>` tag.
   - **Redeploy** Production (or wait for the next deploy). The root layout emits `<meta name="google-site-verification" content="…" />` when this variable is set.
   - Confirm: open `https://www.catholickidscrafts.com/` → **View page source** → search `google-site-verification`.
   - In Search Console, click **Verify**.
4. **Sitemaps** → submit: `https://www.catholickidscrafts.com/sitemap.xml`
5. **URL inspection** → enter `https://www.catholickidscrafts.com/` → **Request indexing**

Also add the **domain** property `catholickidscrafts.com` if you want coverage for both hosts.

## 3. What to expect

- First results often take **several days to a few weeks** after indexing is requested.
- Try `site:www.catholickidscrafts.com` (with `www`) after Search Console shows pages as indexed.
- Share the site on social or link from another site to help discovery.

## 4. Search result favicon (small icon next to URL)

Google uses a **favicon**, not the large header logo or `og:image`.

After deploy, confirm:

- https://www.catholickidscrafts.com/favicon.ico → **200**
- https://www.catholickidscrafts.com/logo-icon.png → square **48×48** PNG
- Homepage source includes `rel="icon"` and `rel="apple-touch-icon"`

Icons are generated from `src/Logo.png` (same as the top-left header). Regenerate after a logo change:

```bash
python3 scripts/generate-favicons.py
```

Google may keep the default globe for **days or weeks** after indexing, then refresh the favicon automatically. Use **URL inspection** on the home page occasionally if you want a recrawl (do not spam requests).

### Search Console branding (optional)

If your account shows **Settings → Branding** (or organization / identity options), you can upload logo assets there. Availability varies by property type and region. Favicon in search results still primarily comes from `/favicon.ico` and `rel="icon"` on the site.

## 5. Quick checks

| Check | Expected |
|-------|----------|
| `robots.txt` | `Allow: /` |
| Homepage HTML | no `noindex` |
| Canonical | `https://www.catholickidscrafts.com/...` |
| `/favicon.ico` | HTTP 200 |
