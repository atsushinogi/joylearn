"""Export the reviewed landscape Jujutsu Kaisen illustrations without changing v1."""

import csv
import hashlib
import html
import json
import shutil
import zipfile
from pathlib import Path

from PIL import Image


BASE = Path(__file__).resolve().parents[1] / "jujutsu-kaisen"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build():
    book = read(BASE / "workbook.json")
    dialogue = read(BASE / "wide-dialogue.json")
    lines = {row["id"]: row["lines"] for row in dialogue["images"]}
    records = {row["id"]: row for row in read(BASE / "wide-generation.json")}
    for path in sorted((BASE / "originals").glob("q*-wide-v2.generation.json")):
        row = read(path)
        records[row["id"]] = row
    reviews = {row["id"]: row for row in read(BASE / "review/wide-image-check.json")["images"]}
    ids = [q["id"] for q in book["questions"]]
    assert len(ids) == 53 and set(ids) == set(lines) == set(records) == set(reviews)
    width, height = dialogue["export_size"]
    output = BASE / "exports/v2"
    for folder in ("originals", "png", "webp"):
        (output / folder).mkdir(parents=True, exist_ok=True)
    manifest = []
    for q in book["questions"]:
        qid = q["id"]
        record = records[qid]
        assert reviews[qid]["status"] == "reviewed", qid
        target_chars = "".join(q["answer"][slice(*t["answer_span"])] for t in q["targets"])
        assert not any(char in text for _, text in lines[qid] for char in target_chars), qid
        source = BASE / record["source_png"]
        assert reviews[qid]["source_sha256"] == sha(source), f"{qid}: visual review is stale"
        with Image.open(source) as original:
            assert original.width * height == original.height * width, (qid, original.size)
            scaled = original.convert("RGB").resize((width, height), Image.Resampling.LANCZOS)
        png = output / "png" / f"{qid}.png"
        webp = output / "webp" / f"{qid}.webp"
        scaled.save(png)
        scaled.save(webp, lossless=True, method=6)
        shutil.copyfile(source, output / "originals" / f"{qid}.png")
        with Image.open(png) as a, Image.open(webp) as b:
            assert a.size == b.size == (width, height)
            assert a.convert("RGB").tobytes() == b.convert("RGB").tobytes()
        manifest.append({"id": qid, "question": q["prompt"], "answer": q["answer"],
                         "png": f"png/{qid}.png", "webp": f"webp/{qid}.webp",
                         "original": f"originals/{qid}.png", "width": width, "height": height,
                         "dialogue": lines[qid], "png_sha256": sha(png), "webp_sha256": sha(webp),
                         "source_sha256": sha(source),
                         "prompt_sha256": hashlib.sha256(record["prompt"].encode()).hexdigest()})
        q["image"] = {"generation_backend": "imagegen", "prompt": record["prompt"],
                      "source_png": record["source_png"], "selected_version": 2}
        q["review"]["image"] = {"status": "reviewed", "observations": reviews[qid]["observations"],
                               "record": "review/wide-image-check.json"}
    book["presentation"] = {"export_directory": "exports/v2", "width": width, "height": height,
                            "dialogue_note": dialogue["note"], "dialogue": dialogue["images"]}
    adopted = [{**records[qid], "dialogue": lines[qid]} for qid in ids]
    prompts = [{"id": row["id"], "version": 2, "prompt": row["prompt"],
                "source_png": row["source_png"]} for row in adopted]
    write(output / "manifest.json", {"count": len(ids), "width": width, "height": height,
                                    "generation_backend": "builtin imagegen", "webp_encoding": "lossless",
                                    "dialogue_note": dialogue["note"], "images": manifest})
    write(output / "workbook.json", book)
    write(output / "image-prompts.json", prompts)
    write(output / "wide-dialogue.json", dialogue)
    for name in ("問題.md", "解答.md", "coverage.json"):
        shutil.copyfile(BASE / "exports/v1" / name, output / name)
    shutil.copytree(BASE / "research", output / "research", dirs_exist_ok=True)
    for path in (output / "research").glob("*.md"):
        text = path.read_text(encoding="utf-8").replace("(../exports/v1/index.html)", "(../../v1/index.html)")
        path.write_text("以下は旧版の問題・出典の記録です。現行の横長画像と創作セリフは[一覧](../index.html)を参照してください。\n\n" + text, encoding="utf-8")
    with (output / "問題と画像の対応.csv").open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow(["id", "問題", "解答", "読み", "PNG", "WebP", "創作セリフ"])
        for q in book["questions"]:
            qid = q["id"]
            writer.writerow([qid, q["prompt"], q["answer"], q["blank_reading"], f"png/{qid}.png",
                             f"webp/{qid}.webp", " ／ ".join(f"{s}「{t}」" for s, t in lines[qid])])
    esc = html.escape
    cards = []
    for row in manifest:
        alt = " ／ ".join(f"{s}「{t}」" for s, t in row["dialogue"])
        cards.append(f'<article id="{row["id"]}"><h2>{row["id"]}</h2>'
                     f'<a href="{row["webp"]}"><img src="{row["webp"]}" width="{width}" height="{height}" '
                     f'alt="{esc(alt, quote=True)}" loading="lazy"></a><p>{esc(row["question"])}</p>'
                     f'<details><summary>解答</summary>{esc(row["answer"])}</details>'
                     f'<p><a href="{row["png"]}" download>PNG</a> ／ '
                     f'<a href="{row["webp"]}" download>WebP</a></p></article>')
    page = ('<!doctype html><html lang="ja"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>呪術廻戦・横長イラストとセリフ53問</title><style>'
            'body{font-family:system-ui;line-height:1.8;margin:0;padding:24px;background:#f6f4ef;color:#25343c}'
            'main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:20px}'
            'article{min-width:0;padding:20px;background:white;border-radius:12px}'
            'img{display:block;width:100%;max-width:600px;height:auto;border-radius:8px}'
            'h1{font-size:24px}h2{font-size:16px}a{color:#655294}summary{cursor:pointer}'
            '</style></head><body><h1>呪術廻戦・漢字53問</h1>'
            '<p>横長のイラストに、吹き出しなしのボケ・ツッコミを添えました。'
            'セリフは学習用の創作で、原作の引用ではありません。</p>'
            '<p><a href="../../../index.html">手書きで解く</a> ／ <a href="images-png.zip">PNG一括</a> ／ '
            '<a href="images-webp.zip">WebP一括</a> ／ <a href="問題.md">問題</a> ／ '
            '<a href="解答.md">解答</a> ／ <a href="README.md">教材について</a></p><main>'
            + "".join(cards) + '</main></body></html>')
    (output / "index.html").write_text(page + "\n", encoding="utf-8")
    (output / "README.md").write_text(
        "# 呪術廻戦・横長イラスト版\n\n[一覧](index.html) ／ [手書きアプリ](../../../index.html)\n\n"
        "全53枚、600×400px（3:2）のPNG・可逆WebPです。吹き出しなしのセリフは学習用の創作で、原作の引用ではありません。"
        "各問題の対象漢字がセリフに出ないことを検査しています。問題・解答・53通りの読みは従来版を引き継ぎます。\n\n"
        "[PNG一括](images-png.zip) ／ [WebP一括](images-webp.zip) ／ [対応CSV](問題と画像の対応.csv)\n\n"
        "[台帳](workbook.json) ／ [生成入力](image-prompts.json) ／ [セリフ](wide-dialogue.json) ／ "
        "[画像対応表](manifest.json) ／ [検証結果](validation.json)\n\n"
        "原画は `originals/`、配布画像は `png/` と `webp/` にあります。"
        "作品の対象範囲と出典は[従来の調査記録](research/出典と出題配分.md)を参照してください。\n", encoding="utf-8")
    for extension in ("png", "webp"):
        with zipfile.ZipFile(output / f"images-{extension}.zip", "w", zipfile.ZIP_DEFLATED) as archive:
            for qid in ids:
                archive.write(output / extension / f"{qid}.{extension}", f"{extension}/{qid}.{extension}")
        with zipfile.ZipFile(output / f"images-{extension}.zip") as archive:
            assert archive.testzip() is None
            assert len(archive.namelist()) == len(ids)
            for name in archive.namelist():
                assert archive.read(name) == (output / name).read_bytes()
    write(output / "validation.json", {"ok": True, "count": len(ids), "dimensions": [width, height],
                                       "checks": ["53 image/question/dialogue associations", "3:2 originals",
                                                  "PNG/WebP decoded pixel equality", "dialogue excludes target kanji",
                                                  "ZIP contents and bytes", "individual visual reviews"],
                                       "visual_review": "../../review/wide-image-check.json"})
    write(BASE / "workbook.json", book)
    write(BASE / "image-prompts.json", prompts)
    write(BASE / "wide-image-prompts.json", adopted)
    write(BASE / "wide-generation.json", adopted)
    history = read(BASE / "generation-history.json")
    history["entries"] = [row for row in history["entries"] if row.get("revision") != "wide-dialogue-v2"]
    for row in history["entries"]:
        row["adopted"] = False
    history["entries"].extend({**row, "question_id": row["id"], "local_png": row["source_png"],
                               "revision": "wide-dialogue-v2", "adopted": True} for row in adopted)
    write(BASE / "generation-history.json", history)
    print(f"Exported and verified {len(ids)} landscape illustrations: {output}")


if __name__ == "__main__":
    build()
