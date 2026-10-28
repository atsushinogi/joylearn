"""Trace Pokemon WebP images into small, standalone SVG illustrations.

Requires Pillow, NumPy and OpenCV (cv2). Each SVG is kept no larger than its
source WebP; the WebP files are left untouched.
"""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ROOT = Path(__file__).parent
SOURCE_DIR = ROOT / "pokemon_images"
OUTPUT_DIR = ROOT / "pokemon_svg"
# Prefer simpler shapes, then reduce detail further for unusually small files.
SETTINGS = (
    (140, 16, 2.0),
    (120, 12, 2.0),
    (120, 10, 2.2),
    (100, 10, 2.2),
    (80, 8, 2.4),
    (64, 6, 2.6),
    (48, 4, 3.0),
)


def contours_to_path(mask, tolerance, minimum_area=1):
    contours, _ = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    commands = []
    for contour in contours:
        if cv2.contourArea(contour) < minimum_area:
            continue
        points = cv2.approxPolyDP(contour, tolerance, True)[:, 0, :]
        if len(points) >= 3:
            commands.append("M" + " ".join(f"{x},{y}" for x, y in points) + "Z")
    return "".join(commands)


def pastel(r, g, b):
    return tuple(round(value * 0.70 + 255 * 0.30) for value in (r, g, b))


def trace(source, side, colors, tolerance):
    with Image.open(source) as image:
        image = image.convert("RGBA")
        image.thumbnail((side, side), Image.Resampling.LANCZOS)

    visible = np.asarray(image.getchannel("A")) >= 96
    rgb = np.asarray(image.convert("RGB"))
    pixels = rgb[visible]
    if not len(pixels):
        raise ValueError(f"Image has no visible pixels: {source}")

    palette_image = Image.fromarray(pixels.reshape((1, len(pixels), 3))).quantize(
        colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE
    )
    indexed = image.convert("RGB").quantize(
        palette=palette_image, dither=Image.Dither.NONE
    )
    indices = np.asarray(indexed)
    palette = indexed.getpalette()

    silhouette = contours_to_path(np.uint8(visible) * 255, 0.7, 0)
    counts = np.bincount(indices[visible].ravel(), minlength=256)
    base_index = int(np.argmax(counts))
    br, bg, bb = pastel(*palette[base_index * 3 : base_index * 3 + 3])
    paths = [
        f'<path fill="#{br:02x}{bg:02x}{bb:02x}" fill-rule="evenodd" d="{silhouette}"/>'
    ]

    # Light colors go first so dark outlines remain visible on top.
    order = sorted(
        np.unique(indices[visible]),
        key=lambda index: sum(palette[index * 3 : index * 3 + 3]),
        reverse=True,
    )
    for index in order:
        mask = np.uint8((indices == index) & visible) * 255
        path = contours_to_path(mask, tolerance)
        if path:
            r, g, b = pastel(*palette[index * 3 : index * 3 + 3])
            color = f"#{r:02x}{g:02x}{b:02x}"
            paths.append(f'<path color="{color}" d="{path}"/>')

    width, height = image.size
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">'
        f'<defs><clipPath id="c"><path fill-rule="evenodd" d="{silhouette}"/>'
        f'</clipPath><filter id="s"><feGaussianBlur stdDeviation=".45"/>'
        f'</filter></defs><g filter="url(#s)"><g clip-path="url(#c)">'
        + paths[0]
        + '<g fill="currentColor" stroke="currentColor" stroke-width="1.4" '
          'stroke-linejoin="round" stroke-linecap="round" fill-rule="evenodd">'
        + "".join(paths[1:])
        + "</g></g></g></svg>"
    ).encode("utf-8")


def convert(source):
    target = OUTPUT_DIR / f"{source.stem}.svg"
    previous = target.read_bytes() if target.exists() else None
    previous_size = len(previous) if previous is not None else None
    budget = min(source.stat().st_size, previous_size - 1) if previous_size else source.stat().st_size
    for side, colors, tolerance in SETTINGS:
        svg = trace(source, side, colors, tolerance)
        if previous == svg:
            return previous_size, previous_size, side
        if len(svg) <= budget:
            temporary = target.with_suffix(".svg.tmp")
            temporary.write_bytes(svg)
            temporary.replace(target)
            return previous_size or source.stat().st_size, len(svg), side
    raise ValueError(f"Could not make SVG smaller: {source}")


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    sources = sorted(SOURCE_DIR.glob("*.webp"))
    with ThreadPoolExecutor(max_workers=8) as pool:
        sizes = list(pool.map(convert, sources))
    print(
        f"Converted {len(sizes)} images: "
        f"{sum(old for old, _, _ in sizes):,} previous bytes -> "
        f"{sum(new for _, new, _ in sizes):,} SVG bytes"
    )


if __name__ == "__main__":
    main()
