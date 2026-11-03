"""Validate provenance, reviewed selections, derivatives and backup preservation."""
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

from PIL import Image, ImageChops, ImageStat

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
jobs = [json.loads(line) for line in (ROOT / "icon-prompts-sdxl.jsonl").read_text().splitlines()]
audit = {row["id"]: row for row in json.loads((HERE / "audit.json").read_text())}
baseline = json.loads((HERE / "before/sha256.json").read_text())
assert len(jobs) == len(audit) == 200
assert {job["id"] for job in jobs} == set(audit)
js = "const fs=require('fs'),vm=require('vm');process.stdout.write(JSON.stringify(vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8')+';QUIZ_DATA',{})));"
quiz = json.loads(subprocess.check_output(['node', '-e', js, str(ROOT/'quiz-data.js')], text=True))
assert len(quiz) == 50
for job in jobs:
    question = quiz[job['question_number'] - 1]
    assert len(question['options']) == 4
    assert job['question'] == question['q'], job['id']
    assert job['option_label'] == question['options'][job['option_index']]['label'], job['id']
    assert job['source_icon_key'] == question['options'][job['option_index']]['icon'], job['id']
hashes = set()
mean_errors = []
revised = 0
for job in jobs:
    item = audit[job["id"]]
    assert item["final_status"] in {"aligned", "limited", "mismatch"}, job["id"]
    assert item.get("final_observation"), job["id"]
    source = ROOT / "images-sdxl" / job["filename"]
    assert hashlib.sha256(source.read_bytes()).hexdigest() == item['reviewed_png_sha256'], job['id']
    png = ROOT / "images-sdxl-148" / job["filename"]
    webp = ROOT / "images-sdxl-148-webp" / (job["id"] + ".webp")
    with Image.open(source) as large, Image.open(png) as small, Image.open(webp) as compressed:
        assert large.size == (1024, 1024) and large.format == "PNG", job["id"]
        assert small.size == compressed.size == (148, 148), job["id"]
        assert small.format == "PNG" and compressed.format == "WEBP", job["id"]
        assert large.info["job_id"] == small.info["job_id"] == job["id"]
        assert large.info["prompt"] == small.info["prompt"] == job["prompt_en"]
        assert large.info["negative_prompt"] == small.info["negative_prompt"] == job["negative_prompt"]
        if job.get("generation_backend") == "imagegen":
            assert job["seed"] is None
            assert large.info["seed"] == small.info["seed"] == "unspecified"
        else:
            assert int(large.info["seed"]) == int(small.info["seed"]) == job["seed"]
        expected = large.convert("RGB").resize((148, 148), Image.Resampling.LANCZOS)
        assert ImageChops.difference(expected, small.convert("RGB")).getbbox() is None, job["id"]
        error = sum(ImageStat.Stat(ImageChops.difference(expected, compressed.convert("RGB"))).mean) / 3
        assert error < 12, (job["id"], error)
        mean_errors.append(error)
        pixel_hash = hashlib.sha256(large.convert("RGB").tobytes()).hexdigest()
        assert pixel_hash not in hashes, job["id"]
        hashes.add(pixel_hash)
        if job["id"] in {"q43_a", "q43_b", "q43_c"}:
            assert large.info["typeset_text"] == job["option_label"]
    if item["selection"] == "candidate":
        revised += 1
    for current in [source, png, webp]:
        relative = current.relative_to(ROOT)
        original = HERE / "before" / relative
        assert hashlib.sha256(original.read_bytes()).hexdigest() == baseline[str(relative)], str(original)
        if item['selection'] == 'original':
            assert hashlib.sha256(current.read_bytes()).hexdigest() == baseline[str(relative)], str(current)
    if len(hashes) % 25 == 0:
        print(f'Validated images and original backups: {len(hashes)}/200', flush=True)

for name, folder, extension in [
    ("history-lesson7-sdxl-200.zip", "images-sdxl", ".png"),
    ("history-lesson7-sdxl-200-148.zip", "images-sdxl-148", ".png"),
    ("history-lesson7-sdxl-200-148-webp.zip", "images-sdxl-148-webp", ".webp"),
]:
    with zipfile.ZipFile(ROOT / name) as archive:
        assert archive.testzip() is None, name
        entries = [item for item in archive.namelist() if item.startswith(folder + "/q") and item.endswith(extension)]
        assert len(entries) == 200 and len(set(entries)) == 200, name
        for job in jobs:
            relative = folder + "/" + job["id"] + extension
            assert hashlib.sha256(archive.read(relative)).digest() == hashlib.sha256((ROOT / relative).read_bytes()).digest(), relative

summary = {
    "images_checked": 200,
    "formats_checked": 600,
    "revised_images": revised,
    "original_images_preserved": 200,
    "unique_large_pixel_hashes": len(hashes),
    "maximum_webp_mean_absolute_error": round(max(mean_errors), 3),
    "review_status_counts": {status: sum(row["final_status"] == status for row in audit.values())
                             for status in ["aligned", "limited", "mismatch"]},
    "metadata_matches_generation_prompts": True,
    "question_and_all_four_choice_mappings_match_quiz_javascript": True,
    "small_png_pixels_match_lanczos_resize": True,
    "zip_crc_and_image_contents_match": True,
    "limitations": "Mechanical validation does not establish historical accuracy or literal visual agreement with every prompt detail. See the individual visual observations.",
}
(HERE / "validation.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(summary, ensure_ascii=False, indent=2))
