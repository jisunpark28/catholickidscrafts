#!/usr/bin/env python3
"""Regenerate favicons from src/Logo.png (same asset as the header logo)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "src" / "Logo.png"


def square_icon(size: int) -> Image.Image:
    src = Image.open(LOGO).convert("RGBA")
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    src.thumbnail((size, size), Image.Resampling.LANCZOS)
    x = (size - src.width) // 2
    y = (size - src.height) // 2
    canvas.paste(src, (x, y), src)
    return canvas


def main() -> None:
    outputs = [
        (48, ROOT / "public" / "logo-icon.png"),
        (96, ROOT / "src" / "app" / "icon.png"),
        (96, ROOT / "public" / "icon.png"),
        (180, ROOT / "src" / "app" / "apple-icon.png"),
        (180, ROOT / "public" / "apple-icon.png"),
    ]
    for size, path in outputs:
        path.parent.mkdir(parents=True, exist_ok=True)
        square_icon(size).save(path, format="PNG", optimize=True)
        print(f"Wrote {path} ({size}x{size})")

    favicon_app = ROOT / "src" / "app" / "favicon.ico"
    master = square_icon(48)
    master.save(
        favicon_app,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    print(f"Wrote {favicon_app} (16/32/48)")


if __name__ == "__main__":
    main()
