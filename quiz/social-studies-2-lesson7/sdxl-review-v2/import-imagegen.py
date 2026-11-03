"""Copy a built-in image generation result into the review candidates."""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, PngImagePlugin

parser = argparse.ArgumentParser()
parser.add_argument("--id", required=True)
parser.add_argument("--source", required=True, type=Path)
parser.add_argument("--prompts", type=Path)
parser.add_argument("--output-dir", type=Path)
args = parser.parse_args()
HERE = Path(__file__).resolve().parent
jobs = {row["id"]: row for row in map(json.loads, (args.prompts or HERE / "prompts-imagegen.jsonl").read_text().splitlines())}
row = jobs[args.id]
output = args.output_dir or HERE / "imagegen-candidates"
output.mkdir(exist_ok=True)
with Image.open(args.source) as source:
    image = source.convert("RGB")
    source_size = image.size
    if image.size != (1024, 1024):
        image = image.resize((1024, 1024), Image.Resampling.LANCZOS)
    metadata = PngImagePlugin.PngInfo()
    for key, value in {
        "job_id": row["id"],
        "job_hash": hashlib.sha256(row["prompt_en"].encode()).hexdigest(),
        "prompt": row["prompt_en"],
        "negative_prompt": row["negative_prompt"],
        "seed": "unspecified",
        "generation_backend": "imagegen",
        "generation_source": str(args.source),
        "source_dimensions": f"{source_size[0]}x{source_size[1]}",
        "output_dimensions": "1024x1024",
    }.items():
        metadata.add_text(key, value)
    if row.get("expected_text"):
        metadata.add_text("typeset_text", row["expected_text"])
        metadata.add_text("postprocess_description", "The pre-existing typeset seal text is preserved in the edit reference; visual verification is recorded separately in the audit.")
    destination = output / row["filename"]
    temporary = destination.with_suffix(".part.png")
    image.save(temporary, format="PNG", pnginfo=metadata)
    temporary.replace(destination)
with (output / "generation-log.jsonl").open("a", encoding="utf-8") as stream:
    stream.write(json.dumps({"id": row["id"], "source": str(args.source),
                            "prompt": row["prompt_en"], "backend": "imagegen",
                            "source_size": source_size, "output_size": [1024, 1024]}, ensure_ascii=False) + "\n")
print(row["id"] + " saved at 1024x1024")
