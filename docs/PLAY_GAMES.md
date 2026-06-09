# Play & Learn games

Public hub: `/play`

| Game | Path | Source |
|------|------|--------|
| Tiny Priest (church 3D) | `/play/church` → `/games/tiny-priest/` | [tiny-priest](https://github.com/jisunpark28/tiny-priest) |
| Gospel typing | `/mass/YYYY-MM-DD` (below readings) | Built in Next.js |
| Hangman | `/play/hangman` → `/games/hangman/` | [portfolio Hangman](https://github.com/jisunpark28/my-course-portfolio/tree/main/Project/HANGMAN-GAME/JavaScript-Ver) + words from `GET /api/hangman-words` |
| Face to Emoji | `/play/face-to-emoji` → `/games/face-to-emoji/` (iframe) | [FaceToEmoji](https://github.com/jisunpark28/FaceToEmoji) |
| 4-Cut Photo Booth | `/play/photo-booth` (legacy `/play/emoji` redirects here) | Built in Next.js |

## Updating embedded games

1. Refresh vendor copy under `public/games/…`
2. For **tiny-priest**, exclude `*pbr*.glb` and `docs/` to reduce size (~70MB)
3. Optional: deploy tiny-priest separately and set `NEXT_PUBLIC_CHURCH_GAME_URL`

## Deploy note

Large static assets in `public/games/tiny-priest/` increase repo and Vercel bundle size. Consider Git LFS or external hosting if pushes fail.

## Church decorations (operator)

- Admin: `/admin/church-decorations` — **Set up all 14 walls** at `/admin/church-decorations/new` (bulk upload per frame)
- Public API: `GET /api/church-decorations`
- Click uploaded images inside the 3D church to show title + description.

## Site & game text (operator)

- Admin: `/admin/site-copy` — nav labels, home page, page headers, game UI chrome, season filter names, Tiny Priest/Hangman shell text
- Public API: `GET /api/site-copy` (optional `?group=…` or `?prefix=…`)
- Seed: `npm run db:seed-site-copy`
- **Not** included: Mass readings, typing/hangman word lists, church wall images, Mass Order step bodies (separate admins)

## Mass Order (operator)

- Admin: `/admin/mass-order-steps` — edit subtitle text, button labels, and gestures for each step under **Mass Order** in the sanctuary
- Public API: `GET /api/mass-order-steps`
- Seed defaults: `npm run db:seed-mass-order`

## 4-Cut Photo Booth frames (operator)

- Admin: `/admin/photo-booth-frames` — upload transparent PNG overlays (360×480 px recommended).
- Public API: `GET /api/photo-booth-frames`
- Frames render **on top of photos**, under stickers, in single and 4-cut modes.

## Face to Emoji (`/play/face-to-emoji`)

- Vendor copy: `public/games/face-to-emoji/` from [FaceToEmoji](https://github.com/jisunpark28/FaceToEmoji)
- Embedded via `FaceToEmojiEmbed` (`?embed=1` hides marketing footer inside the iframe)
- **100% client-side**: face-api.js models load from CDN on first upload; photos never leave the browser
- Upload → **Auto** (detect faces) → optional **Edit** → **Download Edited Image**
- Site copy: `play.game.face-to-emoji.*`, `play.facetemoji.page.*` (seed: `npm run db:seed-site-copy`)

## Hangman (`/play/hangman`)

- Words from `GET /api/hangman-words` (admin: `/admin/hangman-words` — same workflow as typing: quick add, bulk paste, inline hint/Live, delete).
- Fallback: `public/games/hangman/catholic-words.js` if the API returns no published words.
- Seed defaults: `npm run db:seed-hangman`

## Typing games (`/play/typing`)

- **Word mode**: falling words from `GET /api/typing-words` (admin: `/admin/typing-words` — quick add, bulk paste, inline delete).
- **Today's Bible**: today's reading type; text from `GET /api/universalis-readings/[date]` (Universalis JSONP, calendar `Europe.England` by default). Show the returned `copyrightNotice` on the page (Universalis webmaster terms).
- Typing is **not** on Daily Mass pages—only under Play.

## Liturgical vestments (`/play/liturgical-vestments`)

Dress Tiny Priest’s priest in the correct liturgical color per season.
