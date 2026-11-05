"""Synthetic fixtures test audits/exports, never claim real artwork was reviewed."""
from copy import deepcopy
from contextlib import redirect_stdout
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('workbook', Path(__file__).with_name('workbook.py'))
w = importlib.util.module_from_spec(spec)
spec.loader.exec_module(w)


def fixture(base, count=5, characters=3, images=False):
    cast = [{'id': f'person-{i}', 'identity_id': f'identity-{i}', 'name': f'人物{i}',
             'aliases': [f'別名{i}'], 'identity_note': 'Synthetic distinct identity', 'countable': True}
            for i in range(characters)]
    ids = [p['id'] for p in cast]
    sources = {'source': {'path': 'synthetic-notes.txt', 'note': 'Synthetic fixture only', 'access': 'detailed'}}
    book = {'schema_version': 1, 'sources': sources,
            'targets': [{'id': 't-book', 'kanji': '本', 'reading': 'ホン', 'reading_type': 'on',
                         'evidence_source_ids': ['source'], 'evidence_note': 'Synthetic reading entry', 'confirmed': True}],
            'cast': cast,
            'work': {'title': 'Synthetic test', 'edition': 'fixture', 'scope': 'all five units',
                     'researched_at': '2026-11-05', 'index_source_ids': ['source'],
                     'expected_unit_ids': [f'unit-{i}' for i in range(5)],
                     'units': [{'id': f'unit-{i}', 'research_status': 'detailed',
                                'events': ['Synthetic event note'], 'setting_notes': [],
                                'character_ids': ids, 'source_ids': ['source']} for i in range(5)],
                     'segments': [{'id': f'arc-{i}', 'title': f'Arc {i}', 'unit_ids': [f'unit-{i}']} for i in range(5)]},
            'scenes': [{'id': f'scene-{i}', 'unit_id': f'unit-{i}', 'basis_type': 'scene',
                        'description': 'Synthetic scene', 'period': 'fixture present',
                        'character_ids': ids, 'source_ids': ['source'],
                        'evidence_note': 'Synthetic evidence', 'verified': True} for i in range(5)],
            'questions': []}
    for i in range(count):
        person = cast[i % characters]
        q = {'id': f'q{i + 1:03}', 'prompt': person['name'] + 'は〔ほん〕を読む。',
             'blank_reading': 'ほん', 'answer': '本', 'filled_sentence': person['name'] + 'は本を読む。',
             'targets': [{'target_id': 't-book', 'answer_span': [0, 1], 'surface_reading': 'ほん'}],
             'character_ids': [person['id']], 'scene_id': f'scene-{i % 5}', 'review': {}}
        if images:
            from PIL import Image
            source = base / f'{q["id"]}.png'
            im = Image.new('RGBA', (16, 16))
            im.putdata([(x * 16, y * 16, i * 10, 255 if x % 2 else 128) for y in range(16) for x in range(16)])
            im.save(source)
            q['image'] = {'generation_backend': 'imagegen', 'prompt': 'Synthetic prompt, not a real generation record',
                          'source_png': source.name,
                          'required_features': [{'id': name, 'description': 'Synthetic requirement: ' + name, 'critical': True}
                                                for name in ('scene_fidelity', 'characters', 'small_size', 'no_unwanted_text')]}
        book['questions'].append(q)
    for q in book['questions']:
        q['review']['text'] = {'status': 'pass', 'question_sha256': w.question_digest(book, q),
                               'observations': 'Synthetic test review; not an actual content judgment'}
        if images:
            image = q['image']
            q['review']['image'] = {'status': 'pass', 'question_sha256': w.question_digest(book, q),
                                    'prompt_sha256': w.hashlib.sha256(image['prompt'].encode()).hexdigest(),
                                    'requirements_sha256': w.digest(image['required_features']),
                                    'source_sha256': w.file_digest(base / image['source_png']),
                                    'features': [{'feature_id': f['id'], 'status': 'pass',
                                                  'observation': 'Synthetic observation: ' + f['id']}
                                                 for f in image['required_features']]}
    return book


