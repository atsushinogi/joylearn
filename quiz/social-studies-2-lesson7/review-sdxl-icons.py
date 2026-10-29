#!/usr/bin/env python3
"""Check PNGs and create a local review page and contact sheets."""
import argparse
import csv
import hashlib
import html
import json
from pathlib import Path
import zipfile

from PIL import Image, ImageDraw, ImageFont, ImageStat

HERE = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--partial', action='store_true')
    parser.add_argument('--zip', action='store_true')
    args = parser.parse_args()
    jobs = [json.loads(s) for s in (HERE/'icon-prompts-sdxl.jsonl').read_text().splitlines()]
    audit_path = HERE/'sdxl-review-v2/audit.json'
    audit = {row['id']: row for row in json.loads(audit_path.read_text())} if audit_path.exists() else {}
    image_dir = HERE/'images-sdxl'
    preview_dir = HERE/'sdxl-contact-sheets'
    preview_dir.mkdir(exist_ok=True)
    found = []
    missing = []
    digests = set()
    for job in jobs:
        path = image_dir/job['filename']
        if not path.exists():
            missing.append(job['id'])
            continue
        with Image.open(path) as image:
            assert image.size == (1024, 1024), path
            assert image.format == 'PNG', path
            assert image.info.get('job_id') == job['id'], path
            assert image.info.get('prompt') == job['prompt_en'], path
            if job.get('generation_backend', 'sdxl') == 'sdxl':
                assert int(image.info.get('seed', '-1')) == job['seed'], path
            else:
                assert job['seed'] is None, path
                assert image.info.get('seed') == 'unspecified', path
                assert image.info.get('generation_backend') == job['generation_backend'], path
            assert image.info.get('negative_prompt') == job['negative_prompt'], path
            if not args.partial and job['id'] in {'q43_a','q43_b','q43_c'}:
                assert image.info.get('typeset_text')==job['option_label'], path
            stats = ImageStat.Stat(image.convert('RGB'))
            assert max(stats.mean)>2 and max(stats.stddev)>1, path
            pixel_hash = hashlib.sha256(image.convert('RGB').tobytes()).hexdigest()
            assert pixel_hash not in digests, f'Duplicate pixels: {path}'
            digests.add(pixel_hash)
        found.append(job)
    if missing and not args.partial:
        raise SystemExit(f'Incomplete: {len(found)}/200; missing {missing}')

    font = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 18)
    jp_path=Path('/tmp/NotoSerifCJKjp-Bold.otf')
    jp_font=ImageFont.truetype(str(jp_path),15) if jp_path.exists() else None
    for start in range(0, 200, 25):
        sheet=Image.new('RGB',(1100,1250),'#f3f0e9')
        draw=ImageDraw.Draw(sheet)
        for offset,job in enumerate(jobs[start:start+25]):
            x=(offset%5)*220+10
            y=(offset//5)*250+10
            path=image_dir/job['filename']
            if path.exists():
                with Image.open(path) as image:
                    thumb=image.convert('RGB').resize((200,200),Image.Resampling.LANCZOS)
                    sheet.paste(thumb,(x,y))
            else:
                draw.rectangle((x,y,x+199,y+199),fill='#ddd8ce')
            draw.text((x,y+208),job['id']+'  '+('PHOTO' if job['style']=='写真リアル' else 'ART'),font=font,fill='#222')
            if jp_font:
                draw.text((x,y+225),job['option_label'],font=jp_font,fill='#333')
        sheet.save(preview_dir/f'contact-{start+1:03d}-{start+25:03d}.jpg',quality=92)

    overview=Image.new('RGB',(2000,4400),'#f3f0e9')
    overview_draw=ImageDraw.Draw(overview)
    for offset,job in enumerate(jobs):
        x=(offset%10)*200+10
        y=(offset//10)*220+5
        path=image_dir/job['filename']
        if path.exists():
            with Image.open(path) as image:
                thumb=image.convert('RGB').resize((180,180),Image.Resampling.LANCZOS)
                overview.paste(thumb,(x,y))
        else:
            overview_draw.rectangle((x,y,x+179,y+179),fill='#ddd8ce')
        overview_draw.text((x,y+182),job['id'],font=font,fill='#222')
        if jp_font:
            overview_draw.text((x,y+199),job['option_label'],font=jp_font,fill='#333')
    overview.save(HERE/'sdxl-image-overview.jpg',quality=92)

    parts=['''<!doctype html><html lang="ja"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>歴史クイズ第7回 画像一覧</title>
<style>
*{box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#f5f2ec;color:#29241d;margin:0;padding:24px;line-height:1.65}
main{max-width:1160px;margin:auto}h1{font-size:26px}h2{font-size:20px;margin-bottom:8px}section{margin:32px 0 48px}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}figure{margin:0;background:white;padding:10px;border-radius:12px}
img{display:block;width:100%;height:auto;aspect-ratio:1;object-fit:contain;border-radius:6px}figcaption{padding:8px 2px;font-size:14px}small{color:#6b655a;display:block;font-size:12px}
a{color:inherit}p{max-width:900px}.missing{aspect-ratio:1;display:grid;place-items:center;background:#e3ddd2;color:#71695a}
@media(max-width:650px){body{padding:14px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}}
</style><main><h1>歴史クイズ 第7回「安土・桃山時代」</h1>''',
           f'<p>生成画像：{len(found)} / 200枚。各1024×1024、PNG。画像をクリックすると原寸で開きます。</p>',
           '<p><a href="sdxl-review-v2/report.html">全200枚の個別確認と修正前・修正後の比較</a></p>' if audit else '',
           '<p>人物・建築・合戦は生成AIによる再現イメージです。元の問題文と選択肢を対応させて表示しています。A〜Dは問題データ内の元の順序です。</p>']
    esc=html.escape
    for q in range(1,51):
        group=jobs[(q-1)*4:q*4]
        parts.extend([f'<section><h2>第{q:02d}問</h2><p>{esc(group[0]["question"])}</p><div class="grid">'])
        for job in group:
            src=f'images-sdxl/{job["filename"]}'
            parts.append('<figure>')
            if (image_dir/job['filename']).exists():
                parts.append(f'<a href="{src}" target="_blank"><img src="{src}" loading="lazy" width="1024" height="1024" alt="{esc(job["option_label"],quote=True)}"></a>')
            else:
                parts.append('<div class="missing">生成待ち</div>')
            parts.append(f'<figcaption>{job["option_letter"]}：{esc(job["option_label"])}<small>{job["filename"]} ／ {job["style"]} ／ {esc(job.get("generation_backend", "SDXL"))}</small>')
            if job['id'] in audit:
                item = audit[job['id']]
                parts.append(f'<details><summary>個別確認：{esc(item["final_status"])}</summary><p>{esc(item.get("final_observation", "確認中"))}</p><p>{esc(item.get("remaining_issues", ""))}</p></details>')
            parts.append(f'<details><summary>生成プロンプト</summary><p>{esc(job["prompt_en"])}</p></details></figcaption></figure>')
        parts.append('</div></section>')
    parts.append('</main></html>')
    (HERE/'sdxl-image-preview.html').write_text('\n'.join(parts),encoding='utf-8')
    summary=dict(expected=200,saved=len(found),missing=missing,dimensions='1024x1024',format='PNG',unique_pixel_hashes=len(digests))
    (HERE/'sdxl-image-validation.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    columns=['id','question_number','option_letter','option_label','filename','style','generation_backend','seed','prompt_en','negative_prompt']
    with (HERE/'sdxl-image-index.csv').open('w',encoding='utf-8-sig',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=columns,extrasaction='ignore')
        writer.writeheader()
        writer.writerows([{**job, 'generation_backend': job.get('generation_backend', 'sdxl')} for job in found])
    if args.zip:
        assert len(found)==200, 'ZIP requires all 200 images'
        target=HERE/'history-lesson7-sdxl-200.zip'
        with zipfile.ZipFile(target.with_suffix('.part.zip'),'w',compression=zipfile.ZIP_STORED) as bundle:
            for job in jobs:
                bundle.write(image_dir/job['filename'],'images-sdxl/'+job['filename'])
            for name in ['sdxl-image-index.csv','sdxl-image-preview.html','sdxl-image-overview.jpg',
                         'SDXL-IMAGES.md','icon-prompts-sdxl.jsonl','sdxl-image-validation.json',
                         'generate-sdxl-icons.py','review-sdxl-icons.py','typeset-sdxl-seals.py',
                         'images-sdxl/postprocessing-log.jsonl','compare-sdxl-images.py',
                         'icon-prompts.md','icon-prompts.csv','icon-prompts.jsonl',
                         'sdxl-review-v2/report.md','sdxl-review-v2/report.html',
                         'sdxl-review-v2/report.csv','sdxl-review-v2/audit.json','sdxl-review-v2/references.md']:
                if (HERE/name).exists():
                    bundle.write(HERE/name,name)
            for folder in ['sdxl-review-v2/before/images-sdxl-148', 'sdxl-review-v2/before-refinement']:
                for path in sorted((HERE/folder).glob('q*.png')):
                    bundle.write(path,str(path.relative_to(HERE)))
        target.with_suffix('.part.zip').replace(target)
        summary['zip']=str(target)
    print(json.dumps(summary,ensure_ascii=False))


if __name__=='__main__':
    main()
