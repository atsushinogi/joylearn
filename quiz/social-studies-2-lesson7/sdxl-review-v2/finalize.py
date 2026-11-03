"""Publish explicitly reviewed candidates and rebuild all three formats.

Every audit entry must have a final observation, status and selection first.
Original files are kept under before/ before any replacement.
"""
import csv
import hashlib
import html
import json
import os
from pathlib import Path
import shutil
import zipfile

from PIL import Image, PngImagePlugin

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def atomic_text(path, content):
    temporary = path.with_suffix(path.suffix + ".part")
    temporary.write_text(content, encoding="utf-8")
    os.replace(temporary, path)


def main():
    audit = json.loads((HERE / "audit.json").read_text())
    jobs = [json.loads(s) for s in (HERE / "prompts-imagegen.jsonl").read_text().splitlines()]
    originals = {
        row["id"]: row for row in map(
            json.loads, (HERE / "before/icon-prompts-sdxl.jsonl").read_text().splitlines()
        )
    }
    expected = {row["id"] for row in jobs}
    assert len(audit) == len(jobs) == 200
    assert {row["id"] for row in audit} == expected
    for item in audit:
        assert item["final_status"] in {"aligned", "limited", "mismatch"}, item["id"]
        assert item.get("final_observation"), item["id"]
        assert item.get("selection") in {"original", "candidate"}, item["id"]
        if item["final_status"] == "mismatch":
            assert item.get("remaining_issues"), item["id"]
    by_id = {row["id"]: row for row in audit}
    baseline_hashes = json.loads((HERE / "before/sha256.json").read_text())
    # Check the complete selection before changing any published image.
    for candidate in jobs:
        item = by_id[candidate["id"]]
        row = candidate if item["selection"] == "candidate" else originals[candidate["id"]]
        folder = "imagegen-candidates" if row.get("generation_backend") == "imagegen" else "candidates"
        source = HERE / folder / row["filename"] if item["selection"] == "candidate" else ROOT / "images-sdxl" / row["filename"]
        with Image.open(source) as image:
            assert image.size == (1024, 1024), row["id"]
            assert image.info["prompt"] == row["prompt_en"], row["id"]
            assert image.info["negative_prompt"] == row["negative_prompt"], row["id"]
            if row.get("generation_backend", "sdxl") == "sdxl":
                assert int(image.info["seed"]) == row["seed"], row["id"]
            else:
                assert row["seed"] is None and image.info["seed"] == "unspecified", row["id"]
            image.verify()
    # Keep a complete original set, including images that do not need replacement.
    for relative, expected_hash in baseline_hashes.items():
        current, backup = ROOT / relative, HERE / "before" / relative
        backup.parent.mkdir(exist_ok=True)
        if not backup.exists():
            assert digest(current) == expected_hash, relative
            shutil.copy2(current, backup)
    print('Complete original set backed up: 600 files.', flush=True)
    final_jobs = []
    changed = []
    for candidate in jobs:
        item = by_id[candidate["id"]]
        row = candidate if item["selection"] == "candidate" else originals[candidate["id"]]
        candidate_folder = "imagegen-candidates" if row.get("generation_backend") == "imagegen" else "candidates"
        source = HERE / candidate_folder / row["filename"] if item["selection"] == "candidate" else ROOT / "images-sdxl" / row["filename"]
        with Image.open(source) as image:
            assert image.size == (1024, 1024)
            assert image.info["prompt"] == row["prompt_en"], row["id"]
            assert image.info["negative_prompt"] == row["negative_prompt"], row["id"]
            if row.get("generation_backend", "sdxl") == "sdxl":
                assert int(image.info["seed"]) == row["seed"], row["id"]
            else:
                assert row["seed"] is None and image.info["seed"] == "unspecified", row["id"]
            image.verify()
        if item["selection"] == "candidate":
            changed.append(row["id"])
            for folder, extension in [
                ("images-sdxl", ".png"),
                ("images-sdxl-148", ".png"),
                ("images-sdxl-148-webp", ".webp"),
            ]:
                current = ROOT / folder / (row["id"] + extension)
                backup = HERE / "before" / folder / current.name
                backup.parent.mkdir(exist_ok=True)
                if not backup.exists():
                    assert digest(current) == baseline_hashes[str(current.relative_to(ROOT))]
                    shutil.copy2(current, backup)
            destination = ROOT / "images-sdxl" / row["filename"]
            temporary = destination.with_suffix(".part.png")
            shutil.copy2(source, temporary)
            os.replace(temporary, destination)
            with Image.open(source) as image:
                thumb = image.convert("RGB").resize((148, 148), Image.Resampling.LANCZOS)
                metadata = PngImagePlugin.PngInfo()
                for key, value in image.info.items():
                    if isinstance(value, str):
                        metadata.add_text(key, value)
                metadata.add_text("resized_from", "images-sdxl/" + row["filename"])
                metadata.add_text("source_dimensions", "1024x1024")
                metadata.add_text("output_dimensions", "148x148")
                metadata.add_text("resampling", "LANCZOS")
                small_png = ROOT / "images-sdxl-148" / row["filename"]
                temporary = small_png.with_suffix(".part.png")
                thumb.save(temporary, format="PNG", pnginfo=metadata, optimize=True)
                os.replace(temporary, small_png)
                webp = ROOT / "images-sdxl-148-webp" / (row["id"] + ".webp")
                temporary = webp.with_suffix(".part.webp")
                thumb.save(temporary, format="WEBP", quality=85, method=6)
                os.replace(temporary, webp)
        final_jobs.append(row)
        if len(final_jobs) % 25 == 0:
            print(f'Published and resized {len(final_jobs)}/200 images.', flush=True)

    serialized = "".join(json.dumps(row, ensure_ascii=False) + "\n" for row in final_jobs)
    atomic_text(ROOT / "icon-prompts-sdxl.jsonl", serialized)
    original_fields = list(originals["q01_a"])
    jp_fields = [field for field in original_fields if field not in {"prompt_en", "negative_prompt", "seed"}]
    atomic_text(ROOT / "icon-prompts.jsonl", "".join(
        json.dumps({key: row[key] for key in jp_fields}, ensure_ascii=False) + "\n"
        for row in final_jobs
    ))
    with (ROOT / "icon-prompts.csv").open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=jp_fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(final_jobs)
    previous_md = (HERE / "before/icon-prompts.md").read_text()
    facts = previous_md.split("## 史実と見た目についての補足", 1)[1].split("## 全200件のプロンプト", 1)[0]
    introduction = (
        '# 歴史クイズ 第7回「安土・桃山時代」画像生成プロンプト\n\n'
        '50問×4選択肢＝200件。全画像1024×1024 PNG、縮小版148×148 PNGとWebPです。写真リアルを基本とし、内容に応じて漫画・教育イラストを使用します。\n\n'
        '以下は日本語の設計指示です。実際に生成へ渡した文章・生成方法は `icon-prompts-sdxl.jsonl` の `prompt_en`・`generation_backend` と各PNGのメタデータに保存しています。画像生成ツール用の長い入力をSDXLへそのまま送ることはできません。詳細は[生成記録](./SDXL-IMAGES.md)を参照してください。\n\n'
        '歴史人物、失われた建築、合戦は再現イメージです。人物の実写記録、実測に基づく完全な復元、既存美術作品の忠実な複製とは扱いません。官職や制度、似た年代の戦争は文字の選択肢ラベルと併用します。\n\n'
        '個別見直しの結果は[全200件の確認レポート](./sdxl-review-v2/report.md)に記録しています。細部の不一致が残る画像も明示しています。\n\n'
        '## 史実と見た目についての補足\n' + facts + '\n## 全200件のプロンプト\n'
    )
    parts = [introduction]
    for number in range(1, 51):
        group = final_jobs[(number - 1) * 4:number * 4]
        parts.append(f'\n### 第{number:02d}問\n\n**問題文：** {group[0]["question"]}\n')
        for row in group:
            parts.append(f'\n#### {row["option_letter"]}｜{row["option_label"]}\n\nファイル名：`{row["filename"]}` ／ 画風：{row["style"]} ／ サイズ：1024×1024\n\n```text\n{row["prompt"]}\n```\n')
    atomic_text(ROOT / "icon-prompts.md", "".join(parts))

    esc = html.escape
    table = ["# 全200枚の個別確認結果\n",
             "各画像を生成用英語プロンプト、日本語の作画指示、問題文と選択肢に照合した記録です。寸法やメタデータの機械検査と、内容の目視検査を分けています。**機械検査に合格しても、内容が完全に一致するとは限りません。**\n",
             "`aligned` は主要な作画要件を確認、`limited` は題材を確認したが史実の厳密な再現等は保証できない、`mismatch` は具体的な不一致が残ることを示します。細かな人体・器物の形状を含む全画素の正確さを保証する判定ではありません。\n",
             f"再生成候補を採用：{len(changed)}枚。元画像を採用：{200 - len(changed)}枚。修正前の画像は `before/` に保存しています。\n",
             "| ID | 選択肢 | 初回の確認 | 採用 | 最終確認 | 残る不一致・限界 |\n|---|---|---|---|---|---|\n"]
    page = ['<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>画像200枚 個別見直し</title><style>body{font-family:system-ui;max-width:1200px;margin:auto;padding:20px;line-height:1.7}.images{display:flex;gap:16px;overflow:auto}figure{margin:0;flex:0 0 180px}img{width:148px;height:148px;object-fit:contain}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f4f4f4;padding:12px}.mismatch{color:#a22}section{border-top:1px solid #bbb;padding:18px 0}</style><h1>全200枚の個別確認</h1><p>未達の項目を含めて記録しています。画像をクリックすると原寸で開きます。</p>']
    for row in final_jobs:
        item = by_id[row["id"]]
        values = [row["id"], row["option_label"], item["initial_observation"], item["selection"] + " / " + item["final_status"], item["final_observation"], item.get("remaining_issues", "")]
        table.append("| " + " | ".join(value.replace("|", "／").replace("\n", " ") for value in values) + " |\n")
        before = "before/images-sdxl-148/" + row["filename"]
        current = "../images-sdxl/" + row["filename"]
        page.append(f'<section id="{row["id"]}"><h2>{row["id"]}：{esc(row["option_label"])}</h2><p>{esc(row["question"])}</p><div class="images">')
        for caption, path in [("修正前（148px）", before), ("採用画像（クリックで1024px）", current)]:
            page.append(f'<figure><a href="{path}"><img src="{path}" loading="lazy"></a><figcaption>{caption}</figcaption></figure>')
        page.append(f'</div><p>初回：{esc(item["initial_observation"])}</p><p>最終：{esc(item["final_observation"])}</p><p class="{item["final_status"]}">{esc(item.get("remaining_issues", ""))}</p><details><summary>実際の生成プロンプト</summary><pre>{esc(row["prompt_en"])}</pre><pre>{esc(row["negative_prompt"])}</pre><p>Seed: {row["seed"]}</p></details></section>')
    page.append("</html>")
    atomic_text(HERE / "report.md", "\n".join(table))
    atomic_text(HERE / "report.html", "\n".join(page))
    columns = ["id", "initial_action", "initial_observation", "selection", "final_status", "final_observation", "remaining_issues"]
    with (HERE / "report.csv").open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(audit)
    for folder, extension, target in [
        ("images-sdxl-148", ".png", "history-lesson7-sdxl-200-148.zip"),
        ("images-sdxl-148-webp", ".webp", "history-lesson7-sdxl-200-148-webp.zip"),
    ]:
        old_archive = HERE / "before" / target
        if not old_archive.exists() and (ROOT / target).exists():
            os.replace(ROOT / target, old_archive)
        temporary = ROOT / (target + ".part")
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_STORED) as archive:
            for row in final_jobs:
                path = ROOT / folder / (row["id"] + extension)
                archive.write(path, str(path.relative_to(ROOT)))
        os.replace(temporary, ROOT / target)
    old_large_archive = HERE / "before/history-lesson7-sdxl-200.zip"
    if not old_large_archive.exists() and (ROOT / "history-lesson7-sdxl-200.zip").exists():
        os.replace(ROOT / "history-lesson7-sdxl-200.zip", old_large_archive)
    atomic_text(HERE / "published-ids.json", json.dumps(changed, indent=2) + "\n")
    print(f"Published {len(changed)} revised images; preserved all prior versions.")


if __name__ == "__main__":
    main()
