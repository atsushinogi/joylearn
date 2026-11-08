(function (root) {
  'use strict';

  function gcd(a, b) {
    while (b) [a, b] = [b, a % b];
    return a;
  }

  function simplify(a, b) {
    const divisor = gcd(a, b);
    return [a / divisor, b / divisor];
  }

  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function createPool(level) {
    const pool = [];
    for (let u = 1; u <= 5; u++) {
      for (let v = 1; v <= 5; v++) {
        for (let s = 1; s <= 5; s++) {
          for (let t = 1; t <= 5; t++) {
            if (gcd(u, v) !== 1 || gcd(s, t) !== 1) continue;
            const common = u * t / gcd(u, t);
            if (level === 'basic' && u !== t) continue;
            if (level === 'advanced' && (u === t || u % t === 0 || t % u === 0 || common > 12)) continue;
            const weights = { a: s * common / t, b: v * common / u, c: common };
            const answer = simplify(weights.b, weights.a);
            if (Math.max(weights.a, weights.b, weights.c) > 18 || Math.max(...answer) > (level === 'basic' ? 6 : 9)) continue;
            if (weights.a / weights.b > 5 || weights.b / weights.a > 5) continue;
            pool.push({ level, first: [u, v], second: [s, t], common, weights, answer, key: `${u}:${v}/${s}:${t}` });
          }
        }
      }
    }
    return pool;
  }

  function makeChoices(answer, random = Math.random) {
    const correctKey = answer.join(':');
    const distractors = new Map();
    function add(a, b) {
      const ratio = simplify(a, b);
      const key = ratio.join(':');
      if (key !== correctKey && Math.max(...ratio) <= 12) distractors.set(key, ratio);
    }
    add(answer[1], answer[0]);
    add(answer[0] + 1, answer[1]);
    add(answer[0], answer[1] + 1);
    for (let a = 1; a <= 6; a++) {
      for (let b = 1; b <= 6; b++) add(a, b);
    }
    const alternatives = shuffle([...distractors.values()], random).slice(0, 3);
    return shuffle([answer, ...alternatives], random);
  }

  function createSession(level, random = Math.random, previousKeys = []) {
    const pool = createPool(level);
    const previous = new Set(previousKeys);
    const fresh = pool.filter(question => !previous.has(question.key));
    return shuffle(fresh.length >= 5 ? fresh : pool, random).slice(0, 5).map(question => ({
      ...question,
      choices: makeChoices(question.answer, random)
    }));
  }

  const api = { gcd, simplify, shuffle, createPool, makeChoices, createSession };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RatioQuiz = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
