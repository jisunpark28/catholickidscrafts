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
   - In Vercel, set `GOOGLE_SITE_VERIFICATION` to the `content=` value Google gives you (not the full meta tag).
   - Redeploy, then click **Verify** in Search Console.
4. **Sitemaps** → submit: `https://www.catholickidscrafts.com/sitemap.xml`
5. **URL inspection** → enter `https://www.catholickidscrafts.com/` → **Request indexing**

Also add the **domain** property `catholickidscrafts.com` if you want coverage for both hosts.

## 3. What to expect

- First results often take **several days to a few weeks** after indexing is requested.
- Try `site:www.catholickidscrafts.com` (with `www`) after Search Console shows pages as indexed.
- Share the site on social or link from another site to help discovery.

## 4. Quick checks

| Check | Expected |
|-------|----------|
| `robots.txt` | `Allow: /` |
| Homepage HTML | no `noindex` |
| Canonical | `https://www.catholickidscrafts.com/...` |
