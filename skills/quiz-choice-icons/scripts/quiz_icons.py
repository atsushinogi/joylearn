#!/usr/bin/env python3
"""Extract quiz data, prepare visual review, verify evidence, export icon assets.

Python + Pillow only. JavaScript input must contain a literal QUIZ_DATA array;
it is parsed as data and never executed. See references/workflow.md.
"""
import argparse
import base64
import hashlib
import html
import io
import json
from pathlib import Path
import re
import shutil
import tempfile
from datetime import datetime, timezone
import uuid
import zipfile

from PIL import Image, ImageDraw, ImageFont, ImageStat, PngImagePlugin


def need(condition, message):
    if not condition:
        raise ValueError(message)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def spec_hash(row):
    return hashlib.sha256(json.dumps(row, ensure_ascii=False, sort_keys=True,
                                     separators=(",", ":")).encode()).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


class Literal:
    """Small, non-executing parser for quiz array/object literals, not general JS."""
    def __init__(self, text):
        self.text, self.pos = text, 0

    def skip(self):
        while self.pos < len(self.text):
            match = re.match(r"\s+|//[^\n]*(?:\n|$)|/\*[\s\S]*?\*/", self.text[self.pos:])
            if not match:
                return
            self.pos += len(match.group())

    def take(self, char):
        self.skip()
        if self.text[self.pos:self.pos + 1] == char:
            self.pos += 1
            return True
        return False

    def string(self):
        quote = self.text[self.pos]
        self.pos += 1
        out = []
        escapes = {"n": "\n", "r": "\r", "t": "\t", "b": "\b", "f": "\f",
                   "v": "\v", "\\": "\\", "/": "/", "'": "'", '"': '"'}
        while self.pos < len(self.text):
            char = self.text[self.pos]
            self.pos += 1
            if char == quote:
                return "".join(out).encode("utf-16", "surrogatepass").decode("utf-16")
            if char == "\\":
                need(self.pos < len(self.text), "Unfinished string escape")
                char = self.text[self.pos]
                self.pos += 1
                if char in {"u", "x"}:
                    length = 4 if char == "u" else 2
                    digits = self.text[self.pos:self.pos + length]
                    need(len(digits) == length and re.fullmatch(r"[0-9a-fA-F]+", digits), "Invalid string escape")
                    out.append(chr(int(digits, 16)))
                    self.pos += length
                else:
                    need(char in escapes, "Unsupported string escape; export plain JSON")
                    out.append(escapes[char])
            else:
                need(char not in "\r\n", "Unescaped newline in string")
                out.append(char)
        raise ValueError("Unclosed string")

    def value(self):
        self.skip()
        char = self.text[self.pos:self.pos + 1]
        need(bool(char), "Unexpected end of quiz literal")
        if char in "\"'":
            return self.string()
        if char in "[{":
            self.pos += 1
            close, result = ("]", []) if char == "[" else ("}", {})
            while not self.take(close):
                if char == "[":
                    result.append(self.value())
                else:
                    self.skip()
                    if self.text[self.pos:self.pos + 1] in "\"'" and self.pos < len(self.text):
                        key = self.string()
                    else:
                        match = re.match(r"[A-Za-z_$][A-Za-z0-9_$]*", self.text[self.pos:])
                        need(match, "Expected object key; export a plain data array")
                        key = match.group()
                        self.pos += len(key)
                    need(key not in result, f"Duplicate object key: {key}")
                    need(self.take(":"), "Expected ':' after object key")
                    result[key] = self.value()
                if self.take(close):
                    break
                need(self.take(","), "Expected comma; executable JavaScript is unsupported")
            return result
        match = re.match(r"(?:true|false|null)\b|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?", self.text[self.pos:])
        need(match, "Only data literals are supported; functions/templates/expressions are not executed")
        self.pos += len(match.group())
        return json.loads(match.group())


def quiz_data(path):
    text = path.read_text(encoding="utf-8-sig")
    if path.suffix.lower() == ".js":
        match = re.search(r"^\s*(?:const|let|var)\s+QUIZ_DATA\s*=\s*", text, re.M)
        need(match, "Expected a literal 'const QUIZ_DATA = [...]' declaration")
        parser = Literal(text[match.end():])
        value = parser.value()
        parser.skip()
        need(parser.pos == len(parser.text) or parser.text[parser.pos] == ";",
             "QUIZ_DATA must be a plain literal, without expressions")
    else:
        value = json.loads(text)
    if isinstance(value, dict):
        value = value.get("questions")
    need(isinstance(value, list), "Quiz input must be a question array")
    return value


