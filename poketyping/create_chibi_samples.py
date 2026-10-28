"""Make ten 256 px coloring-book SVGs from the existing vector Pokemon art."""

from __future__ import annotations

from pathlib import Path
from html import escape
import re
from xml.etree import ElementTree as ET

import cv2
import numpy as np


ROOT = Path(__file__).parent
SOURCE = ROOT / "pokemon_svg"
DESTINATION = ROOT / "chibi_samples"
SIDE = 256
INK = "#595553"
NAMES = {
    "0001_0": "フシギダネ",
    "0004_0": "ヒトカゲ",
    "0007_0": "ゼニガメ",
    "0025_0": "ピカチュウ",
    "0039_0": "プリン",
    "0052_0": "ニャース",
    "0133_0": "イーブイ",
    "0143_0": "カビゴン",
    "0150_0": "ミュウツー",
    "0151_0": "ミュウ",
}


def polygons(path_data: str) -> list[np.ndarray]:
    """Source paths use M, implicit L, and Z with absolute coordinates."""
    result = []
    for part in re.findall(r"M([^M]*?)Z", path_data):
        numbers = np.array(re.findall(r"-?\d+(?:\.\d+)?", part), dtype=np.float64)
        if len(numbers) >= 6:
            result.append(numbers.reshape(-1, 2))
    return result


def deform(points: np.ndarray) -> np.ndarray:
    """Give the head and upper body room while making the lower body compact."""
    x, y = points[:, 0], points[:, 1]
    new_y = np.where(y <= 80, y * 1.27, 101.6 + (y - 80) * (38.4 / 60))
    width = np.interp(y, [0, 55, 95, 140], [1.18, 1.28, 1.01, 0.76])
    new_x = 70 + (x - 70) * width
    return np.column_stack((new_x, new_y))


def path_from_polygons(source: list[np.ndarray], transform, tolerance: float = 0.8) -> str:
    parts = []
    for original in source:
        shape = transform(original).astype(np.float32)
        if len(shape) >= 4:
            shape = cv2.approxPolyDP(shape, tolerance, True).reshape(-1, 2)
        if len(shape) < 3:
            continue
        coordinates = " ".join(f"{round(x)},{round(y)}" for x, y in shape)
        parts.append(f"M{coordinates}Z")
    return "".join(parts)


def area(points: np.ndarray) -> float:
    return abs(cv2.contourArea(points.astype(np.float32)))


def make_svg(name: str, title: str, color_tolerance: float = 0.8,
             minimum_detail_area: float = 0) -> bytes:
    root = ET.parse(SOURCE / f"{name}.svg").getroot()
    paths = [node for node in root.iter() if node.tag.endswith("path")]
    silhouette = polygons(paths[0].attrib["d"])
    base = paths[1].attrib["fill"]
    boundary = np.concatenate([deform(shape) for shape in silhouette])
    minimum = boundary.min(axis=0)
    maximum = boundary.max(axis=0)
    span = maximum - minimum
    scale = min(226 / span[0], 226 / span[1])
    offset = (np.array([SIDE, SIDE]) - span * scale) / 2

    def transform(points):
        return (deform(points) - minimum) * scale + offset

    outer = path_from_polygons(silhouette, transform, 1.0)

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{SIDE}" height="{SIDE}" '
        f'viewBox="0 0 {SIDE} {SIDE}"><title>{escape(title)}</title>',
        f'<defs><path id="shape" d="{outer}" fill-rule="evenodd"/>'
        '<clipPath id="cut"><use href="#shape"/></clipPath></defs>',
        f'<use href="#shape" fill="{base}"/>',
        '<g clip-path="url(#cut)" fill-rule="evenodd">',
    ]
    detail_outlines = []
    base_rgb = np.array([int(base[i:i+2], 16) for i in (1, 3, 5)])
    for node in paths[2:]:
        color = node.attrib.get("color")
        if not color:
            continue
        regions = [region for region in polygons(node.attrib["d"])
                   if area(region) >= minimum_detail_area]
        shape = path_from_polygons(regions, transform, color_tolerance)
        if not shape:
            continue
        parts.append(f'<path d="{shape}" fill="{color}"/>')
        # Trace only broad color regions; tracing every highlight clutters the face.
        contrast = np.linalg.norm(np.array([int(color[i:i+2], 16) for i in (1, 3, 5)]) - base_rgb)
        substantial = [region for region in regions if area(region) >= 180]
        if substantial and contrast > 28:
            candidate = max(substantial, key=area)
            detail_outlines.append((area(candidate) * contrast,
                                    path_from_polygons([candidate], transform, 1.8)))
    parts.append('</g>')
    if detail_outlines:
        parts.append('<g clip-path="url(#cut)" fill="none" stroke="' + INK + '" '
                     'stroke-opacity=".4" stroke-width="1.5" '
                     'stroke-linecap="round" stroke-linejoin="round">')
        parts.extend(f'<path d="{outline}"/>' for _, outline in
                     sorted(detail_outlines, reverse=True)[:4])
        parts.append('</g>')
    parts.append(f'<use href="#shape" '
                 f'fill="none" stroke="{INK}" stroke-width="3.2" '
                 'stroke-linecap="round" stroke-linejoin="round"/>')
    parts.append('</svg>')
    return ''.join(parts).encode('utf-8')


def main() -> None:
    DESTINATION.mkdir(exist_ok=True)
    for name, title in NAMES.items():
        image = make_svg(name, title)
        (DESTINATION / f"{name}.svg").write_bytes(image)
        print(f"{title}: {len(image):,} bytes")


if __name__ == "__main__":
    main()
