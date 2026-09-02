#!/usr/bin/env python3
"""Build sign-of-cross phase sprites (son, spirit, amen) from base poses."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
GREEN_DIR = ROOT / "public/games/tiny-priest/assets/mass/characters/celebrant/green"
FATHER = GREEN_DIR / "signCross.png"
PRAY = GREEN_DIR / "pray.png"
SON = GREEN_DIR / "signCross_son.png"
SPIRIT = GREEN_DIR / "signCross_spirit.png"
AMEN = GREEN_DIR / "signCross_amen.png"


def average_color(img: Image.Image, box: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    crop = img.crop(box)
    pixels = [p for p in crop.getdata() if p[3] > 20]
    if not pixels:
        return (0, 0, 0, 0)
    r = sum(p[0] for p in pixels) // len(pixels)
    g = sum(p[1] for p in pixels) // len(pixels)
    b = sum(p[2] for p in pixels) // len(pixels)
    a = sum(p[3] for p in pixels) // len(pixels)
    return r, g, b, a


def fill_region(img: Image.Image, box: tuple[int, int, int, int], sample: tuple[int, int, int, int]) -> None:
    color = average_color(img, sample)
    patch = Image.new("RGBA", (box[2] - box[0], box[3] - box[1]), color)
    patch = patch.filter(ImageFilter.GaussianBlur(radius=1))
    img.paste(patch, (box[0], box[1]), patch)


def extract_hand(father: Image.Image) -> Image.Image:
    w, h = father.size
    hand = father.crop((int(w * 0.54), int(h * 0.04), int(w * 0.77), int(h * 0.23)))
    # Keep only skin-tone / hand pixels (rough mask by brightness on RGB)
    px = hand.load()
    for y in range(hand.height):
        for x in range(hand.width):
            r, g, b, a = px[x, y]
            if a < 20:
                continue
            if r > 95 and g > 70 and b > 55 and r >= g >= b - 20:
                continue
            px[x, y] = (r, g, b, 0)
    return hand


def clear_forehead_hand(im: Image.Image) -> None:
    w, h = im.size
    fill_region(im, (int(w * 0.48), int(h * 0.02), int(w * 0.82), int(h * 0.27)), (int(w * 0.42), int(h * 0.30), int(w * 0.58), int(h * 0.42)))


def build_son(father: Image.Image) -> Image.Image:
    im = father.copy()
    w, h = im.size
    clear_forehead_hand(im)
    hand = extract_hand(father)
    hand = hand.resize((int(hand.width * 1.15), int(hand.height * 1.2)), Image.Resampling.LANCZOS)
    im.paste(hand, (int(w * 0.50), int(h * 0.30)), hand)
    return im


def build_spirit(father: Image.Image) -> Image.Image:
    im = father.copy()
    w, h = im.size
    clear_forehead_hand(im)
    hand = extract_hand(father)
    hand = hand.resize((int(hand.width * 1.05), int(hand.height * 1.05)), Image.Resampling.LANCZOS)
    hand = hand.transpose(Image.FLIP_LEFT_RIGHT)
    im.paste(hand, (int(w * 0.20), int(h * 0.22)), hand)
    return im


def build_amen() -> Image.Image:
    return Image.open(PRAY).convert("RGBA")


def main() -> None:
    father = Image.open(FATHER).convert("RGBA")
    build_son(father).save(SON)
    build_spirit(father).save(SPIRIT)
    build_amen().save(AMEN)
    print(f"Wrote {SON.name}, {SPIRIT.name}, {AMEN.name}")


if __name__ == "__main__":
    main()
