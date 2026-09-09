# Content-Security-Policy

Phase 3b enforces CSP on all routes via `next.config.ts` (`cspHeaders()` from `src/lib/csp.ts`). Report-Only landed first on `main` (Phase 3 / PR #200); this is the enforcing policy after those flows showed no critical violations.

Responses send `Content-Security-Policy` plus `Reporting-Endpoints`. They do **not** send `Content-Security-Policy-Report-Only`. Browser reports still POST to `/api/csp-report` (`report-uri` / `report-to`).

## Production policy

```
default-src 'self'
base-uri 'self'; object-src 'none'; frame-ancestors 'self'
script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://universalis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://va.vercel-scripts.com
style-src 'self' 'unsafe-inline' https://hangeul.pstatic.net
img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.blob.vercel-storage.com https://i.ytimg.com https://img.youtube.com https://yt3.ggpht.com https://m.media-amazon.com https://images-na.ssl-images-amazon.com https://images-eu.ssl-images-amazon.com https://api.qrserver.com
font-src 'self' data: https://hangeul.pstatic.net
frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://docs.google.com https://drive.google.com
connect-src 'self' https://universalis.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://cdn.jsdelivr.net https://justadudewhohacks.github.io
worker-src 'self' blob:
media-src 'self' blob: https://*.public.blob.vercel-storage.com https://*.blob.vercel-storage.com
form-action 'self'
report-uri /api/csp-report; report-to csp-endpoint
```

`NEXT_PUBLIC_CHURCH_GAME_URL` may add that origin to `frame-src` when it is an absolute `https://` (or `http://localhost`) URL.

Development also allows `'unsafe-eval'` on `script-src` and `ws:` / `wss:` on `connect-src` for Next.js HMR.

## Residual `'unsafe-inline'`

`script-src` and `style-src` still include `'unsafe-inline'` because Next 15 inlines hydration / Flight and `next/font` `<style>` tags. This app does not set CSP nonces (`x-nonce` in middleware). A nonce without covering static `/games/*` HTML would break those iframes (browsers ignore `'unsafe-inline'` when a nonce is present).

Game boot scripts that were inline are external files under `'self'`:

- Hangman: `public/games/hangman/boot.js` and `hangman.css`
- Face to Emoji: `public/games/face-to-emoji/embed-mode.js`

## Verify

```bash
pnpm exec tsx scripts/test-csp.ts
curl -sI http://localhost:3000/ | grep -i content-security-policy
```

Expect `content-security-policy:` and no `content-security-policy-report-only`. Walk home, Daily Mass, a YouTube resource, `/play/church`, `/play/hangman`, `/play/face-to-emoji`, `/bible/gospel`, `/account/login`, `/admin/login`. Console should not show blocking CSP errors.
