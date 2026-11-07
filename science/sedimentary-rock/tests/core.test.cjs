"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { emptyAnswers, placeAnswer, clearAnswer, gradeAnswers } = require("../quiz-core.js");
const rocks = require("../rocks.js");
const ids = rocks.map(rock => rock.id);

test("the image provides six sedimentary rocks and two metamorphic rocks", () => {
  assert.equal(rocks.length, 8);
  assert.equal(rocks.filter(rock => rock.category === "堆積岩").length, 6);
  assert.equal(rocks.filter(rock => rock.category === "変成岩").length, 2);
  assert.equal(new Set(ids).size, 8);
});

test("names and descriptions are graded independently across sixteen fields", () => {
  let answers = emptyAnswers();
  answers = placeAnswer(answers, "name", "mudstone", "mudstone", ids);
  answers = placeAnswer(answers, "description", "mudstone", "sandstone", ids);
  const grade = gradeAnswers(answers, ids);
  assert.deepEqual([grade.total, grade.filled, grade.correct, grade.wrong, grade.empty], [16, 2, 1, 1, 14]);
  assert.equal(grade.fields.find(field => field.id === "mudstone" && field.kind === "description").result, "wrong");
});

test("moving a used choice to another occupied field swaps answers of the same kind", () => {
  let answers = emptyAnswers();
  answers = placeAnswer(answers, "name", "mudstone", "sandstone", ids);
  answers = placeAnswer(answers, "name", "sandstone", "mudstone", ids);
  answers = placeAnswer(answers, "description", "mudstone", "sandstone", ids);
  const previous = structuredClone(answers);
  const next = placeAnswer(answers, "name", "mudstone", "mudstone", ids);
  assert.deepEqual(next.name, { mudstone: "mudstone", sandstone: "sandstone" });
  assert.deepEqual(next.description, previous.description);
  assert.deepEqual(answers, previous, "the caller's answers stay unchanged");
});

test("moving to an empty field releases the old field; replacing releases the old choice", () => {
  let answers = placeAnswer(emptyAnswers(), "description", "mudstone", "marble", ids);
  answers = placeAnswer(answers, "description", "slate", "marble", ids);
  assert.deepEqual(answers.description, { slate: "marble" });
  answers = placeAnswer(answers, "description", "slate", "slate", ids);
  assert.deepEqual(answers.description, { slate: "slate" });
  assert.equal(gradeAnswers(answers, ids).filled, 1);
});

test("clearing an answer affects only its selected field", () => {
  let answers = placeAnswer(emptyAnswers(), "name", "chert", "chert", ids);
  answers = placeAnswer(answers, "description", "chert", "chert", ids);
  const next = clearAnswer(answers, "name", "chert");
  assert.deepEqual(next.name, {});
  assert.deepEqual(next.description, { chert: "chert" });
  assert.equal(gradeAnswers(next, ids).correct, 1);
  assert.equal(gradeAnswers(answers, ids).correct, 2);
});

test("a complete correct round scores sixteen; swapped descriptions score fourteen", () => {
  let answers = emptyAnswers();
  for (const id of ids) {
    answers = placeAnswer(answers, "name", id, id, ids);
    answers = placeAnswer(answers, "description", id, id, ids);
  }
  assert.equal(gradeAnswers(answers, ids).correct, 16);
  answers = placeAnswer(answers, "description", "mudstone", "sandstone", ids);
  const grade = gradeAnswers(answers, ids);
  assert.deepEqual([grade.filled, grade.correct, grade.wrong, grade.empty], [16, 14, 2, 0]);
});

test("unknown fields and choices cannot corrupt an answer set", () => {
  const answers = emptyAnswers();
  for (const args of [["other", "mudstone", "mudstone"], ["name", "missing", "mudstone"], ["name", "mudstone", "missing"]]) {
    assert.throws(() => placeAnswer(answers, ...args, ids), /Unknown/);
  }
  assert.deepEqual(answers, emptyAnswers());
});
