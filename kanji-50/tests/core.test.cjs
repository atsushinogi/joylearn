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

test('対象漢字だけを空欄にし、熟語の他の漢字は表示して採点対象から外す', () => {
  const course = courses[1];
  const altar = course.questions.find(q => q.id === 'q029');
  assert.deepEqual(altar.answers, ['仏']);
  assert.deepEqual(altar.hints, ['ぶつ']);
  assert.equal(core.word(altar, ['']), '□壇');
  assert.equal(core.word(altar, ['仏']), '仏壇');
  assert(altar.parts.some(part => part.text === '壇'));
  const session = core.makeSession(course, 'ordered', ['q029']);
  session.responses = [['仏']];
  assert.equal(core.grade(course, session).score, 100);
  session.responses = [['仏壇']];
  assert.equal(core.grade(course, session).score, 0);

  const surplus = course.questions.find(q => q.id === 'q028');
  assert.deepEqual(surplus.answers, ['余']);
  assert.equal(core.word(surplus, ['']), '持て□す');
  assert.deepEqual(course.questions[0].answers, ['得']);
  assert.equal(core.word(course.questions[0], ['']), '説□');
  const buddhism = courses[0].questions.find(q => q.id === 'q029');
  assert.deepEqual(buddhism.answers, ['仏']);
  assert.deepEqual(buddhism.hints, ['ぶっ']);
  assert.equal(core.word(buddhism, ['']), '□教');
});

test('対象漢字の範囲や読みが不正な教材は生成しない', () => {
  const raw = { id: 'q029', number: 29, prompt: '〔ぶつだん〕に手を合わせる。', answer: '仏壇', blank_reading: 'ぶつだん',
    targets: [{ target_id: 't029', answer_span: [0, 1], surface_reading: 'ぶつ' }] };
  assert.deepEqual(core.compileQuestion(raw, 'image.webp').answers, ['仏']);
  assert.throws(() => core.compileQuestion({ ...raw, targets: [] }, 'image.webp'), /対象漢字/);
  assert.throws(() => core.compileQuestion({ ...raw, targets: [{ answer_span: [0, 3] }] }, 'image.webp'), /対象漢字/);
  assert.throws(() => core.compileQuestion({ ...raw, targets: [...raw.targets, ...raw.targets] }, 'image.webp'), /対象漢字/);
  assert.throws(() => core.compileQuestion({ ...raw, targets: [{ ...raw.targets[0], surface_reading: 'だん' }] }, 'image.webp'), /対象漢字/);
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
  assert.deepEqual(review.responses, [[''], ['']]);
  assert.throws(() => core.makeSession(course, 'ordered', ['q999']));
  assert.throws(() => core.makeSession(course, 'ordered', ['q001', 'q001']));
});

test('全空欄の一致で採点し、途中回答・誤字・送りがなの重複は不正解にする', () => {
  const course = courses[1], session = core.makeSession(course);
  session.responses = course.questions.map(q => [...q.answers]);
  assert.equal(core.grade(course, session).score, 100);
  session.responses[27][0] = '預';
  const result = core.grade(course, session);
  assert.equal(result.correct, 52);
  assert.equal(result.score, 98);
  assert.equal(result.results[27].userWord, '持て預す');
  session.responses[27][0] = '';
  assert.equal(core.grade(course, session).results[27].correct, false);
  session.responses[1][0] = '得る';
  assert.equal(core.grade(course, session).results[1].correct, false);
  session.responses[0][0] = ' 得　 ';
  assert.equal(core.grade(course, session).results[0].correct, true);
});

test('保存の復元では別作品・古い教材・欠落や重複のある問題列を拒否する', () => {
  const a = courses[0], b = courses[1], session = core.makeSession(a);
  session.responses[0][0] = '得'; session.current = 27;
  const restored = core.restoreSession(a, session);
  assert.equal(restored.current, 27);
  assert.equal(restored.responses[0][0], '得');
  restored.responses[0][0] = '説';
  assert.equal(session.responses[0][0], '得');
  assert.equal(core.restoreSession(b, session), null);
  assert.equal(core.restoreSession(a, { ...session, revision: 'old' }), null);
  assert.equal(core.restoreSession(a, { ...session, current: 53 }), null);
  assert.equal(core.restoreSession(a, { ...session, ids: session.ids.slice(1) }), null);
  assert.equal(core.restoreSession(a, { ...session, ids: session.ids.map(() => 'q001') }), null);
  assert.equal(core.restoreSession(a, { ...session, responses: [] }), null);
  const review = core.makeSession(a, 'ordered', ['q028']);
  assert.equal(core.restoreSession(a, review).ids.length, 1);
});

test('熟語全体を答えていた旧版の途中保存から対象漢字の回答と位置を引き継ぐ', () => {
  const course = courses[1];
  const previous = { ...course, revision: course.previousRevision, questions: course.questions.map(q =>
    core.compileQuestion({ id: q.id, number: q.number, prompt: q.prompt, answer: q.answer, blank_reading: q.reading }, q.image)) };
  const saved = core.makeSession(previous);
  saved.current = 28;
  saved.responses[0] = ['説得'];
  saved.responses[27] = ['持', '余'];
  saved.responses[28] = ['仏壇'];
  const restored = core.restoreSession(course, saved);
  assert.equal(restored.current, 28);
  assert.equal(restored.revision, course.revision);
  assert.deepEqual(restored.responses[0], ['得']);
  assert.deepEqual(restored.responses[27], ['余']);
  assert.deepEqual(restored.responses[28], ['仏']);
  assert.deepEqual(saved.responses[28], ['仏壇']);
  saved.responses[28] = ['仏'];
  assert.deepEqual(core.restoreSession(course, saved).responses[28], ['']);
  saved.responses[28] = [];
  assert.equal(core.restoreSession(course, saved), null);

  const review = core.makeSession(previous, 'ordered', ['q029']);
  review.responses = [['仏壇']]; review.status = 'completed';
  const completed = core.restoreSession(course, review);
  assert.equal(completed.status, 'completed');
  assert.equal(core.grade(course, completed).score, 100);
});