class Audits(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.base = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def errors(self, book, stage='text'):
        return '\n'.join(w.validate(book, self.base, stage)['errors'])

    def test_53_questions_need_32_distinct_characters(self):
        book = fixture(self.base, count=53, characters=32)
        self.assertTrue(w.validate(book, self.base)['ok'])
        report = w.validate(fixture(self.base, count=53, characters=30), self.base)
        self.assertFalse(report['ok'])
        self.assertEqual(report['coverage']['cast_minimum'], 32)
        book['cast'][1]['identity_id'] = book['cast'][0]['identity_id']
        self.assertIn('need 32', self.errors(book))

    def test_roster_names_do_not_count_unless_in_prompt(self):
        book = fixture(self.base)
        book['cast'].append({'id': 'unused', 'identity_id': 'unused', 'name': '未登場人物',
                             'aliases': [], 'identity_note': 'Fixture', 'countable': True})
        self.assertEqual(w.validate(book, self.base)['coverage']['actual_characters'], 3)
        book['questions'][0]['character_ids'].append('unused')
        self.assertIn('actually mentioned', self.errors(book))

    def test_missing_and_duplicate_readings(self):
        book = fixture(self.base)
        extra = deepcopy(book['targets'][0]); extra.update(id='t-other', kanji='日', reading='ひ')
        book['targets'].append(extra)
        self.assertIn('Missing target readings: t-other', self.errors(book))
        extra.update(kanji='本', reading='ほん')
        self.assertIn('Duplicate target kanji/readings', self.errors(book))

    def test_unread_late_unit_and_false_synopsis_completion(self):
        book = fixture(self.base)
        book['work']['units'][-1]['research_status'] = 'summary_only'
        self.assertIn('not researched in detail', self.errors(book))
        book['work']['units'].pop()
        self.assertIn('complete source catalog', self.errors(book))
        book = fixture(self.base)
        book['sources']['source']['access'] = 'synopsis'
        self.assertIn('only index/synopsis', self.errors(book))

    def test_chronological_bias_even_with_one_large_arc(self):
        book = fixture(self.base)
        book['work']['segments'] = [{'id': 'whole', 'title': 'Whole', 'unit_ids': book['work']['expected_unit_ids']}]
        for q in book['questions']:
            q['scene_id'] = 'scene-0'
        self.assertIn('chronological portion', self.errors(book))

    def test_blank_span_and_reading_normalization_errors(self):
        book = fixture(self.base)
        book['questions'][0]['targets'][0]['answer_span'] = [1, 2]
        self.assertIn('target span mismatch', self.errors(book))
        book['questions'][0]['blank_reading'] = 'ほか'
        self.assertIn('blank must match', self.errors(book))

    def test_scene_or_cast_changes_invalidate_text_review(self):
        book = fixture(self.base)
        book['scenes'][0]['period'] = 'Different time'
        self.assertIn('stale/missing text', self.errors(book))
        book = fixture(self.base)
        book['cast'][0]['appearance_by_period'] = {'student': 'Changed clothing'}
        self.assertIn('stale/missing text', self.errors(book))

    def test_export_blocks_pending_images_and_detects_stale_inputs(self):
        book = fixture(self.base, images=True)
        self.assertTrue(w.validate(book, self.base, 'images')['ok'])
        q = book['questions'][0]
        q['review']['image']['features'][0]['status'] = 'mismatch'
        self.assertIn('pending/mismatched', self.errors(book, 'images'))
        with redirect_stdout(io.StringIO()):
            self.assertEqual(w.export(book, self.base, self.base / 'blocked', 200), 1)
        self.assertFalse((self.base / 'blocked').exists())
        q['review']['image']['features'][0]['status'] = 'pass'
        q['image']['prompt'] += ' revised'
        self.assertIn('stale image/prompt', self.errors(book, 'images'))
        q['image']['required_features'][0]['description'] = 'Changed requirement'
        self.assertIn('stale image/requirements', self.errors(book, 'images'))
        with (self.base / q['image']['source_png']).open('ab') as f:
            f.write(b'changed')
        self.assertIn('source image changed', self.errors(book, 'images'))

    def test_source_path_escape_is_rejected(self):
        book = fixture(self.base, images=True)
        book['questions'][0]['image']['source_png'] = '../outside.png'
        self.assertIn('escapes', self.errors(book, 'images'))

    def test_png_webp_export_is_lossless_and_protects_prior_output(self):
        from PIL import Image
        book = fixture(self.base, images=True)
        dest = self.base / 'export-v1'
        with redirect_stdout(io.StringIO()):
            self.assertEqual(w.export(book, self.base, dest, 200), 0)
        manifest = w.read_json(dest / 'manifest.json')
        self.assertEqual(len(manifest['images']), 5)
        for row in manifest['images']:
            with Image.open(dest / row['png']) as a, Image.open(dest / row['webp']) as b:
                self.assertEqual(a.size, (200, 200))
                self.assertEqual(a.convert('RGBA').tobytes(), b.convert('RGBA').tobytes())
        for ext in ('png', 'webp'):
            with zipfile.ZipFile(dest / f'images-{ext}.zip') as z:
                self.assertIsNone(z.testzip())
                self.assertEqual(sum(n.endswith('.' + ext) for n in z.namelist()), 5)
        with self.assertRaises(ValueError), redirect_stdout(io.StringIO()):
            w.export(book, self.base, dest, 200)

    def test_explicit_readings_deduplicate_kana_variants_and_keep_source_examples(self):
        path = self.base / 'repeated.json'
        w.emit({'questions': [
            {'target_character': '得', 'target_reading': 'トク', 'answer': '説得', 'reading_in_prompt': 'せっとく'},
            {'target_character': '得', 'target_reading': 'とく', 'answer': '納得', 'reading_in_prompt': 'なっとく'}]}, path)
        result = w.extract(path)
        self.assertEqual(result['count'], 1)
        entries = result['candidates'][0]['occurrences']
        self.assertEqual(len(entries), 2)
        self.assertEqual(entries[1]['original_values']['answer'], '納得')

    def test_raw_words_are_not_guessed_to_be_character_readings(self):
        path = self.base / 'source.json'
        w.emit({'questions': [{'targets': [{'answer': '表現', 'reading': 'ひょうげん'}]}]}, path)
        result = w.extract(path)
        self.assertFalse(result['confirmed'])
        self.assertEqual(result['candidates'][0]['kind'], 'word')
        self.assertNotIn('kanji', result['candidates'][0])
        path = self.base / 'plain.txt'; path.write_text('アキは〔える〕。')
        self.assertEqual(w.extract(path)['candidates'][0]['kind'], 'unresolved')


if __name__ == '__main__':
    unittest.main()
