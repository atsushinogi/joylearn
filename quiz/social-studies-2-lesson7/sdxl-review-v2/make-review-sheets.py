"""Create eight-image sheets from available candidates, with original fallback."""
import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

parser = argparse.ArgumentParser()
parser.add_argument("--start", type=int, default=1)
parser.add_argument("--end", type=int, default=200)
args = parser.parse_args()
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
jobs = [json.loads(s) for s in (HERE / "prompts-candidate.jsonl").read_text().splitlines()]
font = ImageFont.truetype("/tmp/NotoSerifCJKjp-Bold.otf", 20)
output = HERE / "sheets-candidate"
output.mkdir(exist_ok=True)
for start in range(args.start - 1, args.end, 8):
    sheet = Image.new("RGB", (1600, 880), "#f3f0e9")
    draw = ImageDraw.Draw(sheet)
    for i, job in enumerate(jobs[start:start + 8]):
        path = HERE / "imagegen-candidates" / job["filename"]
        external = path.exists()
        if not external:
            path = HERE / "candidates" / job["filename"]
        revised = path.exists()
        if not revised:
            path = ROOT / "images-sdxl" / job["filename"]
        x, y = i % 4 * 400 + 10, i // 4 * 440 + 5
        with Image.open(path) as source:
            sheet.paste(source.convert("RGB").resize((380, 380), Image.Resampling.LANCZOS), (x, y))
        draw.text((x, y + 385), job["id"] + " " + job["option_label"], font=font,
                  fill="#125b26" if revised else "#333")
        draw.text((x, y + 410), "画像生成ツール候補" if external else "SDXL候補" if revised else "元画像", font=font,
                  fill="#125b26" if revised else "#777")
    dest = output / f"{start + 1:03d}-{start + 8:03d}.jpg"
    sheet.save(dest, quality=95)
    print(dest.name)
