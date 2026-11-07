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

function luminance(hex) {
  const channels = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

test("all selectable colors preserve four distinct tones from light to dark", () => {
  for (const color of ["#245f42", "#245da0", "#aa3d42", "#754b9e", "#505050", "#000000", "#ffffff", "#ffff00", "#00ffff", "#ff00ff"]) {
    for (const contrast of [20, 50, 75, 100]) {
      const palette = core.createPalette(color, contrast);
      assert.equal(new Set(palette).size, 4);
      assert.ok(palette.every(tone => /^#[0-9a-f]{6}$/i.test(tone)));
      const brightness = palette.map(luminance);
      for (let i = 0; i < 3; i++) assert.ok(brightness[i] > brightness[i + 1], `${color} at ${contrast}% must stay light-to-dark`);
    }
    const weak = core.createPalette(color, 20).map(luminance);
    const strong = core.createPalette(color, 100).map(luminance);
    assert.ok(strong[0] - strong[3] > weak[0] - weak[3]);
  }
});

test("grayscale remains neutral and contrast inputs stay in their supported range", () => {
  for (const tone of core.createPalette("#505050", 100)) {
    const channels = [tone.slice(1, 3), tone.slice(3, 5), tone.slice(5, 7)];
    assert.equal(new Set(channels).size, 1);
  }
  assert.deepEqual(core.createPalette("#245f42", 0), core.createPalette("#245f42", 20));
  assert.deepEqual(core.createPalette("#245f42", 1000), core.createPalette("#245f42", 100));
  assert.deepEqual(core.createPalette("#245f42", NaN), core.createPalette("#245f42", 75));
  assert.throws(() => core.createPalette("invalid", 75), /Invalid/);
});
