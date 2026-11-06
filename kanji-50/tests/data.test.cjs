'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const context = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'question-bank.js'), 'utf8'), context);
const bank = JSON.parse(JSON.stringify(context.KANJI_STORY_BANK));

test('両作品の原教材53問と画像を一対一に保ち、読みと解答入り全文を復元できる', () => {
  assert.equal(bank.courses.length, 2);
  for (const course of bank.courses) {
    const source = JSON.parse(fs.readFileSync(path.join(root, course.id, 'workbook.json')));
    assert.equal(course.questions.length, 53);
    assert.equal(new Set(course.questions.map(q => q.id)).size, 53);
    course.questions.forEach((q, i) => {
      const raw = source.questions[i];
      assert.equal(q.id, raw.id);
      assert.equal(q.prompt, raw.prompt);
      assert.equal(q.answer, raw.answer);
      assert.equal(q.parts.map(p => p.text ?? q.answers[p.blank]).join(''), raw.filled_sentence);
      assert.equal(q.wordParts.map(p => p.reading ?? p.text ?? q.hints[p.blank]).join(''), raw.blank_reading);
      const targets = [...raw.targets].sort((a, b) => a.answer_span[0] - b.answer_span[0]);
      assert.deepEqual(q.answers, targets.map(target => raw.answer.slice(...target.answer_span)), `${course.id}/${q.id}: 対象漢字だけを出題`);
      assert(fs.statSync(path.join(root, q.image)).isFile(), q.image);
    });
  }
});

test('全解答の漢字が同梱の手書き認識データにあり、エンジンとライセンスを保全する', () => {
  const ref = { KanjiCanvas: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'vendor/ref-patterns.js'), 'utf8'), ref);
  const supported = new Set(ref.KanjiCanvas.refPatterns.map(p => p[0]));
  for (const course of bank.courses) for (const q of course.questions) {
    for (const char of q.answers.join('')) assert(supported.has(char), `手書き認識の対象外: ${char}`);
  }
  for (const name of ['kanji-canvas.js', 'ref-patterns.js', 'LICENSE.txt']) {
    const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
    assert.equal(hash(path.join(root, 'vendor', name)), hash(path.join(root, '../kanji-test/dist/vendor', name)));
  }
});
