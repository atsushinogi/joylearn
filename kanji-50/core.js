(function (root) {
  'use strict';

  const normalize = value => String(value ?? '').normalize('NFKC').replace(/\s+/gu, '');
  const isKanji = value => /^[\p{Script=Han}々〆〇]+$/u.test(value);

  function compileQuestion(raw, image) {
    const { id, number, prompt, answer, blank_reading: reading } = raw;
    const marker = `〔${reading}〕`;
    if (!answer || !reading || !id || prompt.split(marker).length !== 2 || (prompt.match(/〔/g) || []).length !== 1) {
      throw new Error(`${id}: 問題・解答・読みの対応を確認してください。`);
    }
    const tokens = answer.match(/[\p{Script=Han}々〆〇]+|[^\p{Script=Han}々〆〇]+/gu);
    const answers = [], hints = [], wordParts = [];
    let cursor = 0;
    tokens.forEach((token, i) => {
      if (isKanji(token)) {
        const next = tokens[i + 1];
        const end = next ? reading.indexOf(next, cursor) : reading.length;
        if (end <= cursor) throw new Error(`${id}: 送りがなと読みが一致しません。`);
        hints.push(reading.slice(cursor, end));
        wordParts.push({ blank: answers.length });
        answers.push(token);
        cursor = end;
      } else {
        if (!reading.startsWith(token, cursor)) throw new Error(`${id}: 送りがなを確認してください。`);
        wordParts.push({ text: token });
        cursor += token.length;
      }
    });
    if (cursor !== reading.length || !answers.length) throw new Error(`${id}: 読みを分割できません。`);
    const [before, after] = prompt.split(marker);
    return { id, number, prompt, answer, reading, image, parts: [{ text: before }, ...wordParts, { text: after }], wordParts, answers, hints };
  }

  function makeSession(course, order = 'ordered', selectedIds, rng = Math.random) {
    const ids = selectedIds ? [...selectedIds] : course.questions.map(q => q.id);
    const byId = new Map(course.questions.map(q => [q.id, q]));
    if (!ids.length || new Set(ids).size !== ids.length || ids.some(id => !byId.has(id))) throw new Error('問題の組み合わせが正しくありません。');
    if (order === 'shuffle') {
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
    }
    return { version: 1, courseId: course.id, revision: course.revision, mode: selectedIds ? 'review' : 'full', order, ids, responses: ids.map(id => byId.get(id).answers.map(() => '')), current: 0, status: 'active' };
  }

  function restoreSession(course, value) {
    if (!value || value.version !== 1 || value.courseId !== course.id || value.revision !== course.revision) return null;
    if (!['active', 'completed'].includes(value.status) || !['full', 'review'].includes(value.mode) || !['ordered', 'shuffle'].includes(value.order)) return null;
    const byId = new Map(course.questions.map(q => [q.id, q]));
    if (!Array.isArray(value.ids) || !value.ids.length || new Set(value.ids).size !== value.ids.length || value.ids.some(id => !byId.has(id))) return null;
    if (value.mode === 'full' && value.ids.length !== course.questions.length) return null;
    if (!Number.isInteger(value.current) || value.current < 0 || value.current >= value.ids.length) return null;
    if (!Array.isArray(value.responses) || value.responses.length !== value.ids.length) return null;
    if (value.responses.some((row, i) => !Array.isArray(row) || row.length !== byId.get(value.ids[i]).answers.length || row.some(s => typeof s !== 'string' || s.length > 128))) return null;
    return JSON.parse(JSON.stringify(value));
  }

  function isAnswered(response) { return response.every(value => !!normalize(value)); }

  function word(question, response, empty = '□') {
    return question.wordParts.map(p => p.text ?? (response[p.blank] || empty.repeat(Array.from(question.answers[p.blank]).length))).join('');
  }

  function grade(course, session) {
    const byId = new Map(course.questions.map(q => [q.id, q]));
    const results = session.ids.map((id, i) => {
      const question = byId.get(id), values = session.responses[i];
      const correct = question.answers.every((answer, j) => normalize(answer) === normalize(values[j]));
      return { question, values, correct, userWord: word(question, values) };
    });
    const correct = results.filter(r => r.correct).length;
    return { results, correct, total: results.length, score: Math.round(correct / results.length * 100) };
  }

  const api = { normalize, compileQuestion, makeSession, restoreSession, isAnswered, word, grade };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KanjiStoryCore = api;
})(globalThis);