def expected_rows(questions, q_count, c_count):
    need(len(questions) == q_count, f"Expected {q_count} questions, got {len(questions)}")
    need(1 <= c_count <= 26, "Choices must be between 1 and 26")
    rows = []
    for qn, question in enumerate(questions, 1):
        need(isinstance(question, dict), f"Question {qn}: expected an object")
        text = question.get("q", question.get("question"))
        need(isinstance(text, str) and text.strip(), f"Question {qn}: missing text")
        options = question.get("options")
        need(isinstance(options, list) and len(options) == c_count, f"Question {qn}: expected {c_count} choices")
        for index, option in enumerate(options):
            need(isinstance(option, (str, dict)), f"Question {qn}, option {index}: expected text or an object")
            label = option if isinstance(option, str) else option.get("label")
            need(isinstance(label, str) and label.strip(), f"Question {qn}, option {index}: missing label")
            letter = chr(97 + index)
            identity = f"q{qn:02d}_{letter}"
            rows.append(dict(id=identity, question_number=qn, option_index=index,
                             option_letter=letter.upper(), question=text, option_label=label,
                             source_icon_key=option.get("icon") if isinstance(option, dict) else None,
                             filename=identity + ".png"))
    return rows


def load_manifest(args):
    rows = [json.loads(line) for line in args.manifest.read_text(encoding="utf-8-sig").splitlines() if line.strip()]
    need(len(rows) == args.questions * args.choices, "Manifest count does not match questions × choices")
    need(len({row["id"] for row in rows}) == len(rows), "Duplicate manifest IDs")
    snapshot = json.loads(args.manifest.with_suffix(".source.json").read_text(encoding="utf-8"))
    expected = expected_rows(snapshot["questions"], args.questions, args.choices)
    need({row["id"] for row in rows} == {row["id"] for row in expected}, "Missing or unexpected IDs")
    indexed = {row["id"]: row for row in rows}
    for item in expected:
        row = indexed[item["id"]]
        for key, value in item.items():
            need(row.get(key) == value, f'{item["id"]}: source mapping changed: {key}')
        need(Path(row["filename"]).name == row["filename"], "Unsafe filename")
        need(row.get("source_sha256") == snapshot["source_sha256"], "Source snapshot hash differs")
    original = Path(snapshot["source_file"])
    if original.exists():
        need(sha(original) == snapshot["source_sha256"], "Quiz source changed; extract and review the new version")
    return [indexed[item["id"]] for item in expected]


def ready(row):
    for key in ["prompt", "prompt_en", "generation_backend"]:
        need(isinstance(row.get(key), str) and row[key].strip(), f'{row["id"]}: missing {key}')
    features = row.get("required_features")
    need(isinstance(features, list) and features, f'{row["id"]}: required_features must be defined before review')
    keys = [feature["key"] for feature in features]
    need(len(set(keys)) == len(keys), f'{row["id"]}: duplicate feature keys')
    for feature in features:
        need(re.fullmatch(r"[a-z0-9_-]+", feature["key"]), "Invalid feature key")
        need(isinstance(feature.get("description"), str) and feature["description"].strip(), "Missing feature description")
        need(type(feature.get("critical", True)) is bool, "Feature critical must be true or false")
    seed = row.get("seed")
    if row["generation_backend"] == "sdxl":
        need(type(seed) is int, f'{row["id"]}: record the actual SDXL seed')
    for previous in row.get("generation_history", []):
        reference = Path(previous["reference_archive"])
        need(reference.is_file() and sha(reference) == previous["reference_sha256"], f'{row["id"]}: missing or changed edit reference')


