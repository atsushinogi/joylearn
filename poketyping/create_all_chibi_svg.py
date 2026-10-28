"""Create a 256x256 chibi SVG for every locally available Pokemon form."""

from __future__ import annotations

import csv
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from create_chibi_samples import ROOT, SOURCE, make_svg


DESTINATION = ROOT / "pokemon_chibi_svg"
ARCHIVE = ROOT / "pokemon_chibi_svg.zip"


def main() -> None:
    with (ROOT / "pokemon_list.csv").open(encoding="utf-8", newline="") as handle:
        entries = list(csv.DictReader(handle))
    source_names = {path.name for path in SOURCE.glob("*.svg")}
    listed_names = {entry["filename"] for entry in entries}
    if source_names != listed_names:
        missing = sorted(source_names - listed_names)
        unavailable = sorted(listed_names - source_names)
        raise ValueError(f"Source and list differ: unlisted={missing[:5]}, missing={unavailable[:5]}")

    DESTINATION.mkdir(exist_ok=True)

    def create_one(entry: dict[str, str]) -> int:
        filename = entry["filename"]
        name = entry["name"]
        if entry["sub_name"]:
            name += f"（{entry['sub_name']}）"
        stem = Path(filename).stem
        image = make_svg(stem, name)
        webp_size = (ROOT / "pokemon_images" / f"{stem}.webp").stat().st_size
        if len(image) >= webp_size:
            for minimum_area in (1, 3, 5, 8, 12, 20, 30):
                image = make_svg(stem, name, minimum_detail_area=minimum_area)
                if len(image) < webp_size:
                    break
            else:
                raise ValueError(f"Could not keep {filename} smaller than its WebP")
        (DESTINATION / filename).write_bytes(image)
        return len(image)

    total_bytes = 0
    with ThreadPoolExecutor(max_workers=8) as pool:
        for number, size in enumerate(pool.map(create_one, entries), 1):
            total_bytes += size
            if number % 100 == 0 or number == len(entries):
                print(f"Created {number}/{len(entries)} SVGs", flush=True)

    readme = (
        "# ポケモン全種・フォルムのデフォルメSVG\n\n"
        f"WebPから変換済みのSVG {len(entries):,}枚を基にした256×256pxのSVGです。"
        "頭と上半身を大きく、下半身を小さく変形し、元の色分けと塗り絵風の輪郭線を残しました。\n\n"
        f"SVGの合計容量: {total_bytes:,}バイト。"
        "対応表は `pokemon_list.csv` を参照してください。現在はゲームでは使用していません。\n\n"
        "再生成: `python poketyping/create_all_chibi_svg.py`\n"
    )
    (DESTINATION / "README.md").write_text(readme, encoding="utf-8")
    with ZipFile(ARCHIVE, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for entry in entries:
            archive.write(DESTINATION / entry["filename"], entry["filename"])
        archive.write(DESTINATION / "README.md", "README.md")
        archive.write(ROOT / "pokemon_list.csv", "pokemon_list.csv")
    print(f"SVG total: {total_bytes:,} bytes; ZIP: {ARCHIVE.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
