'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('../core.js');
const context = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../question-bank.js'), 'utf8'), context);
const courses = JSON.parse(JSON.stringify(context.KANJI_STORY_BANK.courses));
const make = (answer, reading) => core.compileQuestion({ id: 'q001', number: 1, prompt: `答えは〔${reading}〕です。`, answer, blank_reading: reading }, 'image.webp');

test('送りがなを固定し、漢字の部分だけを回答欄にする', () => {
  const verb = make('得る', 'える');
  assert.deepEqual(verb.answers, ['得']);
  assert.deepEqual(verb.hints, ['え']);
  assert.equal(core.word(verb, ['得']), '得る');
  assert.equal(core.word(verb, ['']), '□る');
  const compound = make('持て余す', 'もてあます');
  assert.deepEqual(compound.answers, ['持', '余']);
  assert.deepEqual(compound.hints, ['も', 'あま']);
  assert.equal(core.word(compound, ['持', '余']), '持て余す');
  assert.equal(core.word(compound, ['持', '']), '持て□す');
  assert.deepEqual(make('説得', 'せっとく').answers, ['説得']);
  assert.throws(() => make('得る', 'えた'), /送りがな|一致/);
});

test('通常出題は53問を重複なく保ち、復習は指定した問題だけを出す', () => {
  const course = courses[0];
  const normal = core.makeSession(course);
  const shuffled = core.makeSession(course, 'shuffle', undefined, () => 0);
  assert.equal(normal.ids.length, 53);
  assert.equal(shuffled.ids.length, 53);
  assert.deepEqual([...shuffled.ids].sort(), [...normal.ids].sort());
  assert.notDeepEqual(shuffled.ids, normal.ids);
  const review = core.makeSession(course, 'ordered', ['q002', 'q028']);
  assert.equal(review.mode, 'review');
  assert.deepEqual(review.ids, ['q002', 'q028']);
  assert.deepEqual(review.responses, [[''], ['', '']]);
  assert.throws(() => core.makeSession(course, 'ordered', ['q999']));
  assert.throws(() => core.makeSession(course, 'ordered', ['q001', 'q001']));
});

test('全空欄の一致で採点し、途中回答・誤字・送りがなの重複は不正解にする', () => {
  const course = courses[1], session = core.makeSession(course);
  session.responses = course.questions.map(q => [...q.answers]);
  assert.equal(core.grade(course, session).score, 100);
  session.responses[27][1] = '預';
  const result = core.grade(course, session);
  assert.equal(result.correct, 52);
  assert.equal(result.score, 98);
  assert.equal(result.results[27].userWord, '持て預す');
  session.responses[27][1] = '';
  assert.equal(core.grade(course, session).results[27].correct, false);
  session.responses[1][0] = '得る';
  assert.equal(core.grade(course, session).results[1].correct, false);
  session.responses[0][0] = ' 説　得 ';
  assert.equal(core.grade(course, session).results[0].correct, true);
});

test('保存の復元では別作品・古い教材・欠落や重複のある問題列を拒否する', () => {
  const a = courses[0], b = courses[1], session = core.makeSession(a);
  session.responses[0][0] = '説得'; session.current = 27;
  const restored = core.restoreSession(a, session);
  assert.equal(restored.current, 27);
  assert.equal(restored.responses[0][0], '説得');
  restored.responses[0][0] = '説';
  assert.equal(session.responses[0][0], '説得');
  assert.equal(core.restoreSession(b, session), null);
  assert.equal(core.restoreSession(a, { ...session, revision: 'old' }), null);
  assert.equal(core.restoreSession(a, { ...session, current: 53 }), null);
  assert.equal(core.restoreSession(a, { ...session, ids: session.ids.slice(1) }), null);
  assert.equal(core.restoreSession(a, { ...session, ids: session.ids.map(() => 'q001') }), null);
  assert.equal(core.restoreSession(a, { ...session, responses: [] }), null);
  const review = core.makeSession(a, 'ordered', ['q028']);
  assert.equal(core.restoreSession(a, review).ids.length, 1);
});
