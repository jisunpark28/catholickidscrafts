# Homepage-palette sidebar navigation

## Existing destinations

- Printables: `/resource` (display-name change only; no Resource route renamed).
- Daily Mass: `/daily-mass`.
- Play & Learn: `/play` (including nested games; merged #318 full-width canvas is retained).
- Mom's Bible: `/moms-bible/situations`, the same entry used by the homepage Mom's Bible feature. Direct reader URLs such as `/bible/read/genesis/1` stay valid. Reader quick links retain Today's Gospel and the existing Genesis/Matthew book hubs, plus the situations board. No deleted OT/NT routes are restored.
- Q&A Cards: `/qa-cards`, one page with a button per liturgy topic (Mass, Sacraments, Saints, Devotions, Ordinary Time, Advent, Christmas Time, Lent, Paschal Triduum, Easter Time). The chosen topic is kept in the URL hash, client side only.
- Prayer: `/prayers`. `/catholic-faith-questions` and its card pages were removed and return 404.

## Blocking missing destination: My Binder

At baseline main `5141a99`, no Binder route, API, component, action, or reference exists in `src`, `prisma`, or `docs` (`git grep -ni binder 5141a99 -- src prisma docs` returns no matches). The existing `/account/memos` is specifically Bible passage memos, not a Binder feature. It must not be silently relabeled/mislinked.

Consequently, the paid-only My Binder drawing/label is an explicitly disabled button with an accessible explanation, **not** an invented URL, paywall, locked upsell, or new backend. This PR stays DRAFT pending a real Binder destination/action or an approved follow-up implementation. Its preceding dotted separator and the entire item are omitted from the signed-out/free DOM.

## Entitlement boundary

The site server layout obtains a verified ReaderKey using the existing `getReaderKey`, then resolves existing authoritative billing grants with `resolveFamilyPlus`. Active one-time passes and granting legacy paid Stripe windows are accepted; preview-email and unpaid-trial access are excluded. Current paid cancellation/grace windows follow the existing billing policy, not a newly invented subscription rule. Child accounts follow the same owning/co-parent Family Pass relationships as existing paid features. Inactive readers, errors, guests and free accounts fail closed.

Only the resulting boolean reaches the client context. There is no local-storage plan flag, query-string bypass, account mutation, DB migration, new backend permission, or cross-user entitlement cache. Navigation visibility is not access control.

## Artwork / accessibility

Seven original scalable paper-and-ink SVG drawings use coherent rounded strokes, restrained shading and inherited ink color. No emoji, stock icon mixture, rasterized text, whole-sidebar image, or game artwork is used. Pale-peach active cards use darker burnt-orange text/ink and a small green left indicator. Normal warm-brown text on near-white and active orange text on peach meet 4.5:1; icon, active-marker, border and keyboard-focus colors meet 3:1. The tiny Plus badge retains a muted-green accent. Links remain real accessible DOM with focus outlines and nested-route/hash `aria-current` behavior. Existing collapse/mobile/Escape behavior is preserved.

## Reproduction and limitations

- `tsx scripts/test-sidebar-navigation.ts`: 80 reader/plan decisions plus co-parent/inactive/error guards; 16 current-route/hash cases; exact order; real route files; SSR free/guest omission; original icons; contrast. Writes component fixtures to SIDEBAR_FIXTURE_DIR (default OS temp).
- `tsx scripts/test-sidebar-browser.ts`: production signed-out UI and nonbroken HTTP destinations, preserved categories, active icons, desktop/mobile overflow/toggles/focus; captures signed-out production and free/Plus **component fixtures**. Set SIDEBAR_BASE_URL and SIDEBAR_FIXTURE_DIR as needed.
- `tsx scripts/test-play-hub-layout.ts`: merged full-width Play behavior, future cards and navigation remain intact.

Local production previews/builds use the same non-secret CI placeholder configuration as `.github/workflows/ci.yml`; no real billing/account DB or production migrations are exercised. Signed-in free/Plus screenshots are rendered component fixtures derived from injected billing snapshots through the production decision function, not claimed live authenticated accounts. The actual signed-out production page is tested separately.