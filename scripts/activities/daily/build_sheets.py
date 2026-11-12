#!/usr/bin/env python3
"""Build the daily Advent activity sheets and the Advent candle craft (US Letter).

  pip install reportlab pillow && python scripts/activities/daily/build_sheets.py [slug ...]
  -> assets/activities/<slug>/<slug>.pdf and <slug>-color.pdf (private; served by the guarded download route)
  -> public/images/activities/<slug>/preview-bw.webp, preview-color.webp (600 x 776, preview only; needs pdftoppm)
  Then run export_models.py to refresh the Plus editor models.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))
from kit import ASSET_DIR, REPO, register_fonts  # noqa: E402
from sheets import SHEETS  # noqa: E402

PREVIEW_DIR = REPO / "public" / "images" / "activities"


def build(slug: str) -> None:
    out = ASSET_DIR / slug
    out.mkdir(parents=True, exist_ok=True)
    for colored in (False, True):
        path = out / f"{slug}{'-color' if colored else ''}.pdf"
        c = canvas.Canvas(str(path), pagesize=letter, pageCompression=1)
        c.setTitle(f"{slug.replace('-', ' ').title()} - catholickidscrafts.com")
        c.setAuthor("Catholic Kids Crafts")
        SHEETS[slug](c, colored)
        c.showPage()
        c.save()
        preview(path, slug, "color" if colored else "bw")
    print("built", slug)


def preview(pdf: Path, slug: str, variant: str) -> None:
    if not shutil.which("pdftoppm"):
        return
    from PIL import Image

    with tempfile.TemporaryDirectory() as tmp:
        base = Path(tmp) / "p"
        subprocess.run(["pdftoppm", "-png", "-r", "110", "-singlefile", str(pdf), str(base)], check=True)
        im = Image.open(f"{base}.png").convert("RGB").resize((600, 776), Image.LANCZOS)
        dest = PREVIEW_DIR / slug
        dest.mkdir(parents=True, exist_ok=True)
        im.save(dest / f"preview-{variant}.webp", "WEBP", quality=82, method=6)


if __name__ == "__main__":
    register_fonts()
    for s in sys.argv[1:] or list(SHEETS):
        build(s)
