#!/usr/bin/env python3
"""Remove solid light backgrounds from character PNGs (flood-fill from edges)."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw


def key_sprite_background(path: Path, *, thresh: int = 38) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    seeds: list[tuple[int, int]] = []
    for x in range(0, w, 20):
        seeds.append((x, 0))
        seeds.append((x, h - 1))
    for y in range(0, h, 20):
        seeds.append((0, y))
        seeds.append((w - 1, y))

    for seed in seeds:
        try:
            ImageDraw.floodfill(im, seed, (0, 0, 0, 0), thresh=thresh)
        except ValueError:
            pass
    return im


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("Usage: key-sprite-background.py <image.png> [more.png ...]", file=sys.stderr)
        return 1
    for arg in argv[1:]:
        path = Path(arg)
        im = key_sprite_background(path)
        im.save(path, optimize=True)
        print(f"keyed {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
