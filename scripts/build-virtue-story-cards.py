"""Composite Courage story paintings onto the painted picture-card spec.

Run: python3 scripts/build-virtue-story-cards.py

Canvas 1080x1350, page #fef9f6, VIRTUE & LIFE pill, Fredoka semibold titles
and captions, illustration well from y190, footer near y1320.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "assets" / "virtue-story-art"
OUT = ROOT / "assets" / "card-originals"
THUMBS = ROOT / "public" / "cards" / "thumbs"
LOCKED = ROOT / "public" / "cards" / "locked"
FONT = Path("/tmp/ckc-fonts")
PAGE = (254, 249, 246)  # #fef9f6
PILL = (213, 84, 7)  # VIR-001 pill fill
TITLE = (64, 58, 53)  # mode of the painted title ink
CAPTION = (51, 45, 41)  # median ink of the painted captions
FOOT = (168, 162, 155)  # #a8a29b
FRAME = (226, 220, 206)  # #e2dcce, the painted stroke
W, H = 1080, 1350
# Painted frame from BIB-031: left edge stable from y76, which is y190 at 1080.
WELL = (88, 190, 990, 1198)
RADIUS = 55
# VIR-001 "VIRTUE & LIFE" pill, scaled from the 432 thumb.
PILL_BOX = (435, 48, 645, 90)

CARDS = [
    {
        "id": "VIR-078",
        "art": "withered-hand.jpg",
        "title": "Stretch Out Your Hand",
        "caption": '"Stretch out your hand."',
    },
    {
        "id": "VIR-079",
        "art": "children-come.jpg",
        "title": "Let the Children Come",
        "caption": '"Let the children come to me."',
    },
    {
        "id": "VIR-080",
        "art": "sparrows.jpg",
        "title": "Worth More than Sparrows",
        "caption_lines": [
            "So do not be afraid; you are",
            "worth more than many sparrows.",
        ],
    },
    {
        "id": "VIR-081",
        "art": "daniel-lions.jpg",
        "title": "Daniel in the Lions' Den",
        "caption_size": 36,
        "caption_lines": [
            "My God sent his angel and closed",
            "the lions' mouths so that they have not hurt me.",
        ],
    },
]


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT / name), size)


def fredoka(weight: int) -> Path:
    """A static instance of the site Fredoka variable font."""
    dest = FONT / f"Fredoka-{weight}.ttf"
    if dest.exists():
        return dest
    FONT.mkdir(parents=True, exist_ok=True)
    from fontTools.ttLib import TTFont
    from fontTools.varLib.instancer import instantiateVariableFont

    variable = TTFont(ROOT / "src/assets/fonts/fredoka-variable.ttf")
    instantiateVariableFont(variable, {"wght": weight}, inplace=True)
    variable.save(dest)
    return dest


def text_size(draw: ImageDraw.ImageDraw, text: str, face: ImageFont.FreeTypeFont) -> tuple[int, int, tuple[int, int, int, int]]:
    box = draw.textbbox((0, 0), text, font=face)
    return box[2] - box[0], box[3] - box[1], box


def fit_width(draw, text: str, file: str, max_w: int, size: int, min_size: int):
    while size > min_size:
        face = font(file, size)
        width, _, _ = text_size(draw, text, face)
        if width <= max_w:
            return face
        size -= 1
    return font(file, min_size)


def wrap(draw, text: str, face, max_w: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for word in words:
        trial = word if not cur else f"{cur} {word}"
        width, _, _ = text_size(draw, trial, face)
        if width <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def cover(src: Image.Image, w: int, h: int) -> Image.Image:
    src = src.convert("RGB")
    scale = max(w / src.width, h / src.height)
    nw, nh = round(src.width * scale), round(src.height * scale)
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return resized.crop((left, top, left + w, top + h))


def rounded_mask(w: int, h: int, radius: int) -> Image.Image:
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=255)
    return mask


def build(card: dict) -> Image.Image:
    image = Image.new("RGB", (W, H), PAGE)
    draw = ImageDraw.Draw(image)
    left, top, right, bottom = WELL
    ww, hh = right - left, bottom - top
    painting = cover(Image.open(ART / card["art"]), ww, hh)
    mask = rounded_mask(ww, hh, RADIUS)
    image.paste(painting, (left, top), mask)
    draw.rounded_rectangle(WELL, radius=RADIUS, outline=FRAME, width=4)
    draw.rounded_rectangle(PILL_BOX, radius=21, fill=PILL)
    pill_font = font("Nunito-ExtraBold.ttf", 26)
    label = "VIRTUE & LIFE"
    pw, ph, pbox = text_size(draw, label, pill_font)
    px = (PILL_BOX[0] + PILL_BOX[2] - pw) / 2 - pbox[0]
    py = (PILL_BOX[1] + PILL_BOX[3] - ph) / 2 - pbox[1]
    draw.text((px, py), label, font=pill_font, fill=(255, 255, 255))

    # Fredoka semibold (wght 600), the painted title's stroke. Ink top y123, side margin at least 150px.
    # Size 66 matches "Jesus Blesses the Children" (ink about 49px, stem about 10px).
    title_size = 66
    title_path = str(fredoka(600))
    while True:
        title_face = ImageFont.truetype(title_path, title_size)
        tw, _, tbox = text_size(draw, card["title"], title_face)
        if tw <= 780 or title_size <= 40:
            break
        title_size -= 2
    draw.text(((W - tw) / 2 - tbox[0], 123 - tbox[1]), card["title"], font=title_face, fill=TITLE)

    # Fredoka medium (wght 500) at 42px: painted caption stem is 5px at ink height 30.
    # A longer sentence may set caption_size so both lines keep about 150px of side margin.
    cap_face = ImageFont.truetype(str(fredoka(500)), card.get("caption_size", 42))
    lines = card["caption_lines"] if "caption_lines" in card else [card["caption"]]
    y = 1238 if len(lines) == 1 else 1210
    for line in lines:
        lw, lh, box = text_size(draw, line, cap_face)
        draw.text(((W - lw) / 2 - box[0], y - box[1]), line, font=cap_face, fill=CAPTION)
        y += lh + 8

    foot = font("Nunito-Regular.ttf", 20)
    _, _, id_box = text_size(draw, card["id"], foot)
    draw.text((62 - id_box[0], 1320 - id_box[1]), card["id"], font=foot, fill=FOOT)
    site = "catholickidscrafts.com"
    sw, _, sbox = text_size(draw, site, foot)
    draw.text((1018 - sw - sbox[0], 1320 - sbox[1]), site, font=foot, fill=FOOT)
    return image


def dist(a, b) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2])


def check(path: Path, card_id: str) -> None:
    im = Image.open(path).convert("RGB")
    assert im.size == (W, H), im.size
    px = im.load()
    assert dist(px[8, 8], PAGE) <= 3, px[8, 8]
    # Badge
    xs, ys = [], []
    for y in range(30, 120):
        for x in range(400, 680):
            r, g, b = px[x, y]
            if r > 180 and g < 140 and b < 80 and r - g > 40:
                xs.append(x)
                ys.append(y)
    assert xs, "missing pill"
    bw, bh = max(xs) - min(xs) + 1, max(ys) - min(ys) + 1
    assert 200 <= bw <= 220 and 40 <= bh <= 48, (bw, bh, min(ys), max(ys))
    assert 44 <= min(ys) <= 52, min(ys)
    # Title ink exists in the band.
    title = 0
    for y in range(118, 175):
        for x in range(80, 1000, 2):
            if sum(px[x, y]) < 220:
                title += 1
    assert title > 200, title
    # Scene fills the well: a pixel just inside the frame is not page cream.
    assert dist(px[WELL[0] + 24, (WELL[1] + WELL[3]) // 2], PAGE) > 12
    # Caption ink low on the card, footer under it.
    cap = [y for y in range(1210, 1320) if any(sum(px[x, y]) < 220 for x in range(120, 960, 3))]
    assert cap and 1180 <= min(cap) <= 1260, (min(cap) if cap else None, max(cap) if cap else None)
    foot_y = None
    for y in range(1290, 1345):
        if sum(px[70, y]) < 600:
            foot_y = y
            break
    assert foot_y and 1305 <= foot_y <= 1340, foot_y
    print(f"  {card_id}: pill {bw}x{bh} y{min(ys)}-{max(ys)} caption y{min(cap)}-{max(cap)} footer y{foot_y}")


def main() -> None:
    for folder in (OUT, THUMBS, LOCKED):
        folder.mkdir(parents=True, exist_ok=True)
    manifest_path = ROOT / "src" / "data" / "cards" / "designed-originals.json"
    manifest = json.loads(manifest_path.read_text())
    for card in CARDS:
        image = build(card)
        dest = OUT / f"{card['id']}.png"
        image.save(dest, "PNG")
        check(dest, card["id"])
        thumb = image.resize((432, 540), Image.Resampling.LANCZOS)
        thumb.save(THUMBS / f"{card['id']}.webp", "WEBP", quality=74)
        locked = thumb.resize((216, 270), Image.Resampling.LANCZOS).convert("L")
        locked = locked.filter(__import__("PIL.ImageFilter", fromlist=["GaussianBlur"]).GaussianBlur(radius=3))
        locked.save(LOCKED / f"{card['id']}.webp", "WEBP", quality=40)
        digest = hashlib.sha256(dest.read_bytes()).hexdigest()
        manifest[card["id"]] = {"sha256": digest}
        print(card["id"], digest[:12])
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print("wrote", len(CARDS), "virtue story cards")


if __name__ == "__main__":
    main()
