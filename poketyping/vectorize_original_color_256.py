"""Trace every Pokemon WebP to a small 256x256 SVG without lightening its colors."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

from vectorize_images import contours_to_path


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "pokemon_images"
DESTINATION = ROOT / "pokemon_svg_color_256"
SETTINGS = (
    (140, 20, 1.0),
    (140, 16, 1.0),
    (140, 16, 1.2),
    (140, 16, 1.4),
    (140, 16, 2.0),
    (120, 12, 2.2),
    (100, 10, 2.4),
    (80, 8, 2.6),
)


def palette_color(palette: list[int], index: int) -> str:
    red, green, blue = palette[index * 3 : index * 3 + 3]
    return f"#{red:02x}{green:02x}{blue:02x}"


def trace(source: Path, side: int, colors: int, tolerance: float) -> bytes:
    with Image.open(source) as original:
        image = original.convert("RGBA")
        image.thumbnail((side, side), Image.Resampling.LANCZOS)

    visible = np.asarray(image.getchannel("A")) >= 96
    pixels = np.asarray(image.convert("RGB"))[visible]
    if not len(pixels):
        raise ValueError(f"Image has no visible pixels: {source.name}")
    palette_image = Image.fromarray(pixels.reshape((1, len(pixels), 3))).quantize(
        colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE
    )
    indexed = image.convert("RGB").quantize(
        palette=palette_image, dither=Image.Dither.NONE
    )
    indices = np.asarray(indexed)
    palette = indexed.getpalette()
    silhouette = contours_to_path(np.uint8(visible) * 255, 0.7, 0)
    if not silhouette:
        raise ValueError(f"Image has no traceable silhouette: {source.name}")

    counts = np.bincount(indices[visible].ravel(), minlength=256)
    base = palette_color(palette, int(np.argmax(counts)))
    order = sorted(
        np.unique(indices[visible]),
        key=lambda index: sum(palette[index * 3 : index * 3 + 3]),
        reverse=True,
    )
    details = []
    for index in order:
        mask = np.uint8((indices == index) & visible) * 255
        path = contours_to_path(mask, tolerance)
        if path:
            details.append(f'<path color="{palette_color(palette, int(index))}" d="{path}"/>')

    width, height = image.size
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" '
        f'viewBox="0 0 {width} {height}">'
        f'<defs><path id="shape" d="{silhouette}" fill-rule="evenodd"/>'
        '<clipPath id="cut"><use href="#shape"/></clipPath>'
        '<filter id="soft"><feGaussianBlur stdDeviation=".45"/></filter></defs>'
        '<g filter="url(#soft)"><g clip-path="url(#cut)">'
        f'<use href="#shape" fill="{base}"/>'
        '<g fill="currentColor" stroke="currentColor" stroke-width="1.4" '
        'stroke-linejoin="round" stroke-linecap="round" fill-rule="evenodd">'
        + "".join(details)
        + '</g></g></g></svg>'
    )
    return svg.encode("utf-8")


def convert(source: Path) -> tuple[int, bool]:
    budget = source.stat().st_size
    for setting in SETTINGS:
        svg = trace(source, *setting)
        if len(svg) < budget:
            (DESTINATION / f"{source.stem}.svg").write_bytes(svg)
            return len(svg), setting != SETTINGS[0]
    raise ValueError(f"Could not keep SVG below WebP size: {source.name}")


def main() -> None:
    sources = sorted(SOURCE.glob("*.webp"))
    if len(sources) != 1299:
        raise ValueError(f"Expected 1299 WebP files, found {len(sources)}")
    DESTINATION.mkdir(exist_ok=True)
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(convert, sources))
    print(f"Created {len(results)} 256x256 SVGs: "
          f"{sum(size for size, _ in results):,} bytes; "
          f"simplified further for {sum(fallback for _, fallback in results)} images")


if __name__ == "__main__":
    main()
