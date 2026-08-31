# Mass Quest & Courtyard assets

Place new illustrations here. See repo root **`docs/TINY_PRIEST_MASS_ASSETS.md`** for art bible, sizes, and priority.

## Folders

| Folder | Contents |
|--------|----------|
| `characters/` | front/back PNG pairs (~1545×2000 or 1739×2250) |
| `items/` | 512×512 transparent liturgical props |
| `courtyard/` | Exterior props & background pieces |
| `icons/` | 360×360 HUD step icons (optional) |

**Transparency:** AI exports often have opaque white backgrounds. Run from game root:

`python3 scripts/key-sprite-background.py assets/priest_front.png …`

Flood-fills light edge-connected pixels to alpha 0 before committing.

## Manifest

`../manifest/asset-manifest.json` lists every asset ID, target path, Mass step mapping, and `status` (`pending` → `ready`).

When a file is delivered, set `status` to `ready` and commit the PNG.

## Style reference (do not delete)

- `../priest_front.png`, `../nun_front.png`, `../mary.png`, `../church.png`
- `../../stations/station-01.png`
