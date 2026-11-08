const test = require('node:test');
const assert = require('node:assert/strict');
const { createPool, createSession, gcd, simplify } = require('../core.js');

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

  test(`${level}: sessions have five different questions and four inequivalent choices`, () => {
    let seed = 12345;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    let previousKeys = [];
    const answerPositions = new Set();
    for (let round = 0; round < 100; round++) {
      const questions = createSession(level, random, previousKeys);
      assert.equal(questions.length, 5);
      assert.equal(new Set(questions.map(question => question.key)).size, 5);
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
