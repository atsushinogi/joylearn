"""Colab: compare three icon formats and display their generation prompts."""

import base64
import html
import json
from pathlib import Path

import ipywidgets as widgets
from IPython.display import HTML, display
from PIL import Image


ROOT = Path(__file__).resolve().parent
ROWS = {
    row["id"]: row
    for line in (ROOT / "icon-prompts-sdxl.jsonl").read_text(encoding="utf-8").splitlines()
    if line.strip()
    for row in [json.loads(line)]
}
VERSIONS = [
    ("1024×1024 PNG", "images-sdxl", ".png", "image/png"),
    ("148×148 PNG", "images-sdxl-148", ".png", "image/png"),
    ("148×148 WebP", "images-sdxl-148-webp", ".webp", "image/webp"),
]
AUDIT_PATH = ROOT / "sdxl-review-v2" / "audit.json"
AUDIT = (
    {row["id"]: row for row in json.loads(AUDIT_PATH.read_text(encoding="utf-8"))}
    if AUDIT_PATH.exists()
    else {}
)


def escaped(value):
    return html.escape(str(value))


def prompt_box(title, value):
    return (
        f'<div style="margin-top:12px"><b>{escaped(title)}</b>'
        '<pre style="white-space:pre-wrap;overflow-wrap:anywhere;'
        'padding:12px;background:#f3f4f6;color:#111827;border-radius:8px;'
        f'user-select:text">{escaped(value)}</pre></div>'
    )


def compare(image_id, display_size):
    row = ROWS.get(image_id, {})
    generation = {}
    cards = []
    for title, folder, extension, mime in VERSIONS:
        path = ROOT / folder / (image_id + extension)
        if not path.exists():
            cards.append(f'<div>{escaped(title)}：ファイルがありません</div>')
            continue
        data = path.read_bytes()
        with Image.open(path) as source:
            width, height = source.size
            if folder == "images-sdxl":
                generation = dict(source.info)
        encoded = base64.b64encode(data).decode("ascii")
        cards.append(
            '<div style="flex:0 0 auto;text-align:center">'
            f'<b>{escaped(title)}</b><br>'
            f'<img src="data:{mime};base64,{encoded}" '
            f'width="{display_size}" height="{display_size}" '
            'style="display:block;margin:8px auto;max-width:none;'
            'border:1px solid #ddd;border-radius:8px">'
            f'{width}×{height} px ／ {len(data) / 1024:.1f} KiB</div>'
        )

    content = (
        f'<h3>{escaped(image_id)}：{escaped(row.get("option_label", ""))}</h3>'
        f'<p><b>問題：</b>{escaped(row.get("question", ""))}</p>'
        '<div style="display:flex;gap:20px;overflow-x:auto;padding-bottom:12px">'
        + "".join(cards)
        + "</div>"
        + prompt_box("生成に使用したプロンプト（英語）", generation.get("prompt", row.get("prompt_en", "")))
        + prompt_box("回避事項（生成プロンプト本文に含む）" if row.get("generation_backend") == "imagegen" else "ネガティブプロンプト", generation.get("negative_prompt", row.get("negative_prompt", "")))
        + f'<p><b>生成方法：</b>{escaped(row.get("generation_backend", "SDXL"))}　'
        + f'<b>Seed：</b>{escaped("指定なし" if row.get("seed") is None else generation.get("seed", row.get("seed", "")))}</p>'
        + '<details><summary>日本語のプロンプトを表示</summary>'
        + prompt_box("日本語の設計プロンプト", row.get("prompt", ""))
        + "</details>"
    )
    audit = AUDIT.get(image_id)
    if audit:
        content += '<hr><p><b>個別の確認結果</b></p>'
        content += prompt_box("初回に確認した内容", audit.get("initial_observation", ""))
        content += prompt_box("現在の確認状況", audit.get("final_observation", "修正・再確認中"))
        if audit.get("remaining_issues"):
            content += prompt_box("残る不一致・確認できない点", audit["remaining_issues"])
    if generation.get("prompt") and generation["prompt"] != row.get("prompt_en"):
        content += '<p style="color:#a33">画像内の生成記録とJSONLのプロンプトが異なります。上には画像内の実際の記録を表示しています。</p>'
    if generation.get("postprocess_description"):
        content += prompt_box("生成後の加工", generation["postprocess_description"])
    for previous in row.get("generation_history", []):
        content += '<details><summary>編集前の画像と元の生成プロンプト</summary>'
        reference = previous.get("reference_archive")
        if reference and Path(reference).exists():
            encoded = base64.b64encode(Path(reference).read_bytes()).decode("ascii")
            content += f'<img src="data:image/png;base64,{encoded}" width="148" height="148">'
        content += prompt_box("編集前の生成プロンプト", previous.get("prompt_en", ""))
        content += '</details>'
    display(HTML(content))


image_ids = sorted(path.stem for path in (ROOT / "images-sdxl-148").glob("q*.png"))
if not image_ids:
    raise FileNotFoundError(f"比較する画像がありません：{ROOT / 'images-sdxl-148'}")

widgets.interact(
    compare,
    image_id=widgets.Dropdown(
        options=[
            (f'{image_id} ｜ {ROWS.get(image_id, {}).get("option_label", "")}', image_id)
            for image_id in image_ids
        ],
        description="画像：",
        layout=widgets.Layout(width="480px", max_width="100%"),
    ),
    display_size=widgets.SelectionSlider(
        options=[148, 296, 512],
        value=148,
        description="表示サイズ：",
        continuous_update=False,
        style={"description_width": "initial"},
    ),
);
