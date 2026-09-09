#!/usr/bin/env python3
"""Normalize celebrant pose sprites to a consistent character frame."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SPRITE_DIR = ROOT / "public/games/tiny-priest/assets/mass/characters/celebrant"
CANVAS_W = 1024
CANVAS_H = 1536
TARGET_CHAR_HEIGHT = 1380
TARGET_FOOT_Y = 1498
TARGET_CENTER_X = CANVAS_W // 2
ALPHA_THRESHOLD = 12
PAD = 4


def alpha_bbox(img: Image.Image) -> tuple[int, int, int, int] | None:
    alpha = img.split()[3]
    return alpha.getbbox()


def normalize_image(img: Image.Image) -> Image.Image:
    bbox = alpha_bbox(img)
    if not bbox:
        return img

    min_x, min_y, max_x, max_y = bbox
    min_x = max(0, min_x - PAD)
    min_y = max(0, min_y - PAD)
    max_x = min(img.width - 1, max_x + PAD)
    max_y = min(img.height - 1, max_y + PAD)

    crop = img.crop((min_x, min_y, max_x + 1, max_y + 1))
    crop_w, crop_h = crop.size
    if crop_h <= 0 or crop_w <= 0:
        return img

    scale = TARGET_CHAR_HEIGHT / crop_h
    new_w = max(1, int(round(crop_w * scale)))
    new_h = max(1, int(round(crop_h * scale)))
    resized = crop.resize((new_w, new_h), Image.Resampling.LANCZOS)

    out = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    paste_x = TARGET_CENTER_X - new_w // 2
    paste_y = TARGET_FOOT_Y - new_h
    out.paste(resized, (paste_x, paste_y), resized)
    return out


def process_file(path: Path) -> None:
    img = Image.open(path).convert("RGBA")
    normalized = normalize_image(img)
    normalized.save(path)


def main() -> None:
    if not SPRITE_DIR.is_dir():
        raise SystemExit(f"Missing sprite dir: {SPRITE_DIR}")

    files = sorted(SPRITE_DIR.glob("*/*.png"))
    if not files:
        raise SystemExit(f"No celebrant PNGs under {SPRITE_DIR}")

    for path in files:
        process_file(path)
        print(f"Normalized {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