def inspect_png(row, folder, size):
    ready(row)
    path = folder / row["filename"]
    need(path.is_file(), f"Missing image: {path}")
    with Image.open(path) as image:
        need(image.format == "PNG" and image.size == (size, size), f'{row["id"]}: expected {size}×{size} PNG')
        info = image.info
        need(info.get("job_id") == row["id"], f'{row["id"]}: PNG ID differs')
        need(info.get("prompt") == row["prompt_en"], f'{row["id"]}: actual generation prompt differs from PNG metadata')
        need(info.get("negative_prompt", "") == row.get("negative_prompt", ""), f'{row["id"]}: negative prompt differs')
        need(info.get("generation_backend") == row["generation_backend"], f'{row["id"]}: backend differs')
        need(info.get("seed") == ("unspecified" if row.get("seed") is None else str(row["seed"])), f'{row["id"]}: seed differs')
        pixels = image.convert("RGBA")
        need(pixels.getchannel("A").getextrema()[1] > 0, f'{row["id"]}: fully transparent image')
        need(max(ImageStat.Stat(pixels.convert("RGB")).stddev) >= 1, f'{row["id"]}: nearly uniform image')
        pixel_hash = hashlib.sha256(pixels.tobytes()).hexdigest()
    return path, sha(path), pixel_hash


def extract(args):
    need(not args.manifest.exists() and not args.manifest.with_suffix(".source.json").exists(), "Choose a new manifest path; source records are not overwritten")
    questions = quiz_data(args.input)
    rows = expected_rows(questions, args.questions, args.choices)
    for row in rows:
        row.update(source_sha256=sha(args.input), style="写真リアル", scene="", prompt="", prompt_en="",
                   negative_prompt="", generation_backend=None, seed=None, required_features=[],
                   forbidden_features=[], text_policy="no-readable-text")
    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    args.manifest.write_text("".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows), encoding="utf-8")
    write_json(args.manifest.with_suffix(".source.json"), dict(source_file=str(args.input.resolve()),
               source_sha256=sha(args.input), questions=questions))
    return dict(questions=args.questions, choices=args.choices, images=len(rows), manifest=str(args.manifest))


