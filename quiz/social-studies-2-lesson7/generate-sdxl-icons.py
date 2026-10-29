#!/usr/bin/env python3
"""Generate the 200 lesson 7 images with the user's local SDXL model.

python3 generate-sdxl-icons.py --dry-run
python3 generate-sdxl-icons.py --ids q01_b q06_a q12_a q01_d
python3 generate-sdxl-icons.py
Existing matching, valid PNGs are resumed without another inference.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import time

HERE = Path(__file__).resolve().parent
DEFAULT_MODEL = Path('/content/drive/MyDrive/ColabAI/sdxl-base')


def read_jobs(path):
    rows = [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]
    assert len(rows) == 200, f'Expected 200 jobs, got {len(rows)}'
    assert len({r['id'] for r in rows}) == 200
    assert len({r['filename'] for r in rows}) == 200
    for row in rows:
        assert Path(row['filename']).name == row['filename']
        assert row['size'] == '1024x1024'
        if row.get('generation_backend', 'sdxl') == 'sdxl':
            assert row['prompt_en'].isascii() and row['negative_prompt'].isascii()
    return rows


def fingerprint(row, args):
    payload = dict(prompt=row['prompt_en'], negative=row['negative_prompt'], seed=row['seed'],
                   steps=args.steps, guidance_scale=args.guidance_scale,
                   model=str(args.model.resolve()), width=1024, height=1024)
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()


def is_complete(path, expected_hash):
    from PIL import Image
    if not path.exists():
        return False
    try:
        with Image.open(path) as image:
            if image.size != (1024, 1024) or image.info.get('job_hash') != expected_hash:
                raise RuntimeError(f'{path.name}: an existing file has different settings; use a new --output-dir')
            image.verify()
        return True
    except RuntimeError:
        raise
    except Exception as exc:
        raise RuntimeError(f'{path}: existing file is damaged; move it aside before retrying') from exc


def validate_tokens(rows, model):
    from transformers import CLIPTokenizer
    for subfolder in ['tokenizer', 'tokenizer_2']:
        tokenizer = CLIPTokenizer.from_pretrained(str(model / subfolder), local_files_only=True)
        for row in rows:
            if row.get('generation_backend', 'sdxl') != 'sdxl':
                continue
            for field in ['prompt_en', 'negative_prompt']:
                length = len(tokenizer(row[field], truncation=False)['input_ids'])
                if length > tokenizer.model_max_length:
                    raise ValueError(f'{row["id"]}: {field} has {length} tokens, limit {tokenizer.model_max_length}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--model', type=Path, default=DEFAULT_MODEL)
    parser.add_argument('--prompts', type=Path, default=HERE / 'icon-prompts-sdxl.jsonl')
    parser.add_argument('--output-dir', type=Path, default=HERE / 'images-sdxl')
    parser.add_argument('--steps', type=int, default=30)
    parser.add_argument('--guidance-scale', type=float, default=6.0)
    parser.add_argument('--batch-size', type=int, default=2)
    parser.add_argument('--ids', nargs='+')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    if args.batch_size < 1:
        parser.error('--batch-size must be positive')
    rows = read_jobs(args.prompts)
    validate_tokens(rows, args.model)
    print('Validated 200 jobs; checked both CLIP token limits for SDXL jobs.', flush=True)
    if args.ids:
        missing = set(args.ids) - {r['id'] for r in rows}
        if missing:
            parser.error(f'Unknown ids: {sorted(missing)}')
        selected = set(args.ids)
        rows = [r for r in rows if r['id'] in selected]
    external = [r for r in rows if r.get('generation_backend', 'sdxl') != 'sdxl']
    if external:
        print(f'{len(external)} images use another recorded backend; their prompts are not sent to SDXL.', flush=True)
        rows = [r for r in rows if r.get('generation_backend', 'sdxl') == 'sdxl']
    if args.dry_run:
        print(f'Dry run OK: {len(rows)} selected, 1024x1024, {args.steps} steps.', flush=True)
        return

    import torch
    from diffusers import StableDiffusionXLPipeline
    from PIL import ImageStat, PngImagePlugin

    if not args.model.is_dir():
        raise FileNotFoundError(args.model)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    pending = [r for r in rows if not is_complete(args.output_dir / r['filename'], fingerprint(r, args))]
    print(f'Selected {len(rows)}, already saved {len(rows)-len(pending)}, remaining {len(pending)}.', flush=True)
    if not pending:
        return
    if not torch.cuda.is_available():
        raise RuntimeError('CUDA is unavailable in this process. Run with GPU access; CPU inference is not started.')
    free, total = torch.cuda.mem_get_info()
    print(f'GPU {torch.cuda.get_device_name(0)}; free {free/1024**3:.2f}/{total/1024**3:.2f} GiB.', flush=True)
    started = time.monotonic()
    pipe = StableDiffusionXLPipeline.from_pretrained(
        str(args.model), dtype=torch.float16, use_safetensors=True,
        local_files_only=True, add_watermarker=False,
    )
    if free >= 14 * 1024**3:
        pipe.to('cuda')
        print('Using full GPU residency.', flush=True)
    else:
        pipe.enable_model_cpu_offload()
        print('Using model CPU offload for limited free VRAM.', flush=True)
    pipe.vae.enable_tiling()
    pipe.vae.enable_slicing()
    pipe.set_progress_bar_config(disable=True)
    print(f'Model loaded in {time.monotonic()-started:.1f}s.', flush=True)
    log_path = args.output_dir / 'generation-log.jsonl'
    for offset in range(0, len(pending), args.batch_size):
        batch = pending[offset:offset+args.batch_size]
        print(f'START {offset+1}-{offset+len(batch)}/{len(pending)} ' + ', '.join(r['id']+' '+r['option_label'] for r in batch), flush=True)
        tick = time.monotonic()
        generators = [torch.Generator(device='cpu').manual_seed(r['seed']) for r in batch]
        try:
            with torch.inference_mode():
                images = pipe(
                    prompt=[r['prompt_en'] for r in batch],
                    negative_prompt=[r['negative_prompt'] for r in batch],
                    width=1024, height=1024, num_inference_steps=args.steps,
                    guidance_scale=args.guidance_scale, generator=generators,
                ).images
            elapsed = round(time.monotonic()-tick, 2)
            for row, image in zip(batch, images):
                dest = args.output_dir / row['filename']
                if image.size != (1024, 1024):
                    raise RuntimeError(f'Unexpected image size: {image.size}')
                stats = ImageStat.Stat(image.convert('RGB'))
                if max(stats.mean) < 2 or max(stats.stddev) < 1:
                    raise RuntimeError('Image is almost uniform/black; stopping for inspection.')
                meta = PngImagePlugin.PngInfo()
                meta.add_text('job_hash', fingerprint(row, args))
                meta.add_text('job_id', row['id'])
                meta.add_text('prompt', row['prompt_en'])
                meta.add_text('negative_prompt', row['negative_prompt'])
                meta.add_text('seed', str(row['seed']))
                temp = dest.with_suffix('.part.png')
                image.save(temp, format='PNG', pnginfo=meta)
                os.replace(temp, dest)
                record = dict(id=row['id'], filename=dest.name, option_label=row['option_label'],
                              prompt=row['prompt_en'], negative_prompt=row['negative_prompt'],
                              seed=row['seed'], steps=args.steps, guidance_scale=args.guidance_scale,
                              size='1024x1024', model=str(args.model), job_hash=fingerprint(row, args),
                              batch_size=len(batch), elapsed_seconds=round(elapsed/len(batch), 2),
                              completed_utc=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()))
                with log_path.open('a', encoding='utf-8') as log:
                    log.write(json.dumps(record, ensure_ascii=False) + '\n')
                print(f'SAVED {row["id"]} {elapsed/len(batch):.1f}s/image {dest}', flush=True)
            del images
        except Exception:
            print('FAILED ' + ', '.join(r['id'] for r in batch) + '; completed PNGs are preserved for resume.', flush=True)
            raise
    print(f'DONE: {len(rows)} selected images complete; {time.monotonic()-started:.1f}s elapsed.', flush=True)


if __name__ == '__main__':
    main()
