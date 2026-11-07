"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../concentration-core.js");
const diagram = id => core.diagrams.find(item => item.id === id);

test("six different diagrams contain exactly one answer per component and three distractors", () => {
  assert.equal(core.diagrams.length, 6);
  assert.equal(new Set(core.diagrams.map(item => item.id)).size, 6);
  assert.equal(new Set(core.diagrams.map(item => JSON.stringify(item.levels))).size, 6);
  assert.deepEqual(core.diagrams.filter(item => item.answer).map(item => item.answer).sort(), ["nutrients", "oxygen", "waste"]);
  assert.equal(core.diagrams.filter(item => item.answer === null).length, 3);
  for (const item of core.diagrams) {
    assert.equal(Object.keys(item.levels).length, 10);
    assert.ok(Object.values(item.levels).every(level => Number.isInteger(level) && level >= 0 && level <= 3));
  }
});

test("correct shading follows the lungs, post-meal portal vein, and kidney removal of urea", () => {
  const oxygen = core.diagrams.find(item => item.answer === "oxygen").levels;
  assert.ok(oxygen.pulmonaryVein > oxygen.pulmonaryArtery);
  assert.ok(oxygen.aorta > oxygen.venaCava);
  assert.equal(oxygen.venaCava, oxygen.pulmonaryArtery);
  assert.equal(oxygen.pulmonaryVein, oxygen.aorta);
  const nutrients = core.diagrams.find(item => item.answer === "nutrients").levels;
  assert.ok(nutrients.portalVein > nutrients.intestinalArtery);
  assert.ok(nutrients.portalVein > nutrients.hepaticVein);
  const waste = core.diagrams.find(item => item.answer === "waste").levels;
  assert.ok(waste.renalVein < waste.renalArtery);
  assert.ok(waste.hepaticVein > waste.portalVein);
});

test("three labels on the correct diagrams solve the round while distractors remain blank", () => {
  const answers = Object.fromEntries(core.diagrams.filter(item => item.answer).map(item => [item.id, item.answer]));
  assert.deepEqual(core.grade(answers), { placed: 3, correct: 3, wrong: 0, remaining: 0, solved: true });
  assert.equal(Object.keys(answers).length, 3);
});

test("blank distractors never count as answered labels; distractor placements are wrong", () => {
  assert.deepEqual(core.grade({}), { placed: 0, correct: 0, wrong: 0, remaining: 3, solved: false });
  let answers = {};
  const distractors = core.diagrams.filter(item => !item.answer);
  core.components.forEach((item, index) => { answers = core.assign(answers, distractors[index].id, item.id); });
  assert.deepEqual(core.grade(answers), { placed: 3, correct: 0, wrong: 3, remaining: 0, solved: false });
});

test("moving labels preserves uniqueness and swaps labels on two occupied diagrams", () => {
  let answers = core.assign({}, "pattern-d", "oxygen");
  answers = core.assign(answers, "pattern-b", "nutrients");
  const before = structuredClone(answers);
  answers = core.assign(answers, "pattern-b", "oxygen");
  assert.deepEqual(answers, { "pattern-d": "nutrients", "pattern-b": "oxygen" });
  assert.deepEqual(before, { "pattern-d": "oxygen", "pattern-b": "nutrients" });
  answers = core.assign(answers, "pattern-a", "oxygen");
  assert.deepEqual(answers, { "pattern-d": "nutrients", "pattern-a": "oxygen" });
  for (const id of core.diagrams.map(item => item.id)) {
    for (const item of core.components) {
      answers = core.assign(answers, id, item.id);
      assert.equal(new Set(Object.values(answers)).size, Object.keys(answers).length);
      assert.ok(Object.keys(answers).length <= 3);
    }
  }
});

test("every new round has all six diagrams once and a different order", () => {
  let seed = 7;
  const random = () => { seed = seed * 48271 % 2147483647; return seed / 2147483647; };
  let previous = [];
  for (let i = 0; i < 100; i++) {
    const next = core.shuffleDiagrams(previous, random);
    assert.deepEqual([...next].sort(), core.diagrams.map(item => item.id).sort());
    assert.notDeepEqual(next, previous);
    previous = next;
  }
  const constantOrder = core.shuffleDiagrams([], () => 0);
  assert.notDeepEqual(core.shuffleDiagrams(constantOrder, () => 0), constantOrder);
});

test("unknown diagrams and substances cannot create a placement", () => {
  assert.throws(() => core.assign({}, "missing", "oxygen"), /Unknown/);
  assert.throws(() => core.assign({}, "pattern-a", "unknown"), /Unknown/);
  assert.equal(diagram("pattern-e").answer, null);
});
