"""Recreate the earlier pale, non-chibi SVG look at about 6.9 MB total."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from vectorize_images import trace


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "pokemon_images"
DESTINATION = ROOT / "pokemon_svg_69"
SETTINGS = (
    (140, 16, 1.594),
    (140, 16, 1.65),
    (140, 16, 1.8),
    (140, 16, 2.0),
    (120, 12, 2.0),
    (100, 10, 2.2),
)


def convert(source: Path) -> tuple[int, bool]:
    for setting in SETTINGS:
        image = trace(source, *setting)
        if len(image) < source.stat().st_size:
            (DESTINATION / f"{source.stem}.svg").write_bytes(image)
            return len(image), setting != SETTINGS[0]
    raise ValueError(f"Could not keep SVG below WebP size: {source.name}")


def main() -> None:
    sources = sorted(SOURCE.glob("*.webp"))
    if len(sources) != 1299:
        raise ValueError(f"Expected 1299 WebP files, found {len(sources)}")
    DESTINATION.mkdir(exist_ok=True)
    with ThreadPoolExecutor(max_workers=8) as pool:
        sizes = list(pool.map(convert, sources))
    total = sum(size for size, _ in sizes)
    print(f"Created {len(sizes)} SVGs: {total:,} bytes; "
          f"fallback for {sum(fallback for _, fallback in sizes)} images")


if __name__ == "__main__":
    main()
