# Outbound link policy (operators)

## Link types

| Type | When to use | Site behavior |
|------|-------------|---------------|
| **Standard link** | YouTube, publisher sites, TPT, parish pages, non-Amazon shops | `rel="noopener noreferrer"` |
| **Amazon Associate** | Any `amazon.com` (and regional Amazon) product URL that includes your affiliate tag | `rel="noopener noreferrer sponsored"` + FTC disclosure on the page |

## Automatic detection

If you leave **Standard** but the URL is an Amazon domain, the public site still treats it as an Amazon affiliate link for disclosure and `rel` attributes. Prefer setting **Amazon Associate** explicitly for books and supplies.

## YouTube

Use **Standard link**. Embed works automatically when type is **Video** and the URL is a YouTube watch or youtu.be link.

## Teachers Pay Teachers

Resource posts use the **TPT URL** field on Kids Resources, not Recommendations. Recommendations TPT links use **Standard link**.

## FTC / Amazon

- Site-wide disclosure: `/affiliate-disclosure`
- Footer links to disclosure on every public page
- Do not hide affiliate relationships in recommendation notes
