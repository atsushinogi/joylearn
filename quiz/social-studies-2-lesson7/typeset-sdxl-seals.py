#!/usr/bin/env python3
"""Typeset the three exact four-character seal phrases on SDXL photographs.

Preserves the untouched SDXL photographs in sdxl-review-drafts/.
python3 typeset-sdxl-seals.py --font /tmp/NotoSerifCJKjp-Bold.otf
"""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, PngImagePlugin

HERE = Path(__file__).resolve().parent
FONT_URL = 'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/OTF/Japanese/NotoSerifCJKjp-Bold.otf'
PHRASES = {'q43_a': '天下布武', 'q43_b': '天下太平', 'q43_c': '一所懸命'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--font', type=Path, required=True)
    args = parser.parse_args()
    font=ImageFont.truetype(str(args.font),250)
    drafts=HERE/'sdxl-review-drafts'
    drafts.mkdir(exist_ok=True)
    for index,(key,phrase) in enumerate(PHRASES.items()):
        dest=HERE/'images-sdxl'/f'{key}.png'
        with Image.open(dest) as img:
            if img.info.get('typeset_text')==phrase:
                print('Already typeset:',key)
                continue
            original_info=dict(img.info)
            base=img.convert('RGBA')
        raw=drafts/f'{key}-before-typesetting.png'
        if not raw.exists():
            raw.write_bytes(dest.read_bytes())
        rng=np.random.default_rng(4300+index)
        # A softly lit physical sheet on top of the generated stationery scene.
        side=740
        yy,xx=np.mgrid[:side,:side]
        noise=rng.normal(0,0.8,(side,side))
        luminance=6*(xx+yy)/(2*side)
        paper=np.stack([246-luminance+noise,240-luminance+noise,224-luminance+noise],axis=-1)
        card=Image.fromarray(np.clip(paper,0,255).astype('uint8')).convert('RGBA')
        ink=Image.new('RGBA',(side,side),(0,0,0,0))
        draw=ImageDraw.Draw(ink)
        red=(160,46,35,235)
        draw.rounded_rectangle((60,60,680,680),radius=9,outline=red,width=13)
        # Conventional vertical order: right column first, top to bottom.
        for char,center in zip(phrase,[(515,205),(515,505),(225,205),(225,505)]):
            draw.text(center,char,font=font,fill=red,anchor='mm',stroke_width=1)
        alpha=np.array(ink.getchannel('A'),dtype='float32')
        alpha*=rng.uniform(0.83,1.0,(side,side))
        ink.putalpha(Image.fromarray(alpha.astype('uint8')))
        card.alpha_composite(ink)
        angle=[-2.0,1.5,-1.2][index]
        card=card.rotate(angle,resample=Image.Resampling.BICUBIC,expand=True)
        x=1024-card.width-20
        y=(1024-card.height)//2+30
        shadow=Image.new('RGBA',(1024,1024),(0,0,0,0))
        shadow_mask=card.getchannel('A').point(lambda v:int(v*0.25))
        shadow.paste((45,35,25,255),(x+8,y+12,x+8+card.width,y+12+card.height),shadow_mask)
        shadow=shadow.filter(ImageFilter.GaussianBlur(10))
        base.alpha_composite(shadow)
        base.alpha_composite(card,(x,y))
        meta=PngImagePlugin.PngInfo()
        for k,v in original_info.items():
            if isinstance(v,str):
                meta.add_text(k,v)
        meta.add_text('typeset_text',phrase)
        meta.add_text('postprocessing','Exact Japanese seal lettering composited onto the SDXL photograph with Noto Serif CJK JP Bold; original retained.')
        temp=dest.with_suffix('.part.png')
        base.convert('RGB').save(temp,pnginfo=meta)
        temp.replace(dest)
        log={'id':key,'typeset_text':phrase,'original':str(raw.relative_to(HERE)),
             'font_url':FONT_URL,'font_sha256':hashlib.sha256(args.font.read_bytes()).hexdigest(),
             'image_sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}
        with (HERE/'images-sdxl'/'postprocessing-log.jsonl').open('a',encoding='utf-8') as f:
            f.write(json.dumps(log,ensure_ascii=False)+'\n')
        print('Typeset:',key,phrase)


if __name__=='__main__':
    main()
