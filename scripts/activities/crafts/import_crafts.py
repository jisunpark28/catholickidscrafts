"""Import ready-made craft PDFs (<name>-color.pdf + <name>-coloring.pdf) as Plus crafts.

  python scripts/activities/crafts/import_crafts.py <folder with the PDFs>

  -> assets/activities/<slug>/<slug>.pdf (B&W) and <slug>-color.pdf (private, Plus download route)
  -> public/images/activities/<slug>/preview-bw.webp, preview-color.webp
     (page 1 only, 600 x 776, the same preview size as the other activities; the cut-out
     template pages are never public)

The catalog entries live in src/lib/resource/activities.ts (CRAFT_UPLOADS).
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
SLUGS = [
    "advent-bank", "advent-lantern", "fiat-flag", "gabriel-wings", "joseph-lily", "birthday-card",
    "swaddle-baby", "gloria-trumpet", "shepherd-crook", "bethlehem-star", "magi-gifts",
]


def main() -> None:
    src = Path(sys.argv[1])
    if not shutil.which("pdftoppm"):
        sys.exit("needs pdftoppm (poppler)")
    for slug in SLUGS:
        out = ROOT / "assets" / "activities" / slug
        img = ROOT / "public" / "images" / "activities" / slug
        out.mkdir(parents=True, exist_ok=True)
        img.mkdir(parents=True, exist_ok=True)
        for variant, name, dest in (("bw", f"{slug}-coloring.pdf", f"{slug}.pdf"), ("color", f"{slug}-color.pdf", f"{slug}-color.pdf")):
            pdf = src / name
            shutil.copyfile(pdf, out / dest)
            with tempfile.TemporaryDirectory() as tmp:
                base = Path(tmp) / "p1"
                subprocess.run(["pdftoppm", "-png", "-r", "110", "-f", "1", "-l", "1", "-singlefile", str(pdf), str(base)], check=True)
                im = Image.open(f"{base}.png").convert("RGB").resize((600, 776), Image.LANCZOS)
                im.save(img / f"preview-{variant}.webp", "WEBP", quality=82, method=6)
        print(slug, "ok")


if __name__ == "__main__":
    main()
