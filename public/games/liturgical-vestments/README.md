# Liturgical vestments game art

## Quick replace (your own 2×3 grid)

1. Save your reference sheet as **`spritesheet-source.png`** in this folder.  
   Layout: **3 columns × 2 rows**, same pose in every cell:

   | | Col 1 | Col 2 | Col 3 |
   |---|--------|--------|--------|
   | **Row 1** | White | Rose (pink) | Red |
   | **Row 2** | Green | Purple | (extra / unused) |

2. Run from repo root:

   ```bash
   pnpm run vestments:split
   ```

3. Add **`character-base.png`** — priest in **white alb only** (no chasuble), same pose/size as the grid cells (about **480×960** px after split).

## Files

| File | Purpose |
|------|---------|
| `spritesheet-source.png` | Your 2×3 master sheet (not shown in game) |
| `character-base.png` | Alb only, before player picks a color |
| `character-white.png` … `character-rose.png` | Full figure per liturgical color |

## Optional single-layer PNGs (legacy)

`priest-cassock.png`, `alb.png`, `chasuble-*.png` at **240×480** are no longer used; the game uses the full `character-*.png` sprites above.