def sheets(args):
    rows = load_manifest(args)
    args.out.mkdir(parents=True, exist_ok=True)
    font = ImageFont.load_default()
    if args.font:
        font = ImageFont.truetype(str(args.font), 20)
    review, cards = [], []
    canvas = None
    for index, row in enumerate(rows):
        if index % 8 == 0:
            canvas = Image.new("RGB", (1320, 720), "#f2f2f2")
        x, y = (index % 4) * 330 + 10, ((index % 8) // 4) * 360 + 10
        path = args.images / row["filename"]
        digest = None
        media = "未生成"
        if path.exists():
            _, digest, _ = inspect_png(row, args.images, args.master_size)
            with Image.open(path) as image:
                thumb = image.convert("RGB").resize((310, 310), Image.Resampling.LANCZOS)
                canvas.paste(thumb, (x, y))
                small = image.convert("RGBA").resize((148, 148), Image.Resampling.LANCZOS)
                buffer = io.BytesIO()
                small.save(buffer, format="PNG")
                media = '<img width="148" height="148" src="data:image/png;base64,' + base64.b64encode(buffer.getvalue()).decode() + '">'
        else:
            need(args.partial, f"Missing {path}; use --partial only for an in-progress review")
        ImageDraw.Draw(canvas).text((x, y + 318), row["id"], fill="#111", font=font)
        if index % 8 == 7 or index == len(rows) - 1:
            canvas.save(args.out / f"sheet-{index // 8 + 1:03d}.jpg", quality=92)
        review.append(dict(id=row["id"], status="pending", spec_sha256=spec_hash(row),
                           reviewed_png_sha256=digest, observation="", limitations="",
                           checked_features=[dict(key=f["key"], result="pending", observation="") for f in row.get("required_features", [])]))
        esc = html.escape
        cards.append(f'<article id="{row["id"]}"><h2>{row["id"]}：{esc(row["option_label"])}</h2><p>{esc(row["question"])}</p>{media}<p>{esc(row.get("scene", ""))}</p><pre>{esc(row.get("prompt_en", ""))}</pre></article>')
    write_json(args.out / "review-template.json", review)
    page = '<!doctype html><meta charset="utf-8"><title>クイズ画像の個別確認</title><style>body{font-family:system-ui;max-width:1000px;margin:auto;padding:20px}article{border-bottom:1px solid #ccc;padding:20px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style>' + "".join(cards)
    (args.out / "review.html").write_text(page, encoding="utf-8")
    return dict(records=len(rows), available=sum(item["reviewed_png_sha256"] is not None for item in review),
                template=str(args.out / "review-template.json"), note="Template records are pending, not approved. Keep manual evidence in a separate audit.json.")


def verify(args):
    rows = load_manifest(args)
    entries = json.loads(args.audit.read_text(encoding="utf-8"))
    need(isinstance(entries, list) and len(entries) == len(rows), "Audit must contain one record for every image")
    audit = {entry["id"]: entry for entry in entries}
    need(len(audit) == len(entries) and set(audit) == {row["id"] for row in rows}, "Missing or duplicate audit IDs")
    pixel_hashes, file_hashes = {}, {}
    for row in rows:
        _, digest, pixel_hash = inspect_png(row, args.images, args.master_size)
        if pixel_hash in pixel_hashes:
            need(row.get("reuse_of") == pixel_hashes[pixel_hash], f'{row["id"]}: unexpected reuse of {pixel_hashes[pixel_hash]}')
        else:
            pixel_hashes[pixel_hash] = row["id"]
        file_hashes[row["id"]] = digest
        item = audit[row["id"]]
        need(item.get("status") in {"aligned", "limited"}, f'{row["id"]}: visual review is pending or has a mismatch')
        need(item.get("spec_sha256") == spec_hash(row), f'{row["id"]}: instructions changed after visual review')
        need(item.get("reviewed_png_sha256") == digest, f'{row["id"]}: image changed after visual review')
        need(isinstance(item.get("observation"), str) and item["observation"].strip(), f'{row["id"]}: no visual observation')
        checks = item.get("checked_features", [])
        results = {check["key"]: check for check in checks}
        need(len(results) == len(checks) and set(results) == {f["key"] for f in row["required_features"]}, f'{row["id"]}: incomplete feature review')
        for feature in row["required_features"]:
            check = results[feature["key"]]
            need(check.get("result") in {"pass", "uncertain"}, f'{row["id"]}: failed or unchecked feature {feature["key"]}')
            need(check.get("observation", "").strip(), f'{row["id"]}: missing evidence for {feature["key"]}')
            if feature.get("critical", True) or item["status"] == "aligned":
                need(check["result"] == "pass", f'{row["id"]}: required feature not confirmed: {feature["key"]}')
        if item["status"] == "limited":
            need(item.get("limitations", "").strip(), f'{row["id"]}: limited review needs its limits recorded')
    return dict(images=len(rows), unique_pixel_hashes=len(pixel_hashes),
                aligned=sum(item["status"] == "aligned" for item in entries),
                limited=sum(item["status"] == "limited" for item in entries),
                mapping_matches_source_snapshot=True, metadata_matches=True,
                reviewed_files_match=True, file_sha256=file_hashes,
                scope="Checks recorded visual evidence and file integrity; it does not perform image recognition or prove historical authenticity.")


def export(args):
    summary = verify(args)  # No output is changed if any review or metadata check fails.
    rows = load_manifest(args)
    need(not args.out.is_symlink(), "Output root must not be a symlink")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    managed = ["png-1024", "png-148", "webp-148", "png-1024.zip", "png-148.zip", "webp-148.zip",
               "manifest.jsonl", "manifest.source.json", "audit.json", "validation.json", "comparison.html"]
    need(args.master_size == 1024, "Export profile is 1024px master and 148px icons")
    protected = [args.images.resolve(), args.manifest.resolve(), args.audit.resolve(),
                 args.manifest.with_suffix(".source.json").resolve()]
    for name in managed:
        target = args.out / name
        need(not target.is_symlink(), "Managed output must not be a symlink")
        resolved = target.resolve()
        need(all(path != resolved and resolved not in path.parents for path in protected),
             "Output would replace an input; use a separate output folder")
    need(not (args.out / "backups").is_symlink(), "Backup folder must not be a symlink")
    with tempfile.TemporaryDirectory(prefix=".quiz-icons-", dir=args.out.parent) as temporary:
        stage = Path(temporary)
        for name in managed[:3]:
            (stage / name).mkdir()
        cards = []
        for row in rows:
            source = args.images / row["filename"]
            shutil.copy2(source, stage / "png-1024" / row["filename"])
            with Image.open(source) as image:
                mode = "RGBA" if "A" in image.getbands() or "transparency" in image.info else "RGB"
                small = image.convert(mode).resize((148, 148), Image.Resampling.LANCZOS)
                metadata = PngImagePlugin.PngInfo()
                for key, value in image.info.items():
                    if isinstance(value, str):
                        metadata.add_text(key, value)
                metadata.add_text("resized_from", row["filename"])
                small.save(stage / "png-148" / row["filename"], pnginfo=metadata, optimize=True)
                small.save(stage / "webp-148" / (row["id"] + ".webp"), format="WEBP", quality=85, method=6)
            esc = html.escape
            images = "".join(f'<figure><img width="148" height="148" loading="lazy" src="{folder}/{row["id"]}{extension}"><figcaption>{label}</figcaption></figure>'
                             for folder, extension, label in [("png-1024", ".png", "1024 PNG"), ("png-148", ".png", "148 PNG"), ("webp-148", ".webp", "148 WebP")])
            cards.append(f'<section><h2>{row["id"]}：{esc(row["option_label"])}</h2><p>{esc(row["question"])}</p><div class="images">{images}</div><pre>{esc(row["prompt"])}</pre><details><summary>実際の最終入力</summary><pre>{esc(row["prompt_en"])}</pre></details></section>')
        page = '<!doctype html><meta charset="utf-8"><title>クイズアイコン比較</title><style>body{font-family:system-ui;max-width:1000px;margin:auto;padding:20px}.images{display:flex;gap:16px;overflow:auto}figure{margin:0}pre{white-space:pre-wrap;overflow-wrap:anywhere}section{padding:20px 0;border-bottom:1px solid #ccc}</style>' + "".join(cards)
        (stage / "comparison.html").write_text(page, encoding="utf-8")
        shutil.copy2(args.manifest, stage / "manifest.jsonl")
        shutil.copy2(args.manifest.with_suffix(".source.json"), stage / "manifest.source.json")
        shutil.copy2(args.audit, stage / "audit.json")
        write_json(stage / "validation.json", summary)
        for folder in managed[:3]:
            with zipfile.ZipFile(stage / (folder + ".zip"), "w", compression=zipfile.ZIP_STORED) as archive:
                for path in sorted((stage / folder).iterdir()):
                    archive.write(path, f"{folder}/{path.name}")
            with zipfile.ZipFile(stage / (folder + ".zip")) as archive:
                need(archive.testzip() is None and len(archive.namelist()) == len(rows), f"Invalid ZIP: {folder}")
        args.out.mkdir(parents=True, exist_ok=True)
        existing = [args.out / name for name in managed if (args.out / name).exists()]
        need(all(not path.is_symlink() for path in existing), "Managed output contains a symlink")
        backup = None
        if existing:
            stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + uuid.uuid4().hex[:6]
            backup = args.out / "backups" / stamp
            hashes = {}
            for old in existing:
                files = list(old.rglob("*")) if old.is_dir() else [old]
                need(all(not path.is_symlink() for path in files), "Managed output contains a symlink")
                for path in files:
                    if path.is_file():
                        relative = path.relative_to(args.out)
                        target = backup / relative
                        target.parent.mkdir(parents=True, exist_ok=True)
                        shutil.copy2(path, target)
                        hashes[str(relative)] = sha(path)
                        need(sha(target) == hashes[str(relative)], "Backup copy differs")
            write_json(backup / "sha256.json", hashes)
        for name in managed:
            target = args.out / name
            if target.exists():
                shutil.rmtree(target) if target.is_dir() else target.unlink()
            shutil.move(str(stage / name), str(target))
    return dict(images=len(rows), formats=3, output=str(args.out), backup=str(backup) if backup else None,
                note="Local asset export completed.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    for name in ["extract", "sheets", "verify", "export"]:
        command = sub.add_parser(name)
        command.add_argument("--manifest", type=Path, required=True)
        command.add_argument("--questions", type=int, default=50)
        command.add_argument("--choices", type=int, default=4)
        if name == "extract":
            command.add_argument("--input", type=Path, required=True)
        else:
            command.add_argument("--images", type=Path, required=True)
            command.add_argument("--master-size", type=int, default=1024)
        if name in {"verify", "export"}:
            command.add_argument("--audit", type=Path, required=True)
        if name in {"sheets", "export"}:
            command.add_argument("--out", type=Path, required=True)
        if name == "sheets":
            command.add_argument("--partial", action="store_true")
            command.add_argument("--font", type=Path)
    args = parser.parse_args()
    try:
        result = globals()[args.command](args)
    except (ValueError, KeyError, OSError, TypeError) as exc:
        parser.exit(2, f"error: {exc}\n")
    printable = {key: value for key, value in result.items() if key != "file_sha256"}
    print(json.dumps(printable, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
