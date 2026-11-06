#!/usr/bin/env python3
"""Audit a kanji/story workbook; export reviewed imagegen PNGs as PNG/WebP.

No image synthesis, pronunciation inference, network fetching, or auto-approval.
"""
from __future__ import annotations

import argparse
from collections import Counter
import csv
import hashlib
import html
import json
import math
from pathlib import Path
import re
import shutil
import sys
import tempfile
import unicodedata
import zipfile


def digest(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(raw.encode()).hexdigest()


def file_digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def kana(value):
    value = unicodedata.normalize('NFKC', value)
    return ''.join(chr(ord(c) - 0x60) if 'ァ' <= c <= 'ヶ' else c
                   for c in value if not c.isspace())


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def emit(value, path=None):
    text = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    if path:
        Path(path).write_text(text, encoding='utf-8')
    else:
        print(text, end='')


def index(items):
    return {item['id']: item for item in items}


def inside(base, relative):
    if not isinstance(relative, str) or not relative or Path(relative).is_absolute():
        raise ValueError('Image paths must be nonempty relative paths')
    resolved = (base / relative).resolve()
    if not resolved.is_relative_to(base.resolve()):
        raise ValueError('Image path escapes the workbook folder: ' + relative)
    return resolved


def extract(path):
    path = Path(path)
    candidates = {}

    def add(kind, location, **fields):
        if kind == 'explicit_pair':
            key = (kind, fields.get('kanji'), kana(fields.get('reading', '')))
        else:
            key = (kind, fields.get('answer'), kana(fields.get('word_reading', '')))
        if key not in candidates:
            candidates[key] = {'id': f'candidate-{len(candidates) + 1:03}',
                               'kind': kind, **fields, 'occurrences': []}
        candidates[key]['occurrences'].append({'source': str(path), 'location': location,
                                                'original_values': fields})

    def walk(value, location='$'):
        if isinstance(value, dict):
            if value.get('target_character') and value.get('target_reading'):
                add('explicit_pair', location, kanji=value['target_character'],
                    reading=value['target_reading'], answer=value.get('answer', ''),
                    word_reading=value.get('reading_in_prompt', ''))
            elif value.get('kanji') and value.get('reading'):
                add('explicit_pair', location, kanji=value['kanji'], reading=value['reading'])
            elif value.get('answer') and value.get('reading'):
                answer = value['answer']
                add('word', location, answer=answer, word_reading=value['reading'],
                    kanji_candidates=re.findall(r'[\u3400-\u9fff]', answer))
            for key, item in value.items():
                walk(item, location + '.' + str(key))
        elif isinstance(value, list):
            for n, item in enumerate(value):
                walk(item, location + f'[{n}]')

    if path.suffix.lower() == '.json':
        walk(read_json(path))
    elif path.suffix.lower() == '.csv':
        with path.open(encoding='utf-8-sig', newline='') as handle:
            for n, row in enumerate(csv.DictReader(handle), 2):
                char = row.get('kanji') or row.get('漢字') or row.get('対象字')
                reading = row.get('reading') or row.get('読み（辞書形）') or row.get('読み')
                if char and reading:
                    add('explicit_pair', f'row:{n}', kanji=char, reading=reading)
                elif row.get('解答') and row.get('読み方'):
                    add('word', f'row:{n}', answer=row['解答'], word_reading=row['読み方'])
    else:
        text = path.read_text(encoding='utf-8-sig')
        for n, line in enumerate(text.splitlines(), 1):
            for match in re.finditer(r'([\u3400-\u9fff々]+)[（(]([ぁ-ゖァ-ヺー]+)[）)]', line):
                add('word', f'line:{n}', answer=match[1], word_reading=match[2])
            for match in re.finditer(r'〔([ぁ-ゖァ-ヺー]+)〕', line):
                add('unresolved', f'line:{n}', word_reading=match[1], answer='')
    return {'source': str(path), 'source_sha256': file_digest(path),
            'confirmed': False, 'count': len(candidates),
            'notice': 'Candidates only. Check all source readings; unannotated text and per-kanji readings require human/dictionary verification.',
            'candidates': list(candidates.values())}


def quota(book):
    segments = book['work']['segments']
    count = len(book['questions'])
    if count < len(segments):
        raise ValueError('Fewer questions than story segments; cannot cover every segment')
    if not segments or not count or any(not s['unit_ids'] for s in segments):
        raise ValueError('Questions and nonempty story segments are required')
    total = sum(len(s['unit_ids']) for s in segments)
    expected = {s['id']: count * len(s['unit_ids']) / total for s in segments}
    allocated = dict.fromkeys(expected, 1)
    for _ in range(count - len(segments)):
        chosen = max(expected, key=lambda key: expected[key] - allocated[key])
        allocated[chosen] += 1
    return allocated


def question_digest(book, question):
    scene = index(book['scenes'])[question['scene_id']]
    people = index(book['cast'])
    targets = index(book['targets'])
    unit = index(book['work']['units'])[scene['unit_id']]
    source_ids = set(scene['source_ids']) | set(unit['source_ids'])
    for item in question['targets']:
        source_ids.update(targets[item['target_id']]['evidence_source_ids'])
    return digest({'question': {k: v for k, v in question.items() if k not in ('review', 'image')},
                   'scene': scene, 'unit': unit,
                   'work': {k: book['work'][k] for k in ('title', 'edition', 'scope')},
                   'characters': [people[x] for x in sorted(question['character_ids'])],
                   'targets': [targets[x['target_id']] for x in question['targets']],
                   'sources': {k: book['sources'][k] for k in sorted(source_ids)}})


def fingerprints(book, base):
    rows = []
    for question in book['questions']:
        item = {'id': question['id'], 'question_sha256': question_digest(book, question)}
        image = question.get('image')
        if image:
            item['prompt_sha256'] = hashlib.sha256(image['prompt'].encode()).hexdigest()
            path = inside(base, image['source_png'])
            if path.is_file():
                item['source_sha256'] = file_digest(path)
            item['requirements_sha256'] = digest(image['required_features'])
        rows.append(item)
    return {'automatic_approval': False, 'questions': rows}


def validate(book, base, stage='text'):
    errors = []

    def check(ok, message):
        if not ok:
            errors.append(message)

    def refs(ids, context):
        check(bool(ids), context + ': no sources')
        for value in ids:
            check(value in sources, context + ': unknown source ' + str(value))

    check(book.get('schema_version') == 1, 'schema_version must be 1')
    questions = book['questions']
    work = book['work']
    sources = book['sources']
    for label in ('targets', 'cast', 'scenes', 'questions'):
        ids = [x['id'] for x in book[label]]
        check(bool(ids), label + ' must not be empty')
        check(len(ids) == len(set(ids)), label + ': duplicate IDs')
    targets, people, scenes = (index(book[k]) for k in ('targets', 'cast', 'scenes'))
    for sid, source in sources.items():
        check(bool(source.get('url') or source.get('path')), sid + ': no source location')
        check(bool(source.get('note', '').strip()), sid + ': no source evidence note')
        check(source.get('access') in ('index', 'synopsis', 'detailed', 'full'), sid + ': invalid access level')
    pairs = [(t['kanji'], kana(t['reading'])) for t in targets.values()]
    check(len(pairs) == len(set(pairs)), 'Duplicate target kanji/readings (including kana variants)')
    for tid, target in targets.items():
        check(bool(re.fullmatch(r'[\u3400-\u9fff]', target['kanji'])), tid + ': target must be one kanji')
        check(bool(target['reading'].strip()) and bool(target.get('reading_type')), tid + ': missing reading/type')
        check(target.get('confirmed') is True, tid + ': reading not confirmed')
        check(bool(target.get('evidence_note', '').strip()), tid + ': no reading evidence note')
        refs(target.get('evidence_source_ids', []), tid)
    for field in ('title', 'edition', 'scope', 'researched_at'):
        check(bool(work.get(field, '').strip()), 'Missing work.' + field)
    refs(work.get('index_source_ids', []), 'work index')
    expected = work['expected_unit_ids']
    units = index(work['units'])
    check(bool(expected) and len(set(expected)) == len(expected), 'Expected unit catalog empty/duplicated')
    check(len(units) == len(work['units']), 'Duplicate research unit IDs')
    check(set(units) == set(expected), 'Research units do not match complete source catalog')
    for uid, unit in units.items():
        check(unit.get('research_status') == 'detailed', uid + ': not researched in detail')
        check(bool(unit.get('events')) and all(str(x).strip() for x in unit.get('events', [])), uid + ': no detailed event notes')
        refs(unit.get('source_ids', []), uid)
        check(any(sources.get(x, {}).get('access') in ('detailed', 'full') for x in unit.get('source_ids', [])), uid + ': only index/synopsis sources available')
        check(set(unit.get('character_ids', [])) <= set(people), uid + ': unknown character')
    segments = work['segments']
    check(len({s['id'] for s in segments}) == len(segments), 'Duplicate segment IDs')
    check([u for s in segments for u in s['unit_ids']] == expected, 'Segments must partition the entire catalog in order')
    aliases = {}
    for pid, person in people.items():
        check(bool(person.get('identity_id')) and bool(person.get('identity_note', '').strip()), pid + ': missing canonical identity/evidence')
        for name in {person['name'], *person.get('aliases', [])}:
            check(bool(name.strip()), pid + ': empty alias')
            check(name not in aliases or aliases[name] == pid, 'Ambiguous cast alias: ' + name)
            if name:
                aliases[name] = pid
    names_re = re.compile('|'.join(map(re.escape, sorted(aliases, key=len, reverse=True)))) if aliases else None
    for sid, scene in scenes.items():
        check(scene.get('unit_id') in units, sid + ': unknown research unit')
        check(scene.get('verified') is True, sid + ': scene not verified')
        for field in ('description', 'period', 'evidence_note'):
            check(bool(scene.get(field, '').strip()), sid + ': missing ' + field)
        refs(scene.get('source_ids', []), sid)
        check(set(scene.get('character_ids', [])) <= set(people), sid + ': unknown character')
        kind = scene.get('basis_type')
        supplements = book.get('allow_supplements') is True and bool(book.get('supplements_authorization', '').strip())
        check(kind in ('scene', 'setting') or (supplements and kind in ('interpretation', 'vocabulary')), sid + ': unsupported/unauthorized supplementary basis')
    seen_targets, seen_people, segment_counts = set(), set(), Counter()
    bin_count = min(5, len(expected), len(questions))
    bins = Counter()
    unit_segment = {u: s['id'] for s in segments for u in s['unit_ids']}
    positions = {u: i for i, u in enumerate(expected)}
    image_total = 0
    for q in questions:
        qid = q['id']
        check(bool(re.fullmatch(r'[a-z][a-z0-9-]{0,63}', qid)), qid + ': unsafe question ID')
        check(re.findall(r'〔(.*?)〕', q['prompt']) == [q['blank_reading']], qid + ': blank must match reading exactly once')
        check(bool(q['answer'].strip()) and bool(q['blank_reading'].strip()), qid + ': empty answer/reading')
        check(q['filled_sentence'] == q['prompt'].replace('〔' + q['blank_reading'] + '〕', q['answer']), qid + ': filled sentence mismatch')
        mentioned = {aliases[m.group()] for m in names_re.finditer(q['prompt'])} if names_re else set()
        check(set(q['character_ids']) == mentioned, qid + ': cast IDs must match names actually mentioned in prompt')
        seen_people.update(mentioned)
        scene = scenes.get(q['scene_id'])
        check(scene is not None, qid + ': unknown scene')
        if scene:
            check(set(q['character_ids']) <= set(scene['character_ids']), qid + ': character absent from scene context')
            uid = scene['unit_id']
            if uid in positions and bin_count:
                bins[min(bin_count - 1, positions[uid] * bin_count // len(expected))] += 1
            if uid in unit_segment:
                segment_counts[unit_segment[uid]] += 1
        check(bool(q['targets']), qid + ': no target readings')
        for occurrence in q['targets']:
            tid = occurrence['target_id']
            target = targets.get(tid)
            check(target is not None, qid + ': unknown target ' + tid)
            if target is None:
                continue
            seen_targets.add(tid)
            span = occurrence['answer_span']
            good_span = (isinstance(span, list) and len(span) == 2 and all(type(x) is int for x in span)
                         and 0 <= span[0] < span[1] <= len(q['answer']))
            check(good_span and q['answer'][span[0]:span[1]] == target['kanji'], qid + ': target span mismatch ' + tid)
            surface = occurrence.get('surface_reading', '')
            check(bool(surface), qid + ': missing surface reading ' + tid)
            if kana(surface) != kana(target['reading']):
                check(bool(occurrence.get('reading_note', '').strip()), qid + ': changed reading needs evidence note ' + tid)
        try:
            qhash = question_digest(book, q)
        except (KeyError, TypeError, ValueError):
            qhash = None
        review = q.get('review', {}).get('text', {})
        check(review.get('status') == 'pass' and bool(review.get('observations', '').strip()), qid + ': text not individually reviewed')
        check(qhash is not None and review.get('question_sha256') == qhash, qid + ': stale/missing text review fingerprint')
        if stage != 'images':
            continue
        image = q.get('image', {})
        check(image.get('generation_backend') == 'imagegen', qid + ': artwork must be generated with imagegen')
        check(bool(image.get('prompt', '').strip()), qid + ': no actual generation prompt')
        required = image.get('required_features', [])
        required_ids = {f['id'] for f in required}
        check(len(required_ids) == len(required), qid + ': duplicate image feature IDs')
        check({'scene_fidelity', 'characters', 'small_size', 'no_unwanted_text'} <= required_ids, qid + ': mandatory image checks missing')
        check(all(f.get('description', '').strip() for f in required), qid + ': empty feature description')
        review = q.get('review', {}).get('image', {})
        check(review.get('status') == 'pass', qid + ': image not reviewed/aligned')
        check(review.get('question_sha256') == qhash and qhash is not None, qid + ': stale image/question fingerprint')
        phash = hashlib.sha256(image.get('prompt', '').encode()).hexdigest()
        check(review.get('prompt_sha256') == phash, qid + ': stale image/prompt fingerprint')
        check(review.get('requirements_sha256') == digest(required), qid + ': stale image/requirements fingerprint')
        observations = review.get('features', [])
        check(len({x['feature_id'] for x in observations}) == len(observations), qid + ': duplicate image observations')
        check({x['feature_id'] for x in observations} == required_ids, qid + ': required features not all reviewed')
        check(all(x.get('status') == 'pass' and x.get('observation', '').strip() for x in observations), qid + ': image has pending/mismatched/empty observations')
        try:
            image_path = inside(base, image.get('source_png', ''))
            check(image_path.is_file(), qid + ': missing source PNG')
            if image_path.is_file():
                from PIL import Image
                with Image.open(image_path) as im:
                    check(im.format == 'PNG' and im.width == im.height, qid + ': source must be square PNG; do not crop automatically')
                    im.verify()
                check(review.get('source_sha256') == file_digest(image_path), qid + ': source image changed after review')
                image_total += 1
        except (ValueError, OSError) as exc:
            check(False, qid + ': invalid source image: ' + str(exc))
    countable = {people[x]['identity_id'] for x in seen_people if people[x].get('countable') is True}
    minimum = math.ceil(len(questions) * 3 / 5)
    check(len(countable) >= minimum, f'Cast requirement: {len(countable)} actual canonical characters; need {minimum}')
    missing = sorted(set(targets) - seen_targets)
    check(not missing, 'Missing target readings: ' + ', '.join(missing))
    try:
        plan = quota(book)
        for sid, target in plan.items():
            check(segment_counts[sid] >= 1 and abs(segment_counts[sid] - target) <= 1,
                  f'Story distribution {sid}: {segment_counts[sid]} questions; quota {target} (tolerance 1, minimum 1)')
    except ValueError as exc:
        plan = {}
        check(False, str(exc))
    check(len(bins) == bin_count, 'Questions omit a chronological portion of the work')
    return {'ok': not errors, 'stage': stage, 'errors': errors,
            'coverage': {'questions': len(questions), 'target_readings': len(targets), 'covered_readings': len(seen_targets),
                         'missing_target_ids': missing, 'cast_minimum': minimum, 'actual_characters': len(countable),
                         'expected_research_units': len(expected), 'detailed_units': sum(u.get('research_status') == 'detailed' for u in units.values()),
                         'segment_quotas': plan, 'segment_actual': dict(segment_counts), 'chronological_bins': dict(bins),
                         'source_images_checked': image_total},
            'limit': 'Mechanical checks audit records and hashes. Canon accuracy, readings and visual observations require actual source/visual review.'}


def export(book, base, destination, size):
    from PIL import Image, features
    report = validate(book, base, 'images')
    if not report['ok']:
        emit(report)
        return 1
    if not features.check('webp'):
        raise ValueError('Pillow must have WebP support')
    if size <= 0:
        raise ValueError('Export size must be positive')
    destination = destination.resolve()
    if destination.exists():
        raise ValueError('Choose a new output directory; existing exports are preserved')
    destination.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix='.' + destination.name + '.partial-', dir=destination.parent))
    for name in ('originals', 'png', 'webp'):
        (staging / name).mkdir()
    rows = []
    for q in book['questions']:
        qid = q['id']
        source = inside(base, q['image']['source_png'])
        original, png, webp = (f'{folder}/{qid}.{suffix}' for folder, suffix in [('originals', 'png'), ('png', 'png'), ('webp', 'webp')])
        shutil.copyfile(source, staging / original)
        with Image.open(source) as im:
            scaled = im.convert('RGBA').resize((size, size), Image.Resampling.LANCZOS)
            scaled.save(staging / png, format='PNG')
            scaled.save(staging / webp, format='WEBP', lossless=True, quality=100, method=6)
        with Image.open(staging / png) as a, Image.open(staging / webp) as b:
            if a.size != (size, size) or b.size != a.size or a.convert('RGBA').tobytes() != b.convert('RGBA').tobytes():
                raise ValueError('PNG/WebP pixel mismatch: ' + qid)
        rows.append({'id': qid, 'question': q['prompt'], 'answer': q['answer'], 'png': png, 'webp': webp,
                     'original': original, 'width': size, 'height': size, 'question_sha256': question_digest(book, q),
                     'png_sha256': file_digest(staging / png), 'webp_sha256': file_digest(staging / webp),
                     'source_sha256': file_digest(source), 'prompt_sha256': hashlib.sha256(q['image']['prompt'].encode()).hexdigest()})
    emit(book, staging / 'workbook.json')
    emit({'count': len(rows), 'size': size, 'generation_backend': 'imagegen', 'webp_encoding': 'lossless', 'images': rows}, staging / 'manifest.json')
    emit(report['coverage'], staging / 'coverage.json')
    emit(report, staging / 'validation.json')
    for filename, answer_mode in [('問題.md', False), ('解答.md', True)]:
        text = ['# ' + book['work']['title'] + (' 漢字書き取り・解答' if answer_mode else ' 漢字書き取り問題'), '']
        for row in rows:
            value = row['answer'] if answer_mode else row['question']
            text.append(f"{row['id']}. {value}")
        (staging / filename).write_text('\n'.join(text) + '\n', encoding='utf-8')
    with (staging / '問題と画像の対応.csv').open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', '問題文', '解答', 'PNG', 'WebP', '横px', '縦px'])
        writer.writerows([r[k] for k in ('id', 'question', 'answer', 'png', 'webp', 'width', 'height')] for r in rows)
    esc = html.escape
    cards = []
    for row in rows:
        cards.append(f'<article><h2>{esc(row["id"])}</h2><a href="{row["webp"]}"><img src="{row["webp"]}" width="{size}" height="{size}" alt="{esc(row["question"], quote=True)}" loading="lazy"></a><p>{esc(row["question"])}</p><details><summary>解答</summary>{esc(row["answer"])}</details><p><a href="{row["webp"]}" download>WebP</a></p></article>')
    page = '<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>漢字イラスト一覧</title><style>body{font-family:system-ui;line-height:1.7;padding:20px;background:#f6f4ef}main{display:flex;flex-wrap:wrap;gap:20px}article{width:max(240px,' + str(size + 32) + 'px);padding:16px;background:white;border-radius:12px}img{display:block;max-width:100%;height:auto}h2{font-size:16px}</style></head><body><h1>' + esc(book['work']['title']) + '</h1><p><a href="images-webp.zip">WebP一括</a></p><main>' + ''.join(cards) + '</main></body></html>'
    (staging / 'index.html').write_text(page, encoding='utf-8')
    for extension in ('png', 'webp'):
        with zipfile.ZipFile(staging / f'images-{extension}.zip', 'w', compression=zipfile.ZIP_DEFLATED) as z:
            for row in rows:
                z.write(staging / row[extension], row[extension])
            z.write(staging / '問題と画像の対応.csv', '問題と画像の対応.csv')
        with zipfile.ZipFile(staging / f'images-{extension}.zip') as z:
            if z.testzip() is not None or sum(n.endswith('.' + extension) for n in z.namelist()) != len(rows):
                raise ValueError('ZIP integrity/count failure')
    for link in re.findall(r'(?:href|src|srcset)="([^"]+)"', page):
        if not (staging / html.unescape(link)).is_file():
            raise ValueError('Broken gallery link: ' + link)
    staging.rename(destination)
    emit({'ok': True, 'output': str(destination), 'count': len(rows), 'size': size, 'formats': ['PNG', 'lossless WebP'],
          'checks': ['review fingerprints', 'dimensions', 'PNG/WebP pixel equality', 'gallery links', 'ZIP integrity']})
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    for command in ('extract', 'plan', 'hashes', 'validate', 'export'):
        child = sub.add_parser(command)
        child.add_argument('input', type=Path)
        if command in ('extract', 'hashes', 'validate'):
            child.add_argument('--output', type=Path)
        if command == 'validate':
            child.add_argument('--stage', choices=('text', 'images'), default='text')
        if command == 'export':
            child.add_argument('--output', type=Path, required=True)
            child.add_argument('--size', type=int, default=200)
    args = parser.parse_args()
    try:
        if args.command == 'extract':
            emit(extract(args.input), args.output)
            return 0
        book = read_json(args.input)
        base = args.input.resolve().parent
        if args.command == 'plan':
            emit({'questions': len(book['questions']), 'minimum_characters': math.ceil(len(book['questions']) * 3 / 5), 'segment_quotas': quota(book)})
        elif args.command == 'hashes':
            emit(fingerprints(book, base), args.output)
        elif args.command == 'validate':
            report = validate(book, base, args.stage)
            emit(report, args.output)
            return 0 if report['ok'] else 1
        else:
            return export(book, base, args.output, args.size)
        return 0
    except (ValueError, KeyError, TypeError, OSError, ImportError) as exc:
        emit({'ok': False, 'error': str(exc), 'kind': 'input-or-dependency-error'})
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
