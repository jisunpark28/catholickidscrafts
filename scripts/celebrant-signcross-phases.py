#!/usr/bin/env python3
"""Build sign-of-cross phase sprites (son, spirit) from the father base pose."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GREEN_DIR = ROOT / "public/games/tiny-priest/assets/mass/characters/celebrant/green"
FATHER = GREEN_DIR / "signCross.png"
SON = GREEN_DIR / "signCross_son.png"
SPIRIT = GREEN_DIR / "signCross_spirit.png"


def average_color(img: Image.Image, box: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    crop = img.crop(box)
    pixels = list(crop.getdata())
    if not pixels:
        return (0, 0, 0, 0)
    r = sum(p[0] for p in pixels) // len(pixels)
    g = sum(p[1] for p in pixels) // len(pixels)
    b = sum(p[2] for p in pixels) // len(pixels)
    a = sum(p[3] for p in pixels) // len(pixels)
    return r, g, b, a


def erase_box(img: Image.Image, box: tuple[int, int, int, int]) -> None:
    fill = average_color(img, (box[0] + 8, box[1] + 40, box[2] - 8, box[3] + 80))
    patch = Image.new("RGBA", (box[2] - box[0], box[3] - box[1]), fill)
    img.paste(patch, (box[0], box[1]), patch)


def build_son(father: Image.Image) -> Image.Image:
    im = father.copy()
    w, h = im.size
    hand = father.crop((int(w * 0.52), int(h * 0.03), int(w * 0.78), int(h * 0.24)))
    hand = hand.resize((int(hand.width * 1.08), int(hand.height * 1.25)), Image.Resampling.LANCZOS)
    erase_box(im, (int(w * 0.5), int(h * 0.02), int(w * 0.8), int(h * 0.26)))
    im.paste(hand, (int(w * 0.5), int(h * 0.24)), hand)
    return im


def build_spirit(father: Image.Image) -> Image.Image:
    im = father.copy()
    w, h = im.size
    hand = father.crop((int(w * 0.52), int(h * 0.03), int(w * 0.78), int(h * 0.24)))
    hand = hand.resize((int(hand.width * 0.95), int(hand.height * 1.05)), Image.Resampling.LANCZOS)
    hand = hand.transpose(Image.FLIP_LEFT_RIGHT)
    erase_box(im, (int(w * 0.5), int(h * 0.02), int(w * 0.8), int(h * 0.26)))
    im.paste(hand, (int(w * 0.18), int(h * 0.2)), hand)
    return im


def main() -> None:
    father = Image.open(FATHER).convert("RGBA")
    build_son(father).save(SON)
    build_spirit(father).save(SPIRIT)
    print(f"Wrote {SON.name} and {SPIRIT.name}")


if __name__ == "__main__":
    main()
