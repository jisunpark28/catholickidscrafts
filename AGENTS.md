# AGENTS.md

## Cursor Cloud specific instructions

### Services

| Service | Required | Command | Port |
|---------|----------|---------|------|
| Next.js dev | Yes | `pnpm dev` or `npm run dev` | 3000 |

No database. Mass data is fetched at runtime from Evangelizo Reader API (proxied via `/api/mass/*`).

### Mass data source

- **API:** `http://feed.evangelizo.org/v2/reader.php` with `lang=AM` (American English, Roman calendar)
- **Window:** ~30 days from today (Evangelizo feed limit)
- **Routes:** `/mass/YYYY-MM-DD`, `/api/mass/[date]`, `/api/mass/calendar/[year]/[month]`

### Lint / build

- `pnpm lint` / `pnpm build`
- Homepage revalidates hourly (`revalidate` on Evangelizo fetches: 3600s)

### Design

Bright Odin Project–style UI: white cards, `#2563eb` accent, Nunito font, `#f8fafc` background.
