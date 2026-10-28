"""Resize local Pokemon PNGs to compact WebP files for the typing game."""

from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

from PIL import Image


IMAGE_DIR = Path(__file__).parent / "pokemon_images"
MAX_SIZE = (180, 180)


def convert(source):
    target = source.with_suffix(".webp")
    temporary = target.with_suffix(".webp.tmp")
    original_bytes = source.stat().st_size

    with Image.open(source) as image:
        image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
        image.save(temporary, format="WEBP", quality=85, method=4)

    with Image.open(temporary) as check:
        check.load()
        if check.size[0] > MAX_SIZE[0] or check.size[1] > MAX_SIZE[1]:
            raise ValueError(f"Unexpected size: {temporary}")

    optimized_bytes = temporary.stat().st_size
    temporary.replace(target)
    source.unlink()
    return original_bytes, optimized_bytes


def main():
    sources = sorted(IMAGE_DIR.glob("*.png"))
    with ThreadPoolExecutor(max_workers=8) as pool:
        sizes = list(pool.map(convert, sources))

    original_bytes = sum(old for old, _ in sizes)
    optimized_bytes = sum(new for _, new in sizes)

    print(f"Converted {len(sources)} images: {original_bytes:,} -> {optimized_bytes:,} bytes")


if __name__ == "__main__":
    main()
