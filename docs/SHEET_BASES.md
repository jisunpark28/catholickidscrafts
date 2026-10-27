# Sunday sheet bases (Resource editor Phase 2)

Locked **Base PNG** + **layout JSON** for the Fabric editor.

## Layout

| File | Purpose |
|------|---------|
| `public/sheet-bases/{slug}-l{1\|2}.png` | Letter page with editable text hidden (borders, activity, locked chrome) |
| `public/sheet-bases/{slug}-l{1\|2}.json` | Fabric overlay boxes in CSS px (816×1056) |

Coordinates: **1in = 96px**, paper = Letter. See `src/lib/resource/sheet-base.ts`.

## Generate

1. Start the app (skip npm `predev` if Prisma file is locked):

```bash
npx next dev
```

2. Generate one sheet (uses system Chrome by default):

```bash
npx tsx scripts/generate-sheet-bases.ts --key A_OT30
# or: npm run generate:sheet-bases -- --key A_OT30
```

3. All 188 keys × 2 levels (slow):

```bash
npx tsx scripts/generate-sheet-bases.ts --all
```

Env:

- `BASE_URL` — default `http://127.0.0.1:3000`
- `PLAYWRIGHT_CHANNEL` — `chrome` (default) or `msedge`

Capture host: `/dev/sheet-base/[slug]?level=1` (disabled in production unless `ALLOW_SHEET_BASE_CAPTURE=1`).

## Consume

- Access: Free = browse/search + open/print **this Sunday only**; Plus = full library + edit
- Edit UI: `/resource/edit/[slug]` → Fabric editor. Uses `public/sheet-bases` when present; otherwise **live browser capture** of `GospelSheet variant=base` (`SheetFabricLiveBase`)
- Save API: `POST/PATCH /api/resource/custom-sheets` — `familyHasPlus()` every write
- Diff JSON stored in `CustomSheet` (migration `20261027010000_custom_sheets`)
- Photos: `POST /api/resource/photos` — Plus only; sharp resize ≤2400px, EXIF strip → WebP; family 200MB + 30/day (`SheetPhoto`, migration `20261027020000_sheet_photos`)
- Export: client PDF (jsPDF + ~300dpi JPEG) and PNG from Fabric canvas (selection chrome hidden)

## Editor fonts

Google Fonts CSS loaded at runtime (Fabric needs `document.fonts.load`): Andika, Comic Neue, Fredoka, Baloo 2, Nunito, Patrick Hand, Caveat, Atkinson Hyperlegible.
