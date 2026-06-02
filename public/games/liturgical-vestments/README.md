# Liturgical vestments game art

## Default on screen

**`character-white.png`** — priest in white (shown before the player picks a color).  
`character-base.png` is not used.

## Grid layout (2×3) → `pnpm run vestments:split`

| | Col 1 | Col 2 | Col 3 |
|---|--------|--------|--------|
| **Row 1** | White | Pink (`rose`) | Red |
| **Row 2** | Green | Purple | Light purple |

Then run **`pnpm run vestments:optimize`** to trim transparent margins (fixes head crop & extra padding).

## Commands

```bash
pnpm run vestments:split
pnpm run vestments:optimize
```
