#!/usr/bin/env python3
"""Build celebrant chasuble color variants from green base pose PNGs."""

from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "public/games/tiny-priest/assets/mass/characters/celebrant/green"
OUT_BASE = ROOT / "public/games/tiny-priest/assets/mass/characters/celebrant"

# Target chasuble colors (RGB)
TARGETS = {
    "purple": (111, 79, 168),
    "light_purple": (155, 125, 196),
    "pink": (232, 160, 184),
    "white": (247, 244, 232),
}

# Source green chasuble reference
SOURCE_GREEN = (77, 156, 90)


def is_green_chasuble(r: int, g: int, b: int, a: int) -> bool:
    if a < 40:
        return False
    if g < 70 or g <= r or g <= b:
        return False
    gr, gg, gb = SOURCE_GREEN
    dist = ((r - gr) ** 2 + (g - gg) ** 2 + (b - gb) ** 2) ** 0.5
    if dist < 95:
        return True
    # broader green garment detection
    return g > r + 12 and g > b + 8 and 60 <= g <= 210


def recolor_pixel(r: int, g: int, b: int, target: tuple[int, int, int]) -> tuple[int, int, int]:
    _, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    tr, tg, tb = target
    th, _, tv = colorsys.rgb_to_hsv(tr / 255, tg / 255, tb / 255)
    nr, ng, nb = colorsys.hsv_to_rgb(th, max(0.12, s * 0.92), min(1.0, v * (tv / max(0.01, colorsys.rgb_to_hsv(tr / 255, tg / 255, tb / 255)[2]))))
    return int(nr * 255), int(ng * 255), int(nb * 255)


def process_file(src: Path, color_key: str, target_rgb: tuple[int, int, int]) -> None:
    out_dir = OUT_BASE / color_key
    out_dir.mkdir(parents=True, exist_ok=True)
    img = Image.open(src).convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_green_chasuble(r, g, b, a):
                px[x, y] = (*recolor_pixel(r, g, b, target_rgb), a)
    img.save(out_dir / src.name)


def main() -> None:
    if not SRC_DIR.is_dir():
        raise SystemExit(f"Missing green source dir: {SRC_DIR}")
    files = sorted(SRC_DIR.glob("*.png"))
    if not files:
        raise SystemExit(f"No green pose PNGs in {SRC_DIR}")
    for color_key, rgb in TARGETS.items():
        for src in files:
            process_file(src, color_key, rgb)
            print(f"Wrote {color_key}/{src.name}")


if __name__ == "__main__":
    main()
