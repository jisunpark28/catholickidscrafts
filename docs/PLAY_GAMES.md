# Play & Learn games

Public hub: `/play`

| Game | Path | Source |
|------|------|--------|
| Tiny Priest (church 3D) | `/play/church` → `/games/tiny-priest/` | [tiny-priest](https://github.com/jisunpark28/tiny-priest) |
| Gospel typing | `/mass/YYYY-MM-DD` (below readings) | Built in Next.js |
| Hangman | `/play/hangman` → `/games/hangman/` | [portfolio Hangman](https://github.com/jisunpark28/my-course-portfolio/tree/main/Project/HANGMAN-GAME/JavaScript-Ver) + Catholic word list |
| Face to Emoji | `/play/emoji` → `/games/face-to-emoji/` | [FaceToEmoji](https://github.com/jisunpark28/FaceToEmoji) |

## Updating embedded games

1. Refresh vendor copy under `public/games/…`
2. For **tiny-priest**, exclude `*pbr*.glb` and `docs/` to reduce size (~70MB)
3. Optional: deploy tiny-priest separately and set `NEXT_PUBLIC_CHURCH_GAME_URL`

## Deploy note

Large static assets in `public/games/tiny-priest/` increase repo and Vercel bundle size. Consider Git LFS or external hosting if pushes fail.

## Church decorations (operator)

- Admin: `/admin/church-decorations`
- Public API: `GET /api/church-decorations`
- Click uploaded images inside the 3D church to show title + description.

## Typing games (`/play/typing`)

- **Word mode**: falling words from `GET /api/typing-words` (admin: `/admin/typing-words`).
- **Today's Bible**: today's reading type; text from `GET /api/lwc-readings/[date]` (Living with Christ).
- Typing is **not** on Daily Mass pages—only under Play.

## Liturgical vestments (`/play/liturgical-vestments`)

Dress Tiny Priest’s priest in the correct liturgical color per season.
