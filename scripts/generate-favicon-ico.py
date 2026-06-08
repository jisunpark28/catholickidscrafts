#!/usr/bin/env python3
"""Build multi-size favicon.ico (16–96px) from public/icon.png for Google Search."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "icon.png"
OUTPUTS = [
    ROOT / "public" / "favicon.ico",
    ROOT / "src" / "app" / "favicon.ico",
]
SIZES = [(16, 16), (32, 32), (48, 48), (64, 64), (96, 96)]


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing source image: {SOURCE}")

    base = Image.open(SOURCE).convert("RGBA")
    for out in OUTPUTS:
        out.parent.mkdir(parents=True, exist_ok=True)
        base.save(out, format="ICO", sizes=SIZES)
        print(f"Wrote {out} ({len(SIZES)} sizes)")


if __name__ == "__main__":
    main()
