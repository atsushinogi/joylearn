const test = require('node:test');
const assert = require('node:assert/strict');
const { createPool, createSession, gcd, simplify, orientQuestion, SIDES } = require('../core.js');

for (const level of ['basic', 'advanced']) {
  test(`${level}: all generated questions satisfy Ceva and the level constraints`, () => {
    const pool = createPool(level);
    assert.ok(pool.length >= 10);
    for (const question of pool) {
      const [u, v] = question.first;
      const [s, t] = question.second;
      const [x, y] = question.answer;
      const { a, b, c } = question.weights;
      assert.equal(u * s * x, v * t * y);
      assert.equal(u * b, v * c);
      assert.equal(s * c, t * a);
      assert.equal(x * a, y * b);
      assert.equal(gcd(u, v), 1);
      assert.equal(gcd(s, t), 1);
      assert.ok(Math.max(a, b, c) <= 18);
      assert.ok(Math.max(x, y) <= (level === 'basic' ? 6 : 9));
      if (level === 'basic') assert.equal(u, t);
      else {
        assert.notEqual(u % t, 0);
        assert.notEqual(t % u, 0);
        assert.equal(question.common, u * t / gcd(u, t));
        assert.ok(question.common <= 12);
      }
    }
  });

  test(`${level}: every target side keeps the known ratios, answer and common area consistent`, () => {
    for (const original of createPool(level)) {
      for (const target of Object.keys(SIDES)) {
        const question = orientQuestion(original, target);
        const { a, b, c } = question.weights;
        const actualRatios = { ab: [b, a], bc: [c, b], ca: [a, c] };
        assert.deepEqual(simplify(...actualRatios[target]), question.answer);
        assert.equal(question.known.length, 2);
        assert.equal(new Set([target, ...question.known.map(known => known.side)]).size, 3);
        for (const known of question.known) {
          assert.deepEqual(simplify(...actualRatios[known.side]), known.ratio);
        }
        const [common, first, second] = question.areaKeys.map(key => question.weights[key]);
        assert.equal(common, question.common);
        assert.deepEqual(simplify(common, first), question.first);
        assert.deepEqual(simplify(second, common), question.second);
        assert.deepEqual(simplify(first, second), question.answer);
        assert.equal(common / question.first[0], first / question.first[1]);
        assert.equal(common / question.second[1], second / question.second[0]);
      }
    }
  });

  test(`${level}: sessions have five different questions and four inequivalent choices`, () => {
    let seed = 12345;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    let previousKeys = [];
    const answerPositions = new Set();
    for (let round = 0; round < 100; round++) {
      const questions = createSession(level, random, previousKeys);
      assert.equal(questions.length, 5);
      assert.equal(new Set(questions.map(question => question.key)).size, 5);
      assert.equal(new Set(questions.map(question => question.target)).size, 3);
      for (const side of Object.keys(SIDES)) {
        const count = questions.filter(question => question.target === side).length;
        assert.ok(count >= 1 && count <= 2);
      }
      for (const question of questions) {
        assert.ok(!previousKeys.includes(question.key));
        assert.equal(question.choices.length, 4);
        assert.equal(new Set(question.choices.map(choice => simplify(...choice).join(':'))).size, 4);
        const correct = question.choices.filter(choice => choice[0] * question.answer[1] === choice[1] * question.answer[0]);
        assert.equal(correct.length, 1);
        answerPositions.add(question.choices.indexOf(correct[0]));
      }
      previousKeys = questions.map(question => question.key);
    }
    assert.equal(answerPositions.size, 4);
  });
}
